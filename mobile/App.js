import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import PendingScreen from './src/screens/PendingScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Clock, UserCircle } from 'lucide-react-native';
import { authHelpers } from './src/lib/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await authHelpers.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleLogout = async () => {
    await authHelpers.signOut();
    setUser(null);
  };

  if (loading) {
     return (
        <SafeAreaView style={styles.centerContainer}>
           <ActivityIndicator size="large" color="#ea580c" />
        </SafeAreaView>
     );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {user ? (
          <>
            <View style={{ flex: 1 }}>
              {activeTab === 'pending' ? (
                <PendingScreen user={user} />
              ) : (
                <ProfileScreen user={user} onLogout={handleLogout} />
              )}
            </View>

            {/* Bottom Tab Navigation */}
            <View style={styles.tabBar}>
              <TouchableOpacity 
                style={styles.tabItem} 
                onPress={() => setActiveTab('pending')}
              >
                <Clock size={24} color={activeTab === 'pending' ? '#ea580c' : '#9ca3af'} />
                <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>Pending</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.tabItem} 
                onPress={() => setActiveTab('profile')}
              >
                <UserCircle size={24} color={activeTab === 'profile' ? '#ea580c' : '#9ca3af'} />
                <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>Profile</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <LoginScreen onLogin={(userData) => setUser(userData)} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 10,
    paddingBottom: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ea580c',
    fontWeight: 'bold',
  }
});
