import { entities, fieldTypes } from './dictionary.js';

export default function documentTypesEditor() {
  return {
    entries: [], // List of document types
    fieldTypes: fieldTypes,
    entities: entities,
    templates: JSON.parse(localStorage.getItem('documentTemplates')) || [],
    categories: JSON.parse(localStorage.getItem('documentCategories')) || [],
    fileMetadata: JSON.parse(localStorage.getItem('fileMetadata')) || [],
    queryLibrary: JSON.parse(localStorage.getItem('queryLibrary')) || [],

    init() {
      // Load all document types from localStorage
      this.entries = JSON.parse(localStorage.getItem('documentTypes')) || [];
      window.addEventListener('refreshDocumentTypesEditor', this.loadEntries.bind(this));
      console.log('Loaded entries:', this.entries); // For debugging
    },

    loadEntries() {
      // Reload entries from localStorage
      this.entries = JSON.parse(localStorage.getItem('documentTypes')) || [];
    },

    getTemplateName(templateKey) {
      const template = this.templates.find((t) => t.key === templateKey);
      return template ? template.name : 'Unknown Template';
    },

    getTemplateFields(fileUpload) {
      const metadata = this.fileMetadata.find((item) => item.fileName === fileUpload);
      return metadata ? JSON.parse(JSON.stringify(metadata.fields)) : [];
    },

    addTemplate(entry) {
      const templateKey = entry.selectedTemplate;

      if (!templateKey || entry.templates.includes(templateKey)) {
        return; // Skip if template is not selected or already added
      }

      entry.templates.push(templateKey);

      // Load metadata for the associated file in `fileUpload`
      const template = this.templates.find((t) => t.key === templateKey);
      const fields = this.getTemplateFields(template.fileUpload).map((field) => ({
        ...field,
        query: '', // Initialize with an empty query selection
      }));

      entry.customFileMetadata = entry.customFileMetadata || {}; // Ensure it exists
      entry.customFileMetadata[templateKey] = fields;
    },

    removeTemplate(entry, templateIndex) {
      const templateKey = entry.templates[templateIndex];
      entry.templates.splice(templateIndex, 1);
      if (entry.customFileMetadata) {
        delete entry.customFileMetadata[templateKey];
      }
    },

    getQueryForEntity(entity) {
      return this.queryLibrary.filter((query) => query.entity === entity);
    },

    addMetadataField(metadata) {
      metadata.push({
        id: '',
        fieldType: 'string',
        xCoord: 0,
        yCoord: 0,
        query: '', // No initial query, user selects one if needed
      });
    },

    saveEntries() {
      localStorage.setItem('documentTypes', JSON.stringify(this.entries));
    },

    saveEntry(index) {
      // Update the entire documentTypes array in localStorage after modifying a single entry
      if (this.entries[index]) {
        localStorage.setItem('documentTypes', JSON.stringify(this.entries));
        alert(`Document type ${index + 1} saved successfully!`);
      }
    },

    addEntry() {
      // Add a new document type with default values
      const newEntry = {
        name: '',
        entity: this.entities.length > 0 ? this.entities[0] : '', // Default to the first entity if available
        primaryCode: '',
        enabledForSearch: false,
        category: '',
        templates: [],
        customFileMetadata: {},
        rules: {
          displayCondition: '',
          mandatoryCondition: '',
          meeDisplayCondition: '',
          approvalCondition: '',
        },
      };

      this.entries.push(newEntry);
      this.saveEntries(); // Save all entries to persist new entry
    },
  };
}
