import Alpine from './modules/module.esm.js';
import docTypes from './modules/docTypes.js';
// import storageManager from './modules/storageManager.js';
import sortPlugin from '@alpinejs/sort';

document.addEventListener('DOMContentLoaded', () => {
  Alpine.data('docTypes', docTypes);
  // Alpine.data('storageManager', storageManager);

  // Start Alpine
  Alpine.plugin(sortPlugin);
  Alpine.start();
});
