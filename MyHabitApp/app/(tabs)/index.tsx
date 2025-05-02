import { useRouter } from 'expo-router';
import { Button, View } from 'react-native';
export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Your existing home content */}
      <Button
        title="Run Database Tests"
        onPress={() => router.push('/databaseTest')}
      />
    </View>
  );
}
