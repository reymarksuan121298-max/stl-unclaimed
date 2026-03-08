import React from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../context/AuthContext'

const ProfileRow = ({ label, value }) => (
    <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
)

export default function ProfileScreen() {
    const { user, logout } = useAuth()

    const confirmLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
        ])
    }

    const roleLabel = user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
        : ''

    return (
        <ScrollView style={styles.container}>
            {/* Avatar header */}
            <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {(user?.fullname || user?.username || '?').charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.fullname}>{user?.fullname || user?.username}</Text>
                <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>{roleLabel}</Text>
                </View>
            </LinearGradient>

            {/* Info card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Account Details</Text>
                <ProfileRow label="Username" value={user?.username} />
                <ProfileRow label="Full Name" value={user?.fullname} />
                <ProfileRow label="Role" value={roleLabel} />
                <ProfileRow label="Status" value={user?.status} />
                {user?.assigned_collectors?.length > 0 && (
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Assigned Collectors</Text>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            {user.assigned_collectors.map((c, i) => (
                                <Text key={i} style={styles.collectorChip}>{c.split('@')[0]}</Text>
                            ))}
                        </View>
                    </View>
                )}
            </View>

            {/* App info */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>App Info</Text>
                <ProfileRow label="Version" value="1.0.0" />
                <ProfileRow label="Platform" value="Expo Go" />
                <ProfileRow label="Access" value="Cashier & Collector" />
            </View>

            {/* Sign out */}
            <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout} activeOpacity={0.85}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            <View style={{ height: 32 }} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24 },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
    fullname: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
    rolePill: {
        backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20,
        paddingHorizontal: 16, paddingVertical: 5,
    },
    rolePillText: { color: '#fff', fontWeight: '600', fontSize: 13 },

    card: {
        backgroundColor: '#fff', borderRadius: 16, margin: 16, marginBottom: 0, padding: 20,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardTitle: { fontSize: 14, fontWeight: '700', color: '#6b7280', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    },
    rowLabel: { fontSize: 14, color: '#6b7280', flex: 1 },
    rowValue: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1, textAlign: 'right' },
    collectorChip: {
        fontSize: 12, fontWeight: '600', color: '#6366f1',
        backgroundColor: '#ede9fe', borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4,
    },
    logoutBtn: {
        margin: 16, marginTop: 20, backgroundColor: '#ef4444', borderRadius: 14,
        paddingVertical: 15, alignItems: 'center',
    },
    logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
