import * as SecureStore from 'expo-secure-store';

/**
 * Save a value securely
 * @param {string} key The key to store the value under
 * @param {string} value The value to store
 * @returns {Promise<boolean>} Whether the save was successful
 */
export const saveSecurely = async (key, value) => {
  try {
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (error) {
    console.error('Error saving to secure storage:', error);
    return false;
  }
};

/**
 * Retrieve a value from secure storage
 * @param {string} key The key to retrieve
 * @param {boolean} parse Whether to parse the value as JSON
 * @returns {Promise<any>} The retrieved value
 */
export const getSecurely = async (key, parse = false) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value && parse) {
      return JSON.parse(value);
    }
    return value;
  } catch (error) {
    console.error('Error retrieving from secure storage:', error);
    return null;
  }
};

/**
 * Delete a value from secure storage
 * @param {string} key The key to delete
 * @returns {Promise<boolean>} Whether the deletion was successful
 */
export const deleteSecurely = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error('Error deleting from secure storage:', error);
    return false;
  }
};

/**
 * Check if a key exists in secure storage
 * @param {string} key The key to check
 * @returns {Promise<boolean>} Whether the key exists
 */
export const hasSecureKey = async (key) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value !== null;
  } catch (error) {
    console.error('Error checking secure storage:', error);
    return false;
  }
}; 