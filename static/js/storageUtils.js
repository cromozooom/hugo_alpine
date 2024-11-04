// storageUtils.js

// Function to set data in localStorage
export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage', error);
  }
}

// Function to get data from localStorage
export function getLocalStorage(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return null;
  }
}

// Function to set user data in localStorage
export function setUserData(name, surname) {
  setLocalStorage('user', { name, surname });
}

// Function to get user data from localStorage
export function getUserData() {
  return getLocalStorage('user');
}
