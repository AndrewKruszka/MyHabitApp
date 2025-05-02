import Constants from 'expo-constants';

/**
 * Get the current environment (development, staging, or production)
 * @returns {string} The current environment
 */
export const getEnvironment = () => {
  if (__DEV__) return 'development';
  
  // Check for staging/production based on Constants or deployment URL
  const releaseChannel = Constants.manifest?.releaseChannel;
  if (releaseChannel === 'staging') return 'staging';
  return 'production';
};

/**
 * Check if the app is running in development mode
 * @returns {boolean}
 */
export const isDevelopment = () => getEnvironment() === 'development';

/**
 * Check if the app is running in staging mode
 * @returns {boolean}
 */
export const isStaging = () => getEnvironment() === 'staging';

/**
 * Check if the app is running in production mode
 * @returns {boolean}
 */
export const isProduction = () => getEnvironment() === 'production';

/**
 * Get environment-specific configuration values
 * @param {Object} config Configuration object with environment-specific values
 * @returns {any} The value for the current environment
 */
export const getEnvironmentConfig = (config) => {
  const environment = getEnvironment();
  return config[environment] || config.default || config.production;
}; 