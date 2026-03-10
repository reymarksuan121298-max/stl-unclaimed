import React, { useEffect, useState, useCallback } from 'react'
import {
    View, Text, StyleSheet, FlatList, RefreshControl,
    TextInput, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import ViewShot, { captureRef } from 'react-native-view-shot'
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
const CollectorHeader = ({ name, count, total, onDownload, onDeposit, isCashier }) => (
    <View style={styles.collectorHeader}>
        <View style={{ flex: 1 }}>
            <Text style={styles.collectorName}>{name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{count} item(s)</Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                    <Text style={styles.countText}>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                </View>
            </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
            {isCashier && (
                <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: '#10b981', borderColor: 'rgba(255,255,255,0.3)' }]} onPress={onDeposit} activeOpacity={0.7}>
                    <Text style={styles.downloadBtnText}>✅ Deposit</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.downloadBtn} onPress={onDownload} activeOpacity={0.7}>
                <Text style={styles.downloadBtnText}>📥 Save</Text>
            </TouchableOpacity>
        </View>
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
    const [reportData, setReportData] = useState(null)
    const viewShotRef = React.useRef(null)

    const loadData = useCallback(async () => {
        try {
            let assigned = user?.assigned_collectors || []
            if (typeof assigned === 'string') {
                try { assigned = JSON.parse(assigned) } catch { assigned = [] }
            }

            const filters = {}
            if (user?.role?.toLowerCase() === 'collector' && user?.username) {
                filters.collector = user.username
            } else if (
                user?.role?.toLowerCase() === 'cashier' &&
                assigned && Array.isArray(assigned)
            ) {
                filters.collectors = assigned
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

    // Group by collector (normalized name for merging @GFLDN etc)
    const grouped = {}
    filtered.forEach((item) => {
        // We Use the collector field as-is for the key to preserve branch info if needed,
        // or we can normalize it to merge. Common request is to merge by base name.
        const key = item.collector || 'Unassigned'
        if (!grouped[key]) grouped[key] = { items: [], total: 0 }
        grouped[key].items.push(item)
        grouped[key].total += parseFloat(item.win_amount || 0)
    })

    const sections = Object.keys(grouped).sort().map((key) => ({
        collector: key,
        data: grouped[key].items,
        total: grouped[key].total
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
            count: section.data.length,
            total: section.total
        })
        section.data.forEach((item) =>
            listData.push({ type: 'item', key: `i-${item.source || 'db'}-${item.id}`, item })
        )
    })

    const handleSaveImage = async (collector, collectorData) => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync(true); // true = writeOnly
            if (status !== 'granted') {
                return Alert.alert('Permission needed', 'Please allow access to your photo gallery to save the report.');
            }

            setReportData({ name: collector, items: collectorData })

            // Small delay to ensure the report view renders
            setTimeout(async () => {
                if (!viewShotRef.current) return

                try {
                    const uri = await captureRef(viewShotRef.current, {
                        format: 'png',
                        quality: 0.9,
                    })

                    await MediaLibrary.saveToLibraryAsync(uri);

                    Alert.alert('Success', `Report for ${collector} saved to your gallery!`);
                } catch (saveErr) {
                    Alert.alert('Save Error', 'Failed to save to gallery: ' + saveErr.message);
                } finally {
                    setReportData(null)
                }
            }, 500)
        } catch (err) {
            Alert.alert('Error', 'Failed to generate image report: ' + err.message)
            setReportData(null)
        }
    };

    const handleDeposit = (collectorKey) => {
        Alert.alert(
            "Confirm Deposit",
            `Are you sure you want to mark all pending items for ${collectorKey} as deposited?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Deposit All",
                    onPress: async () => {
                        try {
                            setRefreshing(true)
                            const success = await googleSheetsHelpers.markCollectorDeposited(collectorKey)
                            if (success) {
                                Alert.alert("Success", `Pending items for ${collectorKey} marked as deposited.`)
                                loadData()
                            } else {
                                Alert.alert("Error", "Could not confirm update with Google Sheets.")
                                setRefreshing(false)
                            }
                        } catch (err) {
                            Alert.alert("Error", err.message)
                            setRefreshing(false)
                        }
                    }
                }
            ]
        )
    }

    const renderItem = ({ item: row }) => {
        if (row.type === 'header') {
            const isCashier = user?.role?.toLowerCase() === 'cashier'
            return <CollectorHeader
                name={row.name}
                count={row.count}
                total={row.total}
                isCashier={isCashier}
                onDownload={() => handleSaveImage(row.name, grouped[row.fullCollectorKey].items)}
                onDeposit={() => handleDeposit(row.fullCollectorKey)}
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
                                : `${filtered.length} item(s) across ${sections.length} collector(s)`}
                        </Text>
                    </View>
                    {filtered.length > 0 && (
                        <View style={[styles.summaryPill, { backgroundColor: '#dcfce7', marginLeft: 8 }]}>
                            <Text style={[styles.summaryText, { color: '#166534' }]}>
                                ₱{filtered.reduce((sum, i) => sum + parseFloat(i.win_amount || 0), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    )}
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

            {/* Hidden ViewShot for report generation */}
            {reportData && (
                <View style={styles.hiddenContainer}>
                    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.reportWrapper}>
                        <View style={styles.reportHeader}>
                            <Text style={styles.reportTitle}>PENDING ITEMS REPORT</Text>
                            <Text style={styles.reportCollector}>{reportData.name}</Text>
                            <Text style={styles.reportDate}>{new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                        </View>

                        <View style={styles.reportContent}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.th, { flex: 2 }]}>AGENT</Text>
                                <Text style={[styles.th, { flex: 1.5 }]}>DRAW DATE</Text>
                                <Text style={[styles.th, { flex: 1 }]}>BET #</Text>
                                <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>WIN AMT</Text>
                            </View>

                            {reportData.items.map((item, idx) => (
                                <View key={idx} style={[styles.tableRow, idx % 2 === 0 ? styles.rowEven : null]}>
                                    <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>{item.teller_name}</Text>
                                    <Text style={[styles.td, { flex: 1.5 }]}>{item.draw_date}</Text>
                                    <Text style={[styles.td, { flex: 1 }]}>{item.bet_number}</Text>
                                    <Text style={[styles.td, { flex: 1.2, textAlign: 'right', fontWeight: 'bold' }]}>
                                        ₱{parseFloat(item.win_amount || 0).toLocaleString()}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.reportFooter}>
                            <Text style={styles.totalLabel}>TOTAL PENDING ITEMS: {reportData.items.length}</Text>
                            <Text style={styles.totalValue}>
                                TOTAL AMOUNT: ₱{reportData.items.reduce((sum, item) => sum + parseFloat(item.win_amount || 0), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </Text>
                            <Text style={styles.footerNote}>Generated via STL Unclaimed App</Text>
                        </View>
                    </ViewShot>
                </View>
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

    // Report Styles
    hiddenContainer: { position: 'absolute', left: -9999, top: 0, width: 375 },
    reportWrapper: { backgroundColor: '#fff', padding: 25 },
    reportHeader: { alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#6366f1', paddingBottom: 15, marginBottom: 20 },
    reportTitle: { fontSize: 18, fontWeight: '900', color: '#1f2937', letterSpacing: 1 },
    reportCollector: { fontSize: 22, fontWeight: '900', color: '#6366f1', marginTop: 5, textTransform: 'uppercase' },
    reportDate: { fontSize: 12, color: '#6b7280', marginTop: 5 },
    reportContent: { marginBottom: 20 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 10, borderRadius: 6 },
    th: { fontSize: 10, fontWeight: '800', color: '#4b5563' },
    tableRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    rowEven: { backgroundColor: '#fafafa' },
    td: { fontSize: 11, color: '#1f2937' },
    reportFooter: { borderTopWidth: 2, borderTopColor: '#f3f4f6', paddingTop: 15, alignItems: 'center' },
    totalLabel: { fontSize: 12, fontWeight: '700', color: '#4b5563', marginBottom: 5 },
    totalValue: { fontSize: 20, fontWeight: '900', color: '#059669', marginBottom: 10 },
    footerNote: { fontSize: 10, fontStyle: 'italic', color: '#9ca3af' },
})
