// import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.14.3/dist/cdn.min.js';
// import fieldComp from './modules/fieldComp.js';
import Alpine from './modules/module.esm.js';
import fieldComp from './modules/fieldComp.js';
import tippy from 'tippy.js';

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

Alpine.magic('tooltip', (el) => (message, duration = 1000) => {
  let instance = tippy(el, { content: message, trigger: 'manual' });

  instance.show();

  setTimeout(() => {
    instance.hide();

    setTimeout(() => instance.destroy(), 50);
  }, duration);
});

document.addEventListener('alpine:init', () => {
  // Magic: $tooltip
  Alpine.magic('tooltip', (el) => (message) => {
    let instance = tippy(el, { content: message, trigger: 'manual' });

    instance.show();

    setTimeout(() => {
      instance.hide();

      setTimeout(() => instance.destroy(), 50);
    }, 2000);
  });

  // Directive: x-tooltip
  Alpine.directive('tooltip', (el, { expression }) => {
    tippy(el, { content: expression });
  });
});
