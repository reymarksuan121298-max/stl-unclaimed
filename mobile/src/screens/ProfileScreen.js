import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { User, Shield, Mail, Users, LogOut } from 'lucide-react-native';

export default function ProfileScreen({ user, onLogout }) {
    if (!user) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <Text style={styles.name}>{user.fullname || 'Unknown User'}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{(user.role || 'User').toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Account Information</Text>
                
                <View style={styles.infoRow}>
                    <View style={styles.iconBox}>
                        <User size={20} color="#6b7280" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Full Name</Text>
                        <Text style={styles.infoValue}>{user.fullname || 'N/A'}</Text>
                    </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <View style={styles.iconBox}>
                        <Mail size={20} color="#6b7280" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Username / Email</Text>
                        <Text style={styles.infoValue}>{user.username || 'N/A'}</Text>
                    </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <View style={styles.iconBox}>
                        <Shield size={20} color="#6b7280" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Role Status</Text>
                        <Text style={[styles.infoValue, { color: '#16a34a', fontWeight: 'bold' }]}>
                            Active {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                        </Text>
                    </View>
                </View>

                {/* Specific field for cashiers showing their assigned collectors */}
                {user.role?.toLowerCase() === 'cashier' && user.assigned_collectors && (
                    <>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Users size={20} color="#6b7280" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Assigned Collectors</Text>
                                {Array.isArray(user.assigned_collectors) && user.assigned_collectors.length > 0 ? (
                                    user.assigned_collectors.map((collector, index) => (
                                        <Text key={index} style={styles.collectorItem}>• {collector}</Text>
                                    ))
                                ) : (
                                    <Text style={styles.infoValue}>None assigned</Text>
                                )}
                            </View>
                        </View>
                    </>
                )}
            </View>

            {onLogout && (
                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <LogOut size={20} color="#dc2626" />
                    <Text style={styles.logoutButtonText}>Sign Out</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ea580c',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#ea580c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    avatarText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    roleBadge: {
        backgroundColor: '#ffedd5',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    roleText: {
        color: '#ea580c',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    collectorItem: {
        fontSize: 15,
        color: '#374151',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee2e2',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 24,
        gap: 8,
    },
    logoutButtonText: {
        color: '#dc2626',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
