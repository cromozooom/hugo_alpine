import Alpine from './modules/module.esm.js';
import fieldsManager from './modules/queryManager.js';
import fieldsEditor from './modules/queryEditor.js';

document.addEventListener('DOMContentLoaded', () => {
  Alpine.data('fieldsManager', fieldsManager);
  Alpine.data('fieldsEditor', fieldsEditor);

  // Start Alpine
  Alpine.start();
});
