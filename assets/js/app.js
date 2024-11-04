import Alpine from '/js/module.esm.js';
import fieldsManager from './fieldsManager.js';
import fieldsEditor from './fieldsEditor.js';

document.addEventListener('DOMContentLoaded', () => {
  Alpine.data('fieldsManager', fieldsManager);
  Alpine.data('fieldsEditor', fieldsEditor);

  // Start Alpine
  Alpine.start();
});
