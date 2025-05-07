import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function DashboardLayout() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Clear user session/token
    router.replace('/(auth)/LoginScreen');
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 15,
  },
}); 