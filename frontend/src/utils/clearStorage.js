/**
 * Utility to clear all stored user data and auth
 * Run this in browser console to reset everything
 */

export function clearAllStorage() {
  console.clear();
  console.log('🔄 Clearing all storage...');

  // Clear localStorage
  localStorage.clear();
  console.log('✅ localStorage cleared');

  // Clear sessionStorage
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared');

  // Clear IndexedDB (Supabase uses this)
  indexedDB.databases().then((databases) => {
    databases.forEach((db) => {
      indexedDB.deleteDatabase(db.name);
      console.log(`✅ IndexedDB cleared: ${db.name}`);
    });
  });

  // Clear cookies
  document.cookie.split(';').forEach((c) => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
  console.log('✅ Cookies cleared');

  console.log('\n✨ All client-side data cleared!');
  console.log('⏳ Reloading page in 2 seconds...');
  setTimeout(() => window.location.reload(), 2000);
}

// Make it available in console
window.clearAllStorage = clearAllStorage;
