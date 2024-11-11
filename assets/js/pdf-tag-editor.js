import Alpine from './modules/module.esm.js';
import queryManager from './modules/queryManager.js';
import queryEditor from './modules/queryEditor.js';
import docTemplatesEditor from './modules/docTemplatesEditor.js';
import documentCategoriesEditor from './modules/documentCategoriesEditor.js';
('./modules/documentCategoriesEditor.js');

document.addEventListener('DOMContentLoaded', () => {
  Alpine.data('queryManager', queryManager);
  Alpine.data('queryEditor', queryEditor);
  Alpine.data('docTemplatesEditor', docTemplatesEditor);
  Alpine.data('documentCategoriesEditor', documentCategoriesEditor);

  // Start Alpine
  Alpine.start();
});
