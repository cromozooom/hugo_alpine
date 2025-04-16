// import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.14.3/dist/cdn.min.js';
// import fieldComp from './modules/fieldComp.js';
import Alpine from './modules/module.esm.js';
import fieldComp from './modules/fieldComp.js';

import storageManager from './modules/storageManager.js';
import sort from '@alpinejs/sort';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Alpine.js is initializing...');
  Alpine.data('fieldComp', fieldComp);
  Alpine.data('storageManager', storageManager);

  // Start Alpine
  Alpine.plugin(sort);
  Alpine.start();
});
