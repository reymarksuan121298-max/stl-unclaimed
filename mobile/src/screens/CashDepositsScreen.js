import React, { useEffect, useState, useCallback } from 'react'
import {
    View, Text, StyleSheet, FlatList, RefreshControl, Image,
    TextInput, ActivityIndicator, Alert, TouchableOpacity, Modal, ScrollView
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '../context/AuthContext'
import { dataHelpers } from '../lib/supabase'

const DepositCard = ({ item, onDeposit }) => {
    const isDeposited = !!item.cash_deposited
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{item.teller_name || 'N/A'}</Text>
                    <Text style={styles.cardSub}>{item.area || 'N/A'} · {item.bet_number || 'N/A'}</Text>
                </View>
                <View style={[styles.statusBadge, isDeposited ? styles.statusDeposited : styles.statusPending]}>
                    <Text style={[styles.statusText, { color: isDeposited ? '#065f46' : '#92400e' }]}>{isDeposited ? 'Deposited' : 'Pending'}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Win Amount</Text>
                    <Text style={styles.metaValue}>₱{parseFloat(item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Net Amount</Text>
                    <Text style={[styles.metaValue, styles.highlightValue]}>₱{parseFloat(item.net || item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                </View>
            </View>

            {!isDeposited && (
                <TouchableOpacity style={styles.depositBtn} onPress={() => onDeposit(item)}>
                    <Text style={styles.depositBtnText}>Record Deposit</Text>
                </TouchableOpacity>
            )}

            {isDeposited && (
                <View style={styles.depositInfo}>
                    <Text style={styles.infoLabel}>Ref: {item.deposit_reference || 'N/A'}</Text>
                    <Text style={styles.infoLabel}>Bank: {item.bank_name || 'N/A'}</Text>
                </View>
            )}
        </View>
    )
}

export default function CashDepositsScreen() {
    const { user } = useAuth()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [search, setSearch] = useState('')

    // Modal state
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [formData, setFormData] = useState({
        bank_name: '',
        receiver_contact: '',
        deposit_reference: '',
        deposit_amount: '',
        deposit_receipt: ''
    })
    const [uploading, setUploading] = useState(false)
    const [isBatch, setIsBatch] = useState(false)

    const pendingTotal = items.filter(i => !i.cash_deposited).reduce((s, i) => s + (parseFloat(i.net || i.win_amount || 0)), 0)
    const pendingCount = items.filter(i => !i.cash_deposited).length
    const alreadyDepositedTotal = items.filter(i => i.cash_deposited).reduce((s, i) => s + (parseFloat(i.net || i.win_amount || 0)), 0)
    const alreadyDepositedCount = items.filter(i => i.cash_deposited).length

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
            base64: true
        });

        if (!result.canceled && result.assets[0].base64) {
            try {
                setUploading(true);
                const fileName = `receipt_${Date.now()}.jpg`;
                const publicUrl = await dataHelpers.uploadFile('unclaimed-receipts', `deposits/${fileName}`, result.assets[0].base64);
                setFormData({ ...formData, deposit_receipt: publicUrl });
            } catch (err) {
                Alert.alert('Upload Error', err.message);
            } finally {
                setUploading(false);
            }
        }
    };

    const loadData = useCallback(async () => {
        try {
            const data = await dataHelpers.getPendingCashDeposits()
            setItems(data)
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to load deposits.')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])
    const onRefresh = () => { setRefreshing(true); loadData() }

    const filtered = items.filter((item) => {
        const q = search.toLowerCase()
        return (
            (item.teller_name || '').toLowerCase().includes(q) ||
            (item.bet_number || '').toLowerCase().includes(q) ||
            (item.collector || '').toLowerCase().includes(q)
        )
    })

    const handleOpenDeposit = (item) => {
        setSelectedItem(item)
        setIsBatch(false)
        setFormData({
            bank_name: '',
            receiver_contact: '',
            deposit_reference: '',
            deposit_amount: String(item.net || item.win_amount || 0),
            deposit_receipt: ''
        })
        setModalVisible(true)
    }

    const handleOpenBatchDeposit = () => {
        if (pendingCount === 0) {
            Alert.alert('Note', 'No pending items to deposit.')
            return
        }
        setIsBatch(true)
        setFormData({
            bank_name: '',
            receiver_contact: '',
            deposit_reference: '',
            deposit_amount: String(pendingTotal),
            deposit_receipt: ''
        })
        setModalVisible(true)
    }

    const handleSubmit = async () => {
        if (!formData.bank_name || !formData.receiver_contact || !formData.deposit_reference) {
            Alert.alert('Error', 'Please fill in all required fields.')
            return
        }

        if (!formData.deposit_receipt && !uploading) {
            Alert.alert('Error', 'Please upload a receipt image first.')
            return
        }

        try {
            setLoading(true)
            if (isBatch) {
                const ids = items.filter(i => !i.cash_deposited).map(i => i.id)
                await dataHelpers.batchDepositCash(ids, formData, user?.fullname || user?.username)
            } else {
                await dataHelpers.depositCash(selectedItem.id, formData, user?.fullname || user?.username)
            }
            setModalVisible(false)
            Alert.alert('Success', `Deposit recorded successfully${isBatch ? ' for all items' : ''}.`)
            loadData()
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to record deposit.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search name, bet no, area..."
                    placeholderTextColor="#9ca3af"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View style={styles.summaryContainer}>
                <View style={[styles.summaryCard, styles.pendingCard]}>
                    <View style={styles.summaryInfo}>
                        <Text style={styles.summaryLabel}>Pending Deposits</Text>
                        <Text style={styles.summaryValue}>₱{pendingTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                        <Text style={styles.summaryCount}>{pendingCount} item(s) awaiting deposit</Text>
                    </View>
                    {pendingCount > 0 && (
                        <TouchableOpacity style={styles.batchBtn} onPress={handleOpenBatchDeposit}>
                            <Text style={styles.batchBtnText}>🚀 Deposit All Cash (₱{pendingTotal.toLocaleString('en-PH', { maximumFractionDigits: 0 })})</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[styles.summaryCard, styles.alreadyCard]}>
                    <View style={styles.summaryInfo}>
                        <Text style={styles.summaryLabel}>Already Deposited</Text>
                        <Text style={[styles.summaryValue, { color: '#059669' }]}>₱{alreadyDepositedTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                        <Text style={styles.summaryCount}>{alreadyDepositedCount} items deposited</Text>
                    </View>
                </View>
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator color="#6366f1" size="large" style={{ marginTop: 60 }} />
            ) : filtered.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>🏦</Text>
                    <Text style={styles.emptyText}>No cash collections for deposit</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => <DepositCard item={item} onDeposit={handleOpenDeposit} />}
                    contentContainerStyle={{ padding: 16, paddingTop: 8 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />
                    }
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Record Deposit</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form}>
                            <View style={styles.formItem}>
                                <Text style={styles.label}>Bank Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. BDO, Gcash, etc."
                                    value={formData.bank_name}
                                    onChangeText={(v) => setFormData({ ...formData, bank_name: v })}
                                />
                            </View>

                            <View style={styles.formItem}>
                                <Text style={styles.label}>Account / Contact #</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter receiver details"
                                    value={formData.receiver_contact}
                                    onChangeText={(v) => setFormData({ ...formData, receiver_contact: v })}
                                />
                            </View>

                            <View style={styles.formItem}>
                                <Text style={styles.label}>Reference Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter bank reference #"
                                    value={formData.deposit_reference}
                                    onChangeText={(v) => setFormData({ ...formData, deposit_reference: v })}
                                />
                            </View>

                            <View style={styles.formItem}>
                                <Text style={styles.label}>Amount to Deposit</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: '#f3f4f6' }]}
                                    value={formData.deposit_amount}
                                    keyboardType="numeric"
                                    editable={false}
                                />
                            </View>

                            <View style={styles.formItem}>
                                <Text style={styles.label}>Receipt Image *</Text>
                                <TouchableOpacity
                                    style={[styles.imageBtn, formData.deposit_receipt ? styles.imageBtnSuccess : null]}
                                    onPress={pickImage}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.imageBtnText}>
                                            {formData.deposit_receipt ? '✓ Image Selected' : '📁 Pick Receipt Image'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                {formData.deposit_receipt ? (
                                    <Image source={{ uri: formData.deposit_receipt }} style={styles.previewImage} />
                                ) : null}
                            </View>

                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Confirm Deposit</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    summaryScroll: { maxHeight: 180, marginBottom: 8 },
    summaryContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    summaryCard: {
        padding: 16, borderRadius: 16,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    pendingCard: { backgroundColor: '#fff', borderLeftWidth: 5, borderLeftColor: '#f97316' },
    alreadyCard: { backgroundColor: '#fff', borderLeftWidth: 5, borderLeftColor: '#059669' },
    summaryInfo: { marginBottom: 12 },
    summaryLabel: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 4 },
    summaryValue: { fontSize: 22, fontWeight: '900', color: '#111827' },
    summaryCount: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
    batchBtn: {
        backgroundColor: '#f97316', paddingVertical: 8, borderRadius: 8, alignItems: 'center',
    },
    batchBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
    card: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    cardName: { fontSize: 15, fontWeight: '700', color: '#111827' },
    cardSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusPending: { backgroundColor: '#fef3c7' },
    statusDeposited: { backgroundColor: '#d1fae5' },
    statusText: { fontSize: 10, fontWeight: '700', color: '#92400e' },
    divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 12 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    metaItem: { flex: 1 },
    metaLabel: { fontSize: 10, color: '#9ca3af', marginBottom: 2 },
    metaValue: { fontSize: 13, fontWeight: '600', color: '#374151' },
    highlightValue: { color: '#059669', fontWeight: '800' },
    depositBtn: {
        backgroundColor: '#6366f1', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 4,
    },
    depositBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    depositInfo: { marginTop: 4, padding: 8, backgroundColor: '#f9fafb', borderRadius: 8 },
    infoLabel: { fontSize: 11, color: '#6b7280', marginBottom: 2 },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, color: '#9ca3af', fontWeight: '500' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: '60%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
    closeBtn: { fontSize: 20, color: '#9ca3af', fontWeight: '700' },
    form: { flex: 1 },
    formItem: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
    input: {
        backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: '#111827',
    },
    submitBtn: {
        backgroundColor: '#059669', paddingVertical: 14, borderRadius: 12, alignItems: 'center',
        marginTop: 10, marginBottom: 40,
        shadowColor: '#059669', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    imageBtn: {
        backgroundColor: '#4f46e5', paddingVertical: 12, borderRadius: 10, alignItems: 'center',
        borderStyle: 'dashed', borderWidth: 1, borderColor: '#fff'
    },
    imageBtnSuccess: { backgroundColor: '#059669', borderStyle: 'solid' },
    imageBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    previewImage: { width: '100%', height: 180, borderRadius: 12, marginTop: 12, resizeMode: 'cover' },
})
