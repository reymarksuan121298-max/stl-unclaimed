import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native'
import HomeScreen from '../screens/HomeScreen'
import PendingScreen from '../screens/PendingScreen'
import UnclaimedScreen from '../screens/UnclaimedScreen'
import CollectionsScreen from '../screens/CollectionsScreen'
import CashDepositsScreen from '../screens/CashDepositsScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { useAuth } from '../context/AuthContext'

const Tab = createBottomTabNavigator()

const TabIcon = ({ emoji, label, focused }) => (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
        <Text style={{ fontSize: 20 }}>{emoji}</Text>
        <Text style={{
            fontSize: 10, fontWeight: focused ? '700' : '500',
            color: focused ? '#6366f1' : '#9ca3af', marginTop: 2,
        }}>
            {label}
        </Text>
    </View>
)

export default function AppNavigator() {
    const { user } = useAuth()
    const isCashier = user?.role?.toLowerCase() === 'cashier'
    const isCollector = user?.role?.toLowerCase() === 'collector'

    return (
        <Tab.Navigator
            initialRouteName={isCollector ? "Pending" : "Home"}
            screenOptions={{
                headerStyle: { backgroundColor: '#6366f1' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: '700' },
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopColor: '#e5e7eb',
                    borderTopWidth: 1,
                    elevation: 8,
                },
                tabBarHideOnKeyboard: true,
                tabBarShowLabel: false,
            }}
        >
            {!isCollector && (
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        title: 'STL Unclaimed',
                        tabBarIcon: ({ focused }) => (
                            <TabIcon emoji="🏠" label="Home" focused={focused} />
                        ),
                    }}
                />
            )}

            <Tab.Screen
                name="Pending"
                component={PendingScreen}
                options={{
                    title: 'Pending Items',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon emoji="🕐" label="Pending" focused={focused} />
                    ),
                }}
            />

            {/* Cashier sees Unclaimed, Collections, and Cash Deposits */}
            {isCashier && (
                <>
                    <Tab.Screen
                        name="Unclaimed"
                        component={UnclaimedScreen}
                        options={{
                            title: 'Unclaimed',
                            tabBarIcon: ({ focused }) => (
                                <TabIcon emoji="📋" label="Unclaimed" focused={focused} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Collections"
                        component={CollectionsScreen}
                        options={{
                            title: 'Collections',
                            tabBarIcon: ({ focused }) => (
                                <TabIcon emoji="💰" label="Collected" focused={focused} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="CashDeposits"
                        component={CashDepositsScreen}
                        options={{
                            title: 'Cash Deposits',
                            tabBarIcon: ({ focused }) => (
                                <TabIcon emoji="🏦" label="Deposits" focused={focused} />
                            ),
                        }}
                    />
                </>
            )}

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'My Profile',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon emoji="👤" label="Profile" focused={focused} />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}
