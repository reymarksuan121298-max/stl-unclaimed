import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Clock, Search, Filter, AlertTriangle, RefreshCw } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { dataHelpers, googleSheetsHelpers } from '../lib/api';

export default function PendingScreen({ user }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCollector, setFilterCollector] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadPending();
    }, [filterCollector, user]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCollector]);

    const loadPending = async () => {
        try {
            setLoading(true);
            const filters = {};

            if (user?.role?.toLowerCase() === 'collector' && user?.username) {
                filters.collector = user.username;
            } else if (filterCollector) {
                filters.collector = filterCollector;
            } else if (user?.role?.toLowerCase() === 'cashier' && user?.assigned_collectors && Array.isArray(user.assigned_collectors)) {
                filters.collectors = user.assigned_collectors;
            }

            const [supabaseData, sheetsData] = await Promise.allSettled([
                dataHelpers.getPending(filters),
                googleSheetsHelpers.getPendingFromSheets(user)
            ]);

            let allItems = [];
            if (supabaseData.status === 'fulfilled') {
                allItems = [...supabaseData.value];
            }

            if (sheetsData.status === 'fulfilled') {
                let filteredSheetsData = sheetsData.value;
                if (filters.collector) {
                    const filterLower = filters.collector.toLowerCase().trim();
                    const filterSimple = filterLower.split('@')[0].replace(/\s+/g, '');
                    filteredSheetsData = filteredSheetsData.filter(item => {
                        const rowCollector = (item.collector || '').toString().trim().toLowerCase();
                        const rowSimple = rowCollector.split('@')[0].replace(/\s+/g, '');
                        return rowCollector === filterLower || rowSimple === filterSimple;
                    });
                }
                allItems = [...allItems, ...filteredSheetsData];
            }

            if (user?.role?.toLowerCase() === 'cashier' && user?.assigned_collectors && Array.isArray(user.assigned_collectors)) {
                const assignedCollectorsLower = user.assigned_collectors.map(c => c.toLowerCase().split('@')[0].trim());
                allItems = allItems.filter(item => {
                    const itemCollectorLower = (item.collector || '').toLowerCase().split('@')[0].trim();
                    return assignedCollectorsLower.includes(itemCollectorLower);
                });
            }

            setItems(allItems);
        } catch (error) {
            Alert.alert('Error', 'Error loading pending items: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const idCounts = {};

    // First pass: count IDs across all fetched items
    items.forEach(item => {
        const id = item.id || item.trans_id;
        if (id) {
            idCounts[id] = (idCounts[id] || 0) + 1;
        }
    });

    const filteredItems = items.filter(item => {
        const search = searchTerm.toLowerCase();
        if (!search) return true;

        const tellerName = (item.teller_name || '').toLowerCase();
        const betNumber = (item.bet_number || '').toString().toLowerCase();
        const collector = (item.collector || '').toLowerCase();
        const transCode = String(item.id || item.trans_id || '').toLowerCase();
        const isDuplicate = (idCounts[item.id || item.trans_id] > 1);

        if (search === 'duplicate') return isDuplicate;

        return tellerName.includes(search) ||
            betNumber.includes(search) ||
            collector.includes(search) ||
            transCode.includes(search);
    });

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    // Group items for display
    const groupedByCollector = {};

    currentItems.forEach(item => {
    const collectorName = item.collector || 'Unassigned';
    if (!groupedByCollector[collectorName]) {
        groupedByCollector[collectorName] = [];
    }
    groupedByCollector[collectorName].push(item);
});

const collectors = [...new Set(items.map(i => i.collector).filter(Boolean))].sort();

if (loading) {
    return (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#ea580c" />
            <Text style={styles.loadingText}>Loading pending items...</Text>
        </View>
    );
}

return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <Clock size={32} color="#ea580c" />
                <Text style={styles.title}>Pending Items</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={loadPending}>
                <RefreshCw size={20} color="#fff" />
                <Text style={styles.refreshBtnText}>Refresh</Text>
            </TouchableOpacity>
        </View>

        {filteredItems.length > 0 && (
            <View style={styles.alertBanner}>
                <AlertTriangle size={20} color="#ea580c" />
                <View style={styles.alertTexts}>
                    <Text style={styles.alertTitle}>Attention Required</Text>
                    <Text style={styles.alertDesc}>You have {filteredItems.length} pending item(s) that require attention.</Text>
                </View>
            </View>
        )}

        {/* Total Amount Summary */}
        <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Pending Value</Text>
            <Text style={styles.summaryValue}>
                ₱{filteredItems.reduce((sum, item) => sum + (parseFloat(item.win_amount) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
        </View>

        {/* Filters */}
        <View style={styles.filterCard}>
            <View style={styles.searchBox}>
                <Search size={20} color="#9ca3af" />
                <TextInput
                    style={styles.input}
                    placeholder="Search items..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            {user?.role?.toLowerCase() === 'cashier' && (
                <View style={styles.pickerBox}>
                    <Filter size={20} color="#9ca3af" />
                    <Picker
                        selectedValue={filterCollector}
                        onValueChange={(val) => setFilterCollector(val)}
                        style={styles.picker}
                    >
                        <Picker.Item label="All Collectors" value="" />
                        {collectors.map(c => <Picker.Item key={c} label={c} value={c} />)}
                    </Picker>
                </View>
            )}
        </View>

        {/* List */}
        {currentItems.length === 0 ? (
            <View style={styles.emptyBox}>
                <Clock size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No pending items found</Text>
            </View>
        ) : (
            Object.keys(groupedByCollector).sort().map(collectorName => (
                <View key={collectorName} style={styles.groupContainer}>
                    {user?.role?.toLowerCase() === 'cashier' && (
                        <View style={styles.groupHeader}>
                            <Text style={styles.groupHeaderText}>{collectorName}</Text>
                        </View>
                    )}
                    {groupedByCollector[collectorName].map((item, index) => {
                        const isOverdue = item.days_overdue >= 3;
                        const isVerifying = item.days_overdue === 2;
                        return (
                            <View key={`${item.source}-${item.id}-${index}`} style={[styles.card, isOverdue && styles.cardDanger]}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.tellerName}>{item.teller_name || 'N/A'}</Text>
                                    <Text style={styles.drawDate}>{item.draw_date || 'N/A'}</Text>
                                </View>

                                {user?.role?.toLowerCase() === 'cashier' && (
                                    <View style={styles.row}>
                                        <Text style={styles.label}>TransCode:</Text>
                                        <Text style={styles.value}>{item.id || 'N/A'}</Text>
                                    </View>
                                )}

                                <View style={styles.row}>
                                    <Text style={styles.label}>Bet No:</Text>
                                    <Text style={styles.value}>{item.bet_number ?? 'N/A'}</Text>
                                    <Text style={styles.label}>Code:</Text>
                                    <Text style={styles.codeBadge}>{item.bet_code || 'N/A'}</Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Bet Amt:</Text>
                                    <Text style={styles.value}>₱{item.bet_amount || 0}</Text>
                                    <Text style={styles.label}>Win Amt:</Text>
                                    <Text style={styles.winAmt}>₱{item.win_amount || 0}</Text>
                                </View>

                                <View style={styles.statusRow}>
                                    <View style={styles.statusBadges}>
                                        <View style={[styles.badge, isOverdue ? styles.badgeRed : isVerifying ? styles.badgeBlue : styles.badgeYellow]}>
                                            <Text style={[styles.badgeText, isOverdue && styles.badgeTextWhite]}>
                                                {isOverdue ? 'Overdue' : isVerifying ? 'Verifying' : 'Pending'}
                                            </Text>
                                        </View>

                                        {(idCounts[item.id || item.trans_id] > 1) && (
                                            <View style={[styles.badge, styles.badgeOrange]}>
                                                <Text style={styles.badgeTextWhite}>Duplicate</Text>
                                            </View>
                                        )}
                                    </View>

                                    {isOverdue ? (
                                        <View style={[styles.badge, styles.badgeRed]}>
                                            <Text style={styles.badgeTextWhite}>For Deactivation</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.warningText}>Warning ({item.days_overdue} days)</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            ))
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <View style={styles.pagination}>
                <TouchableOpacity
                    style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                    disabled={currentPage === 1}
                    onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                    <Text style={[styles.pageBtnText, currentPage === 1 && styles.pageBtnTextDisabled]}>Prev</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>Page {currentPage} of {totalPages}</Text>
                <TouchableOpacity
                    style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                    disabled={currentPage === totalPages}
                    onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                    <Text style={[styles.pageBtnText, currentPage === totalPages && styles.pageBtnTextDisabled]}>Next</Text>
                </TouchableOpacity>
            </View>
        )}

    </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    contentContainer: { padding: 16, paddingBottom: 40 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#4b5563', fontSize: 16 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },

    refreshBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ea580c', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
    refreshBtnText: { color: '#fff', fontWeight: '600' },

    alertBanner: { backgroundColor: '#fff7ed', borderLeftWidth: 4, borderLeftColor: '#f97316', padding: 12, borderRadius: 8, flexDirection: 'row', gap: 10, marginBottom: 16 },
    alertTexts: { flex: 1 },
    alertTitle: { fontWeight: 'bold', color: '#9a3412' },
    alertDesc: { fontSize: 13, color: '#c2410c', marginTop: 2 },

    summaryCard: { backgroundColor: '#ea580c', padding: 20, borderRadius: 12, marginBottom: 16, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    summaryLabel: { color: '#ffedd5', fontSize: 14, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
    summaryValue: { color: '#ffffff', fontSize: 32, fontWeight: 'bold' },

    filterCard: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, marginBottom: 8 },
    input: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: '#111827' },

    pickerBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10 },
    picker: { flex: 1, height: 50 },

    emptyBox: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { color: '#6b7280', fontSize: 16, marginTop: 10 },

    groupContainer: { marginBottom: 16 },
    groupHeader: { backgroundColor: '#3b82f6', padding: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
    groupHeaderText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },

    card: { backgroundColor: '#fff', padding: 14, marginBottom: 10, borderRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#e5e7eb' },
    cardDanger: { backgroundColor: '#fef2f2', borderColor: '#fca5a5' },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    tellerName: { fontWeight: 'bold', fontSize: 16, color: '#111827' },
    drawDate: { fontSize: 12, color: '#6b7280' },

    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    label: { width: 65, fontSize: 13, color: '#6b7280' },
    value: { flex: 1, fontSize: 14, color: '#111827', fontWeight: '500' },
    codeBadge: { backgroundColor: '#dbeafe', color: '#1e40af', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
    winAmt: { color: '#16a34a', fontWeight: 'bold', fontSize: 14 },

    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
    statusBadges: { flexDirection: 'row', gap: 6 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeRed: { backgroundColor: '#dc2626' },
    badgeBlue: { backgroundColor: '#dbeafe' },
    badgeYellow: { backgroundColor: '#fef3c7' },
    badgeOrange: { backgroundColor: '#f97316' },
    badgeText: { fontSize: 12, fontWeight: '600' },
    badgeTextWhite: { color: '#fff', fontWeight: 'bold' },
    warningText: { color: '#9a3412', fontSize: 12, fontWeight: '600' },

    pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    pageBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 },
    pageBtnDisabled: { backgroundColor: '#f3f4f6' },
    pageBtnText: { color: '#374151', fontWeight: '600' },
    pageBtnTextDisabled: { color: '#9ca3af' },
    pageInfo: { color: '#4b5563', fontSize: 14 },
});
