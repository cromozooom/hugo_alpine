import Alpine from './modules/module.esm.js';
import fieldsManager from './modules/fieldsManager.js';
import fieldsEditor from './modules/fieldsEditor.js';

document.addEventListener('DOMContentLoaded', () => {
  Alpine.data('fieldsManager', fieldsManager);
  Alpine.data('fieldsEditor', fieldsEditor);

  // Start Alpine
  Alpine.start();
});
