import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { CheckSquare, Square } from 'lucide-react-native';
import { authHelpers } from '../lib/api';

export default function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [saveLogin, setSaveLogin] = useState(true);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter both username and password.');
            return;
        }

        setLoading(true);
        try {
            const userData = await authHelpers.signIn(username, password);
            
            if (userData) {
                // RBAC Check: Restrict to Cashier and Collector only
                const role = userData.role?.toLowerCase();
                if (role !== 'cashier' && role !== 'collector') {
                    Alert.alert('Access Denied', 'This mobile app is restricted to Cashiers and Collectors only.');
                    return;
                }

                await authHelpers.setCurrentUser(userData, saveLogin);
                onLogin(userData);
            } else {
                Alert.alert('Login Failed', 'Invalid username or password, or account is inactive.');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/stl-logo.png')} style={styles.logoImage} resizeMode="contain" />
                    <Text style={styles.logoText}>STL</Text>
                    <Text style={styles.subLogoText}>UNCLAIMED APP</Text>
                </View>

                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter your username"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>

                {/* Save Login Checkbox */}
                <TouchableOpacity 
                    style={styles.checkboxContainer} 
                    onPress={() => setSaveLogin(!saveLogin)}
                    activeOpacity={0.7}
                >
                    {saveLogin ? (
                        <CheckSquare size={20} color="#ea580c" />
                    ) : (
                        <Square size={20} color="#9ca3af" />
                    )}
                    <Text style={styles.checkboxLabel}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoImage: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    logoText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#ea580c',
    },
    subLogoText: {
        fontSize: 14,
        color: '#4b5563',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#f9fafb',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginLeft: 2,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
        color: '#4b5563',
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#ea580c',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
