import Constants from 'expo-constants';
import { getEnvironment, getEnvironmentConfig } from '../utils/environment';
import { getSecurely, saveSecurely } from '../utils/secureStorage';

// Configuration validation
const requiredKeys = ['apiUrl', 'apiKey'];

const validateConfig = (config) => {
  const missingKeys = requiredKeys.filter(key => !config[key]);
  if (missingKeys.length > 0) {
    console.warn(`Missing required configuration: ${missingKeys.join(', ')}`);
    return false;
  }
  return true;
};

// Environment-specific configuration
const envConfig = {
  development: {
    apiUrl: 'http://localhost:3000',
    logLevel: 'debug',
  },
  staging: {
    apiUrl: 'https://staging-api.myhabitapp.com',
    logLevel: 'info',
  },
  production: {
    apiUrl: 'https://api.myhabitapp.com',
    logLevel: 'warn',
  }
};

// Get configuration from expo-constants
const getExpoConfig = () => {
  const manifest = Constants.manifest?.extra || {};
  return {
    apiUrl: manifest.apiUrl,
    apiKey: manifest.apiKey,
    environment: manifest.environment,
    projectId: manifest.eas?.projectId,
  };
};

// Merge environment config with expo config
const getMergedConfig = () => {
  const environment = getEnvironment();
  const expoConfig = getExpoConfig();
  const environmentConfig = envConfig[environment] || {};

  return {
    ...environmentConfig,
    ...expoConfig,
    environment,
  };
};

// Cache for configuration values
let configCache = null;

/**
 * Get the current configuration
 * @returns {Object} The current configuration
 */
export const getConfig = () => {
  if (configCache) return configCache;
  
  const config = getMergedConfig();
  validateConfig(config);
  configCache = config;
  
  return config;
};

/**
 * Get a specific configuration value
 * @param {string} key The configuration key to retrieve
 * @param {any} defaultValue The default value if the key doesn't exist
 * @returns {any} The configuration value
 */
export const getConfigValue = (key, defaultValue = null) => {
  const config = getConfig();
  return config[key] ?? defaultValue;
};

/**
 * Get a secure configuration value
 * @param {string} key The secure configuration key to retrieve
 * @returns {Promise<string|null>} The secure configuration value
 */
export const getSecureConfig = async (key) => {
  return await getSecurely(key);
};

/**
 * Save a secure configuration value
 * @param {string} key The key to store the value under
 * @param {string} value The value to store
 * @returns {Promise<boolean>} Whether the save was successful
 */
export const setSecureConfig = async (key, value) => {
  return await saveSecurely(key, value);
};

// Export environment-specific values
export const API_URL = getConfigValue('apiUrl');
export const API_KEY = getConfigValue('apiKey');
export const LOG_LEVEL = getConfigValue('logLevel', 'info');
export const ENVIRONMENT = getConfigValue('environment', 'development'); 