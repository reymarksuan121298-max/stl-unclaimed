import React, { useEffect, useState, useCallback } from 'react'
import {
    View, Text, StyleSheet, ScrollView, RefreshControl,
    TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../context/AuthContext'
import { dataHelpers } from '../lib/supabase'

const StatCard = ({ label, value, colors, prefix = '' }) => (
    <LinearGradient colors={colors} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{prefix}{value}</Text>
    </LinearGradient>
)

export default function HomeScreen() {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const loadStats = useCallback(async () => {
        try {
            const s = await dataHelpers.getDashboardStats(user)
            setStats(s)
        } catch (err) {
            console.error('Stats error:', err)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [user])

    useEffect(() => { loadStats() }, [loadStats])

    const onRefresh = () => { setRefreshing(true); loadStats() }

    const roleLabel = user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1).toLowerCase()

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />}
        >
            {/* Header */}
            <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Good day! 👋</Text>
                    <Text style={styles.name}>{user?.fullname || user?.username}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{roleLabel}</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.body}>
                <Text style={styles.sectionTitle}>Overview</Text>

                {loading ? (
                    <ActivityIndicator color="#6366f1" size="large" style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.statsGrid}>
                        <StatCard
                            label={user?.role?.toLowerCase() === 'cashier' ? 'Cash Unclaimed' : 'Unclaimed'}
                            value={stats?.totalUnclaimed ?? 0}
                            colors={['#f59e0b', '#d97706']}
                        />
                        <StatCard
                            label="Pending"
                            value={stats?.totalPending ?? 0}
                            colors={['#ef4444', '#dc2626']}
                        />
                        <StatCard
                            label="Collections"
                            value={stats?.totalCollections ?? 0}
                            colors={['#10b981', '#059669']}
                        />
                        <StatCard
                            label="Total Revenue"
                            value={(stats?.totalRevenue ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            prefix="₱"
                            colors={['#6366f1', '#4f46e5']}
                        />
                    </View>
                )}

                {/* Info block */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>📱 Mobile Portal</Text>
                    <Text style={styles.infoText}>
                        View your pending unclaimed items and stay updated on your collections.
                        Pull down to refresh at any time.
                    </Text>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { padding: 28, paddingTop: 20, paddingBottom: 36 },
    greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
    name: { fontSize: 24, fontWeight: '800', color: '#fff' },
    roleBadge: {
        marginTop: 8, backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    roleText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    body: { padding: 20, marginTop: -16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    statCard: {
        width: '47%', borderRadius: 16, padding: 18,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 8, fontWeight: '500' },
    statValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
    infoCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 20,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    infoTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
    infoText: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
})
