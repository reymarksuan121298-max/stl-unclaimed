import React, { useEffect, useState, useCallback } from 'react'
import {
    View, Text, StyleSheet, FlatList, RefreshControl, Platform,
    TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, ScrollView,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '../context/AuthContext'
import { dataHelpers } from '../lib/supabase'

const STATUS_COLORS = {
    Unclaimed: { bg: '#fef3c7', text: '#92400e' },
    Uncollected: { bg: '#dbeafe', text: '#1e40af' },
    default: { bg: '#f3f4f6', text: '#374151' },
}

const MODES = ['Cash', 'Gcash', 'PayMaya', 'Bank Transfer']
const PAYMENT_TYPES = ['Full Payment', 'Partial Payment']
const STATUSES = ['Unclaimed', 'Uncollected', 'Collected', 'Cancelled']

const UnclaimedCard = ({ item, onMarkCollected, isCashier }) => {
    // ... same card code ...
    const s = STATUS_COLORS[item.status] || STATUS_COLORS.default
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{item.teller_name || 'N/A'}</Text>
                    <Text style={styles.cardArea}>{item.area || ''} · {item.franchise_name || ''}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.text }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metaGrid}>
                <MetaItem label="Collector" value={item.collector || 'N/A'} />
                <MetaItem label="Mode" value={item.mode || 'N/A'} />
                <MetaItem label="Win Amount" value={`₱${parseFloat(item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} highlight />
                <MetaItem label="Bet Amount" value={`₱${parseFloat(item.bet_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
                <MetaItem label="Returned" value={item.return_date ? new Date(item.return_date).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'} />
            </View>

            {isCashier && item.status === 'Unclaimed' && (
                <TouchableOpacity
                    style={styles.collectBtn}
                    onPress={() => onMarkCollected(item)}
                    activeOpacity={0.85}
                >
                    <Text style={styles.collectBtnText}>✓ Mark as Collected</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

const MetaItem = ({ label, value, highlight }) => (
    // ... same meta code ...
    <View style={styles.metaItem}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={[styles.metaValue, highlight && styles.metaHighlight]}>{value}</Text>
    </View>
)

export default function UnclaimedScreen() {
    const { user } = useAuth()
    const isCashier = user?.role?.toLowerCase() === 'cashier'
    const isCollector = user?.role?.toLowerCase() === 'collector'
    const canCreate = ['admin', 'specialist', 'cashier'].includes(user?.role?.toLowerCase())

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [search, setSearch] = useState('')

    // Lookup state
    const [lookups, setLookups] = useState({
        franchises: [],
        areas: [],
        betCodes: [],
        collectors: []
    })

    // Create Modal State
    const [modalVisible, setModalVisible] = useState(false)
    const [creating, setCreating] = useState(false)
    const [formData, setFormData] = useState({
        teller_name: '',
        bet_number: '',
        bet_code: '',
        draw_date: new Date().toISOString().split('T')[0],
        bet_amount: '',
        win_amount: '',
        charge_amount: '0',
        mode: 'Cash',
        payment_type: 'Full Payment',
        franchise_name: '',
        area: '',
        collector: '',
        status: 'Unclaimed',
        return_date: new Date().toISOString().slice(0, 16),
        receipt_image: ''
    })
    const [uploading, setUploading] = useState(false)

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
                const fileName = `unclaimed_${Date.now()}.jpg`;
                const publicUrl = await dataHelpers.uploadFile('unclaimed-receipts', `unclaimed/${fileName}`, result.assets[0].base64);
                setFormData({ ...formData, receipt_image: publicUrl });
            } catch (err) {
                Alert.alert('Upload Error', err.message);
            } finally {
                setUploading(false);
            }
        }
    };

    // Date Picker State
    const [showDrawPicker, setShowDrawPicker] = useState(false)
    const [showReturnDatePicker, setShowReturnDatePicker] = useState(false)
    const [showReturnTimePicker, setShowReturnTimePicker] = useState(false)

    const onDrawDateChange = (event, selectedDate) => {
        setShowDrawPicker(false)
        if (event.type === 'set' && selectedDate) {
            const formatted = selectedDate.toISOString().split('T')[0]
            setFormData({ ...formData, draw_date: formatted })
        }
    }

    const onReturnDateChange = (event, selectedDate) => {
        setShowReturnDatePicker(false)
        if (event.type === 'set' && selectedDate) {
            // Store the intermediate date result
            setFormData(prev => ({ ...prev, _temp_return_date: selectedDate }))
            // Show time picker next
            setTimeout(() => setShowReturnTimePicker(true), 500)
        }
    }

    const onReturnTimeChange = (event, selectedTime) => {
        setShowReturnTimePicker(false)
        if (event.type === 'set' && selectedTime) {
            const baseDate = formData._temp_return_date || new Date()
            const final = new Date(
                baseDate.getFullYear(),
                baseDate.getMonth(),
                baseDate.getDate(),
                selectedTime.getHours(),
                selectedTime.getMinutes()
            )
            // Store as full ISO string for DB compatibility
            setFormData({ ...formData, return_date: final.toISOString() })
        }
    }

    const loadData = useCallback(async () => {
        try {
            const filters = { status: 'Unclaimed' }
            if (isCashier) filters.mode = 'Cash'
            if (isCollector && user?.username) filters.collector = user.username

            const [data, lookupData, colls] = await Promise.all([
                dataHelpers.getUnclaimed(filters),
                dataHelpers.getLookupData(),
                dataHelpers.getUsers({ role: 'collector', status: 'active' })
            ])

            setItems(data)

            // Set defaults if lookup is empty but provide hardcoded fallbacks just in case
            const finalLookups = {
                franchises: lookupData.franchises.length ? lookupData.franchises : ['5A Royal Gaming OPC', 'Imperial Gnaing OPC', 'Glowing Fortune OPC'],
                areas: lookupData.areas.length ? lookupData.areas : ['BAROY', 'TUBOD', 'LALA'],
                betCodes: lookupData.betCodes.length ? lookupData.betCodes : ['S3', 'L3', '4D'],
                collectors: (() => {
                    const allColls = colls.map(c => c.username);
                    if (isCashier && user?.assigned_collectors?.length > 0) {
                        const assigned = user.assigned_collectors.map(c => (c || '').split('@')[0].trim().toLowerCase());
                        return allColls.filter(u => assigned.includes((u || '').split('@')[0].trim().toLowerCase())).sort();
                    }
                    return allColls.sort();
                })()
            }
            setLookups(finalLookups)

            // Auto-set defaults for form if empty
            setFormData(prev => ({
                ...prev,
                franchise_name: prev.franchise_name || finalLookups.franchises[0] || '',
                bet_code: prev.bet_code || finalLookups.betCodes[0] || ''
            }))

        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to load items.')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [user, isCashier, isCollector])

    useEffect(() => { loadData() }, [loadData])
    const onRefresh = () => { setRefreshing(true); loadData() }

    const handleSelect = (field, options) => {
        if (!options || options.length === 0) {
            Alert.alert('Note', 'No options available in database yet.')
            return
        }
        Alert.alert(
            `Select ${field.replace('_', ' ')}`,
            '',
            options.map(o => ({
                text: o,
                onPress: () => setFormData({ ...formData, [field]: o })
            })).concat([{ text: 'Cancel', style: 'cancel' }])
        )
    }

    const handleCreateSubmit = async () => {
        if (!formData.teller_name || !formData.bet_number || !formData.win_amount) {
            Alert.alert('Error', 'Please fill in all required fields.')
            return
        }

        try {
            setCreating(true)
            const win = parseFloat(formData.win_amount || 0)
            const charge = parseFloat(formData.charge_amount || 0)
            const { _temp_return_date, ...dataToSubmit } = formData;
            const payload = {
                ...dataToSubmit,
                win_amount: win,
                charge_amount: charge,
                bet_amount: parseFloat(formData.bet_amount || 0),
                net: win - charge,
                created_by: user?.fullname || user?.username || 'Mobile App'
            }
            await dataHelpers.createUnclaimed(payload)
            setModalVisible(false)
            Alert.alert('Success', 'Unclaimed item added successfully.')
            resetForm()
            loadData()
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to create item.')
        } finally {
            setCreating(false)
        }
    }

    const resetForm = () => {
        setFormData({
            teller_name: '',
            bet_number: '',
            bet_code: lookups.betCodes[0] || '',
            draw_date: new Date().toISOString().split('T')[0],
            bet_amount: '',
            win_amount: '',
            charge_amount: '0',
            mode: 'Cash',
            payment_type: 'Full Payment',
            franchise_name: lookups.franchises[0] || '',
            area: '',
            collector: '',
            status: 'Unclaimed',
            return_date: new Date().toISOString().slice(0, 16),
            receipt_image: ''
        })
    }

    const filtered = items.filter((item) => {
        const q = search.toLowerCase()
        return (
            (item.teller_name || '').toLowerCase().includes(q) ||
            (item.collector || '').toLowerCase().includes(q) ||
            (item.area || '').toLowerCase().includes(q)
        )
    })

    const winVal = parseFloat(formData.win_amount || 0)
    const chargeVal = parseFloat(formData.charge_amount || 0)
    const netVal = winVal - chargeVal

    const handleMarkCollected = (item) => {
        Alert.alert(
            'Mark as Collected',
            `Mark this item as collected?\n\nTeller: ${item.teller_name}\nWin: ₱${parseFloat(item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            await dataHelpers.markAsCollected(item.id, user?.fullname || user?.username, user?.role)
                            Alert.alert('Success', 'Item marked as collected.')
                            loadData()
                        } catch (err) {
                            Alert.alert('Error', err.message)
                        }
                    },
                },
            ]
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search teller, collector, area..."
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
                    {isCashier && (
                        <View style={[styles.summaryPill, { backgroundColor: '#dcfce7' }]}>
                            <Text style={[styles.summaryText, { color: '#166534' }]}>Cash Mode Only</Text>
                        </View>
                    )}
                </View>
            )}

            {loading ? (
                <ActivityIndicator color="#6366f1" size="large" style={{ marginTop: 60 }} />
            ) : filtered.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={styles.emptyText}>No unclaimed items found</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <UnclaimedCard
                            item={item}
                            onMarkCollected={handleMarkCollected}
                            isCashier={isCashier}
                        />
                    )}
                    contentContainerStyle={{ padding: 16, paddingTop: 8 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />
                    }
                />
            )}

            {canCreate && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            )}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBody}>
                        <View style={styles.modalHeaderBanner}>
                            <Text style={styles.modalTitleWhite}>Add Unclaimed Item</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBox}>
                                <Text style={styles.closeX}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll} contentContainerStyle={{ padding: 20 }}>
                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Agent Name</Text>
                                        <TextInput
                                            style={styles.formInput}
                                            placeholder="Enter agent name"
                                            value={formData.teller_name}
                                            onChangeText={(v) => setFormData({ ...formData, teller_name: v })}
                                        />
                                    </View>
                                </View>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Bet Number</Text>
                                        <TextInput
                                            style={styles.formInput}
                                            placeholder="BET-000"
                                            value={formData.bet_number}
                                            onChangeText={(v) => setFormData({ ...formData, bet_number: v })}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Bet Code</Text>
                                        <TouchableOpacity style={styles.selectInput} onPress={() => handleSelect('bet_code', lookups.betCodes)}>
                                            <Text style={styles.selectText}>{formData.bet_code || 'Select Bet Code'}</Text>
                                            <Text style={styles.arrow}>▼</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.helperText}>Type of bet (S3, L3, S2, 4D, etc.)</Text>
                                    </View>
                                </View>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Draw Date</Text>
                                        <TouchableOpacity
                                            style={styles.selectInput}
                                            onPress={() => setShowDrawPicker(true)}
                                        >
                                            <Text style={styles.selectText}>{formData.draw_date || 'Select Date'}</Text>
                                            <Text style={styles.arrow}>📅</Text>
                                        </TouchableOpacity>
                                        {showDrawPicker && (
                                            <DateTimePicker
                                                value={formData.draw_date ? new Date(formData.draw_date) : new Date()}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                onChange={onDrawDateChange}
                                            />
                                        )}
                                    </View>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Bet Amount</Text>
                                        <TextInput
                                            style={styles.formInput}
                                            keyboardType="numeric"
                                            placeholder="0.00"
                                            value={formData.bet_amount}
                                            onChangeText={(v) => setFormData({ ...formData, bet_amount: v })}
                                        />
                                    </View>
                                </View>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Win Amount</Text>
                                        <TextInput
                                            style={styles.formInput}
                                            keyboardType="numeric"
                                            placeholder="0.00"
                                            value={formData.win_amount}
                                            onChangeText={(v) => setFormData({ ...formData, win_amount: v })}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Charge Amount</Text>
                                        <TextInput
                                            style={styles.formInput}
                                            keyboardType="numeric"
                                            placeholder="0.00"
                                            value={formData.charge_amount}
                                            onChangeText={(v) => setFormData({ ...formData, charge_amount: v })}
                                        />
                                        <Text style={styles.helperText}>No charge for Cash mode</Text>
                                    </View>
                                </View>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Net Amount (Calculated)</Text>
                                        <View style={[styles.formInput, styles.readOnlyInput]}>
                                            <Text style={styles.readOnlyText}>₱{netVal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                                        </View>
                                        <Text style={styles.helperText}>Win Amount - Charge Amount</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Mode</Text>
                                        <TouchableOpacity style={styles.selectInput} onPress={() => !isCashier && handleSelect('mode', MODES)}>
                                            <Text style={styles.selectText}>{formData.mode}</Text>
                                            <Text style={styles.arrow}>▼</Text>
                                        </TouchableOpacity>
                                        {isCashier && <Text style={[styles.helperText, { color: '#059669' }]}>Cashiers can only add Cash items</Text>}
                                    </View>
                                </View>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Payment Type</Text>
                                        <TouchableOpacity style={styles.selectInput} onPress={() => handleSelect('payment_type', PAYMENT_TYPES)}>
                                            <Text style={styles.selectText}>{formData.payment_type}</Text>
                                            <Text style={styles.arrow}>▼</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Status</Text>
                                        <TouchableOpacity style={styles.selectInput} onPress={() => handleSelect('status', STATUSES)}>
                                            <Text style={styles.selectText}>{formData.status}</Text>
                                            <Text style={styles.arrow}>▼</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Franchise</Text>
                                        <TouchableOpacity style={styles.selectInput} onPress={() => handleSelect('franchise_name', lookups.franchises)}>
                                            <Text style={styles.selectText}>{formData.franchise_name || 'Select Franchise'}</Text>
                                            <Text style={styles.arrow}>▼</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Area (Optional)</Text>
                                        <TouchableOpacity style={styles.selectInput} onPress={() => handleSelect('area', lookups.areas)}>
                                            <Text style={styles.selectText}>{formData.area || 'Select Area (Optional)'}</Text>
                                            <Text style={styles.arrow}>▼</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.col}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Collector</Text>
                                        <TouchableOpacity style={styles.selectInput} onPress={() => handleSelect('collector', lookups.collectors)}>
                                            <Text style={styles.selectText}>{formData.collector || 'Select Collector'}</Text>
                                            <Text style={styles.arrow}>▼</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Return Date & Time</Text>
                                <TouchableOpacity
                                    style={styles.selectInput}
                                    onPress={() => setShowReturnDatePicker(true)}
                                >
                                    <Text style={styles.selectText}>
                                        {formData.return_date
                                            ? new Date(formData.return_date).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
                                            : 'Select Date & Time'}
                                    </Text>
                                    <Text style={styles.arrow}>📅</Text>
                                </TouchableOpacity>
                                {showReturnDatePicker && (
                                    <DateTimePicker
                                        value={new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onReturnDateChange}
                                    />
                                )}
                                {showReturnTimePicker && (
                                    <DateTimePicker
                                        value={new Date()}
                                        mode="time"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        is24Hour={true}
                                        onChange={onReturnTimeChange}
                                    />
                                )}
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Receipt Image</Text>
                                <TouchableOpacity
                                    style={[styles.selectInput, formData.receipt_image ? { borderColor: '#059669', backgroundColor: '#ecfdf5' } : null]}
                                    onPress={pickImage}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <ActivityIndicator color="#6366f1" />
                                    ) : (
                                        <Text style={[styles.selectText, formData.receipt_image ? { color: '#059669', fontWeight: '700' } : null]}>
                                            {formData.receipt_image ? '✓ Receipt Attached' : '📁 Pick Receipt Image'}
                                        </Text>
                                    )}
                                    <Text style={styles.arrow}>📷</Text>
                                </TouchableOpacity>
                                {formData.receipt_image ? (
                                    <Image source={{ uri: formData.receipt_image }} style={styles.previewImage} />
                                ) : null}
                            </View>

                            <View style={[styles.row, { marginTop: 20, marginBottom: 40 }]}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateSubmit}>
                                    {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Record</Text>}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    // ... (rest of styles exactly the same as before)
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
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
    cardName: { fontSize: 15, fontWeight: '700', color: '#111827' },
    cardArea: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontSize: 11, fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
    metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    metaItem: { width: '47%' },
    metaLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '500', marginBottom: 2 },
    metaValue: { fontSize: 13, color: '#374151', fontWeight: '600' },
    metaHighlight: { color: '#059669', fontWeight: '700' },

    collectBtn: {
        marginTop: 12, backgroundColor: '#6366f1', borderRadius: 10,
        paddingVertical: 12, alignItems: 'center',
    },
    collectBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, color: '#9ca3af', fontWeight: '500' },

    fab: {
        position: 'absolute', bottom: 24, right: 24, backgroundColor: '#6366f1',
        width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
        elevation: 8, shadowColor: '#6366f1', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    },
    fabIcon: { color: '#fff', fontSize: 32, marginTop: -2 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalBody: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: 60, flex: 1 },
    modalHeaderBanner: {
        backgroundColor: '#7c3aed', padding: 18, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    modalTitleWhite: { fontSize: 20, fontWeight: '800', color: '#fff' },
    closeBox: { padding: 4 },
    closeX: { color: '#fff', fontSize: 18, fontWeight: '700' },

    formScroll: { flex: 1 },
    row: { flexDirection: 'row', gap: 15, marginBottom: 12 },
    col: { flex: 1 },
    fieldGroup: { marginBottom: 12 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
    formInput: {
        backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827',
    },
    selectInput: {
        backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    selectText: { fontSize: 14, color: '#111827' },
    arrow: { fontSize: 10, color: '#9ca3af' },
    helperText: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
    readOnlyInput: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
    readOnlyText: { fontSize: 14, fontWeight: '800', color: '#111827' },

    cancelBtn: {
        flex: 1, borderWeight: 1, borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 12,
        paddingVertical: 14, alignItems: 'center', backgroundColor: '#fff'
    },
    cancelBtnText: { color: '#374151', fontWeight: '700', fontSize: 16 },
    saveBtn: {
        flex: 1, backgroundColor: '#8b5cf6', borderRadius: 12,
        paddingVertical: 14, alignItems: 'center',
    },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    previewImage: { width: '100%', height: 180, borderRadius: 12, marginTop: 12, resizeMode: 'cover' },
})
