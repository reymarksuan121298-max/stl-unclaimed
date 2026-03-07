import React, { useState } from 'react'
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, KeyboardAvoidingView,
    Platform, ScrollView, Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
    const { login } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter your username and password.')
            return
        }
        setLoading(true)
        try {
            await login(username.trim(), password)
        } catch (err) {
            Alert.alert('Login Failed', err.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <LinearGradient colors={['#6366f1', '#8b5cf6', '#a855f7']} style={styles.gradient}>
            <StatusBar style="light" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.kav}
            >
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    {/* Logo / Title */}
                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>STL</Text>
                        </View>
                        <Text style={styles.title}>STL Unclaimed</Text>
                        <Text style={styles.subtitle}>Mobile Portal</Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Welcome Back</Text>
                        <Text style={styles.cardSub}>Sign in to your account</Text>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your username"
                                placeholderTextColor="#9ca3af"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passRow}>
                                <TextInput
                                    style={[styles.input, styles.passInput]}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9ca3af"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPass}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.showBtn}
                                    onPress={() => setShowPass(!showPass)}
                                >
                                    <Text style={styles.showBtnText}>{showPass ? 'Hide' : 'Show'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#6366f1', '#8b5cf6']}
                                style={styles.loginBtnGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={styles.loginBtnText}>Sign In</Text>
                                }
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.noteBox}>
                            <Text style={styles.noteText}>
                                🔒 Accessible to Cashier & Collector accounts only
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    kav: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    header: { alignItems: 'center', marginBottom: 32 },
    logoCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    },
    logoText: { fontSize: 28, fontWeight: '900', color: '#fff' },
    title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 28,
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
        elevation: 8,
    },
    cardTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
    cardSub: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
    fieldGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
    input: {
        borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 15, color: '#111827', backgroundColor: '#f9fafb',
    },
    passRow: { flexDirection: 'row', alignItems: 'center' },
    passInput: { flex: 1 },
    showBtn: { marginLeft: 10, paddingHorizontal: 12, paddingVertical: 10 },
    showBtnText: { color: '#6366f1', fontWeight: '600', fontSize: 13 },
    loginBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
    loginBtnDisabled: { opacity: 0.6 },
    loginBtnGradient: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
    loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    noteBox: {
        marginTop: 20, backgroundColor: '#f0f9ff', borderRadius: 10,
        padding: 12, alignItems: 'center',
    },
    noteText: { fontSize: 12, color: '#0369a1', textAlign: 'center' },
})
