import React, { useEffect, useState, useCallback } from 'react'
import {
    View, Text, StyleSheet, FlatList, RefreshControl,
    TextInput, ActivityIndicator, Alert, TouchableOpacity
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { dataHelpers } from '../lib/supabase'

const CollectionCard = ({ item }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{item.teller_name || 'N/A'}</Text>
                    <Text style={styles.cardSub}>{item.draw_date || 'N/A'}</Text>
                </View>
                <View style={styles.modeBadge}>
                    <Text style={styles.modeText}>{item.mode || 'N/A'}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Bet No.</Text>
                    <Text style={styles.metaValue}>{item.bet_number || 'N/A'}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Bet Code</Text>
                    <Text style={styles.metaValue}>{item.bet_code || 'N/A'}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Win Amount</Text>
                    <Text style={[styles.metaValue, styles.winAmount]}>
                        ₱{parseFloat(item.amount || item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </Text>
                </View>
            </View>

            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Collector</Text>
                    <Text style={styles.metaValue}>{item.collector || 'N/A'}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Area</Text>
                    <Text style={styles.metaValue}>{item.area || 'N/A'}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Net</Text>
                    <Text style={[styles.metaValue, styles.netAmount]}>
                        ₱{parseFloat(item.net || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default function CollectionsScreen() {
    const { user } = useAuth()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [search, setSearch] = useState('')

    const loadData = useCallback(async () => {
        try {
            const filters = {}
            if (user?.role?.toLowerCase() === 'collector' && user?.username) {
                filters.collector = user.username
            }
            const data = await dataHelpers.getCollections(filters)
            setItems(data)
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to load collections.')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [user])

    useEffect(() => { loadData() }, [loadData])
    const onRefresh = () => { setRefreshing(true); loadData() }

    const filtered = items.filter((item) => {
        const q = search.toLowerCase()
        const isCashier = user?.role?.toLowerCase() === 'cashier'
        const matchesSearch = (
            (item.teller_name || '').toLowerCase().includes(q) ||
            (item.bet_number || '').toLowerCase().includes(q) ||
            (item.collector || '').toLowerCase().includes(q)
        )
        const matchesCashier = !isCashier || item.mode?.toLowerCase() === 'cash'
        return matchesSearch && matchesCashier
    })

    const totalNet = filtered.reduce((sum, item) => sum + parseFloat(item.net || 0), 0)

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search name, bet no, collector..."
                    placeholderTextColor="#9ca3af"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {!loading && (
                <View style={styles.summaryRow}>
                    <View style={styles.summaryPill}>
                        <Text style={styles.summaryText}>{filtered.length} item(s)</Text>
                    </View>
                    <View style={[styles.summaryPill, { backgroundColor: '#dcfce7' }]}>
                        <Text style={[styles.summaryText, { color: '#166534' }]}>
                            Sum: ₱{totalNet.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>
            )}

            {loading ? (
                <ActivityIndicator color="#6366f1" size="large" style={{ marginTop: 60 }} />
            ) : filtered.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>💰</Text>
                    <Text style={styles.emptyText}>No collections found</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => <CollectionCard item={item} />}
                    contentContainerStyle={{ padding: 16, paddingTop: 8 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />
                    }
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    searchBar: { backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    searchInput: {
        backgroundColor: '#f9fafb', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb',
        paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827',
    },
    summaryRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
    summaryPill: { backgroundColor: '#ede9fe', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
    summaryText: { color: '#6d28d9', fontSize: 12, fontWeight: '600' },

    card: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    cardName: { fontSize: 15, fontWeight: '700', color: '#111827' },
    cardSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    modeBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    modeText: { fontSize: 10, fontWeight: '700', color: '#4b5563' },
    divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 12 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    metaItem: { flex: 1 },
    metaLabel: { fontSize: 10, color: '#9ca3af', marginBottom: 2 },
    metaValue: { fontSize: 13, fontWeight: '600', color: '#374151' },
    winAmount: { color: '#059669' },
    netAmount: { color: '#6366f1', fontWeight: '800' },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, color: '#9ca3af', fontWeight: '500' },
})
