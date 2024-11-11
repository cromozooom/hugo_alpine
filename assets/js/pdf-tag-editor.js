import Alpine from './modules/module.esm.js';
import queryManager from './modules/queryManager.js';
import queryEditor from './modules/queryEditor.js';
import documentTemplatesEditor from './modules/documentTemplatesEditor.js';
import documentCategoriesEditor from './modules/documentCategoriesEditor.js';
import documentTypesEditor from './modules/documentTypesEditor.js';

document.addEventListener('DOMContentLoaded', () => {
  Alpine.data('queryManager', queryManager);
  Alpine.data('queryEditor', queryEditor);
  Alpine.data('documentTemplatesEditor', documentTemplatesEditor);
  Alpine.data('documentCategoriesEditor', documentCategoriesEditor);
  Alpine.data('documentTypesEditor', documentTypesEditor);

  // Start Alpine
  Alpine.start();
});
