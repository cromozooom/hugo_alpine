import Alpine from './modules/module.esm.js';
import storageManager from './modules/storageManager.js';
import fieldManager from './modules/fieldManager.js';
import sort from '@alpinejs/sort';

document.addEventListener('DOMContentLoaded', () => {
  Alpine.data('fieldManager', fieldManager);
  Alpine.data('storageManager', storageManager);

  // Start Alpine

  Alpine.plugin(sort);
  Alpine.start();
});
