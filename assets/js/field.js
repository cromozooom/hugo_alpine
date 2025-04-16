// import Alpine from './modules/module.esm.js';
// import field from './modules/field.js';
import Alpine from 'alpinejs';
import field from './modules/field.js';

import storageManager from './modules/storageManager.js';
import sort from '@alpinejs/sort';

document.addEventListener('DOMContentLoaded', () => {
  Alpine.data('field', field);
  Alpine.data('storageManager', storageManager);

  // Start Alpine

  Alpine.plugin(sort);
  Alpine.start();
});
