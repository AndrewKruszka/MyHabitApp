import Constants from 'expo-constants';
import { getEnvironment } from './environment';

/**
 * Validate the configuration setup and environment variables
 * @returns {boolean} Whether the configuration is valid
 */
export const validateConfigurationSetup = () => {
  const env = getEnvironment();
  console.log('=== Configuration Validation ===');
  console.log(`Environment: ${env}`);
  
  const config = Constants.expoConfig?.extra || {};
  const requiredKeys = ['apiUrl', 'apiKey'];
  const missingKeys = requiredKeys.filter(key => !config[key]);
  
  // In development, we'll use default values
  if (env === 'development' && missingKeys.length > 0) {
    console.warn('⚠️ Using default development configuration');
    return true;
  }
  
  if (missingKeys.length > 0) {
    console.error(`❌ Missing required configuration: ${missingKeys.join(', ')}`);
    return false;
  }
  
  // Log current configuration (excluding sensitive values)
  console.log('Current Configuration:');
  console.log('- API URL:', config.apiUrl);
  console.log('- Environment:', env);
  console.log('- Analytics:', config.enableAnalytics ? 'Enabled' : 'Disabled');
  console.log('- Push Notifications:', config.enablePushNotifications ? 'Enabled' : 'Disabled');
  
  console.log('✅ Configuration validation successful');
  return true;
}; 