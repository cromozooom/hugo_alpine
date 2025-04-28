import Alpine from 'alpinejs';
import sortPlugin from '@alpinejs/sort';

import fieldComp from './modules/fieldComp.js';
import tippy from 'tippy.js';

import storageManager from './modules/storageManager.js';

// Register Alpine.js components and start Alpine
document.addEventListener('alpine:init', () => {
  console.log('Alpine.js is initializing...');

  // Register Alpine.js components
  Alpine.data('fieldComp', fieldComp);
  Alpine.data('storageManager', storageManager);

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

// Register the sort plugin BEFORE starting Alpine.js
Alpine.plugin(sortPlugin);
// Start Alpine.js
Alpine.start();
