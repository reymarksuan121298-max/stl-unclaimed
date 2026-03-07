import React, { useEffect, useState, useCallback } from 'react'
import {
    View, Text, StyleSheet, FlatList, RefreshControl,
    TextInput, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { useAuth } from '../context/AuthContext'
import { dataHelpers } from '../lib/supabase'
import { googleSheetsHelpers } from '../lib/googleSheets'

const normalizeCollector = (name) =>
    (name || '').toLowerCase().split('@')[0].trim()

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ days }) => {
    const bg = days >= 3 ? '#ef4444' : days >= 2 ? '#3b82f6' : '#f59e0b'
    const label = days >= 3 ? 'Overdue' : days >= 2 ? 'Verifying' : 'Pending'
    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={styles.badgeText}>{label}</Text>
        </View>
    )
}

// ── Collector section header ──────────────────────────────────────────────────
const CollectorHeader = ({ name, count, onDownload }) => (
    <View style={styles.collectorHeader}>
        <View style={{ flex: 1 }}>
            <Text style={styles.collectorName}>{name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{count} item(s)</Text>
                </View>
            </View>
        </View>
        <TouchableOpacity style={styles.downloadBtn} onPress={onDownload} activeOpacity={0.7}>
            <Text style={styles.downloadBtnText}>📥 Download</Text>
        </TouchableOpacity>
    </View>
)

// ── Pending item card ─────────────────────────────────────────────────────────
const PendingCard = ({ item }) => {
    const isOverdue = (item.days_overdue || 0) >= 3
    return (
        <View style={[styles.card, isOverdue && styles.cardOverdue]}>
            <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTeller}>{item.teller_name || 'N/A'}</Text>
                    <Text style={styles.cardSub}>{item.draw_date || 'N/A'}</Text>
                </View>
                <StatusBadge days={item.days_overdue || 0} />
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.cardRow}>
                <View style={styles.cardMeta}>
                    <Text style={styles.metaLabel}>Bet No.</Text>
                    <Text style={styles.metaValue}>{item.bet_number ?? 'N/A'}</Text>
                </View>
                <View style={styles.cardMeta}>
                    <Text style={styles.metaLabel}>Bet Code</Text>
                    <Text style={[styles.metaValue, styles.betCode]}>{item.bet_code || 'N/A'}</Text>
                </View>
                <View style={styles.cardMeta}>
                    <Text style={styles.metaLabel}>Win Amount</Text>
                    <Text style={[styles.metaValue, styles.winAmount]}>
                        ₱{parseFloat(item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </Text>
                </View>
            </View>
            {isOverdue && (
                <View style={styles.deactivationBanner}>
                    <Text style={styles.deactivationText}>⚠️ For Deactivation</Text>
                </View>
            )}
        </View>
    )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function PendingScreen() {
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

            const [supabaseRes, sheetsRes] = await Promise.allSettled([
                dataHelpers.getPending(filters),
                googleSheetsHelpers.getPendingFromSheets(user),
            ])

            let all = []
            if (supabaseRes.status === 'fulfilled') all = [...supabaseRes.value]

            if (sheetsRes.status === 'fulfilled') {
                let sheetsData = sheetsRes.value

                // For cashier: filter by assigned collectors (normalize @BRANCH)
                if (
                    user?.role?.toLowerCase() === 'cashier' &&
                    user?.assigned_collectors &&
                    Array.isArray(user.assigned_collectors)
                ) {
                    const assignedLower = user.assigned_collectors.map(normalizeCollector)
                    sheetsData = sheetsData.filter((item) =>
                        assignedLower.includes(normalizeCollector(item.collector))
                    )
                }

                // For collector: only their own items
                if (user?.role?.toLowerCase() === 'collector' && user?.username) {
                    const myName = normalizeCollector(user.username)
                    sheetsData = sheetsData.filter((item) =>
                        normalizeCollector(item.collector) === myName
                    )
                }

                all = [...all, ...sheetsData]
            }

            setItems(all)
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to load pending items.')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [user])

    useEffect(() => { loadData() }, [loadData])
    const onRefresh = () => { setRefreshing(true); loadData() }

    // ── Filter + group ────────────────────────────────────────────────────────
    const filtered = items.filter((item) => {
        const q = search.toLowerCase()
        return (
            (item.teller_name || '').toLowerCase().includes(q) ||
            String(item.bet_number || '').includes(q) ||
            (item.collector || '').toLowerCase().includes(q)
        )
    })

    // Group by collector
    const grouped = {}
    filtered.forEach((item) => {
        const key = item.collector || 'Unassigned'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(item)
    })
    const sections = Object.keys(grouped).sort().map((key) => ({
        collector: key,
        data: grouped[key],
    }))

    // Build a flat list: [{ type:'header', ... }, { type:'item', ... }, ...]
    const listData = []
    sections.forEach((section) => {
        const isCashier = user?.role?.toLowerCase() === 'cashier'
        // For cashier — strip @BRANCH for display
        const displayName = isCashier
            ? section.collector.split('@')[0]
            : section.collector
        listData.push({
            type: 'header',
            key: `h-${section.collector}`,
            name: displayName,
            fullCollectorKey: section.collector,
            count: section.data.length
        })
        section.data.forEach((item) =>
            listData.push({ type: 'item', key: `i-${item.source || 'db'}-${item.id}`, item })
        )
    })

    const handleDownload = async (collector, collectorData) => {
        try {
            const header = 'Agent Name,Draw Date,Bet Number,Bet Code,Win Amount,Status\n';
            const rows = collectorData.map(item => {
                const status = (item.days_overdue || 0) >= 3 ? 'Overdue' : 'Pending';
                return `"${item.teller_name || ''}","${item.draw_date || ''}","${item.bet_number || ''}","${item.bet_code || ''}","${item.win_amount || 0}","${status}"`;
            }).join('\n');
            const csv = header + rows;

            const filename = `Pending_${collector.split('@')[0]}_${new Date().toISOString().split('T')[0]}.csv`;
            const fileUri = FileSystem.cacheDirectory + filename;

            await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
            await Sharing.shareAsync(fileUri);
        } catch (err) {
            Alert.alert('Error', 'Failed to generate report: ' + err.message);
        }
    };

    const renderItem = ({ item: row }) => {
        if (row.type === 'header') {
            return <CollectorHeader
                name={row.name}
                count={row.count}
                onDownload={() => handleDownload(row.name, grouped[row.fullCollectorKey])}
            />
        }
        return <PendingCard item={row.item} />
    }

    return (
        <View style={styles.container}>
            {/* Search bar */}
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search teller, bet no., collector..."
                    placeholderTextColor="#9ca3af"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Summary pill */}
            {!loading && (
                <View style={styles.summaryRow}>
                    <View style={styles.summaryPill}>
                        <Text style={styles.summaryText}>
                            {user?.role?.toLowerCase() === 'collector'
                                ? `${filtered.length} pending item(s)`
                                : `${filtered.length} item(s) · ${sections.length} collector(s)`}
                        </Text>
                    </View>
                </View>
            )}

            {loading ? (
                <ActivityIndicator color="#6366f1" size="large" style={{ marginTop: 60 }} />
            ) : listData.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>🕐</Text>
                    <Text style={styles.emptyText}>No pending items found</Text>
                </View>
            ) : (
                <FlatList
                    data={listData}
                    keyExtractor={(row) => row.key}
                    renderItem={renderItem}
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
    summaryRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
    summaryPill: {
        backgroundColor: '#ede9fe', borderRadius: 20, paddingHorizontal: 14,
        paddingVertical: 6, alignSelf: 'flex-start',
    },
    summaryText: { color: '#6d28d9', fontSize: 12, fontWeight: '600' },

    // Collector header
    collectorHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#6366f1', borderRadius: 12, paddingHorizontal: 16,
        paddingVertical: 12, marginBottom: 8, marginTop: 8,
    },
    collectorName: { color: '#fff', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    countBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
    countText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    downloadBtn: {
        backgroundColor: '#4f46e5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', flexDirection: 'row', alignItems: 'center'
    },
    downloadBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

    // Card
    card: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardOverdue: { backgroundColor: '#fff5f5', borderLeftWidth: 3, borderLeftColor: '#ef4444' },
    cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardTeller: { fontSize: 15, fontWeight: '700', color: '#111827' },
    cardSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    cardDivider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
    cardMeta: { alignItems: 'center', flex: 1 },
    metaLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '500', marginBottom: 2 },
    metaValue: { fontSize: 13, color: '#374151', fontWeight: '600' },
    betCode: { color: '#1d4ed8', backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    winAmount: { color: '#059669', fontWeight: '700' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    deactivationBanner: {
        marginTop: 8, backgroundColor: '#fee2e2', borderRadius: 8,
        paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center',
    },
    deactivationText: { color: '#dc2626', fontSize: 12, fontWeight: '700' },

    // Empty
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, color: '#9ca3af', fontWeight: '500' },
})
