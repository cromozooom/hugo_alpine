import { entities } from './dictionary.js';

export default function documentTypesEditor() {
  return {
    entries: [],
    entities: [],
    categories: [],
    templates: [],

    init() {
      // Load data from localStorage or provide fallback data
      this.entities = JSON.parse(localStorage.getItem('entities')) || entities;

      // Filter out duplicate categories based on primaryCode
      this.categories = (JSON.parse(localStorage.getItem('documentCategories')) || []).filter(
        (category, index, self) => index === self.findIndex((c) => c.primaryCode === category.primaryCode),
      );

      // Filter out duplicate templates based on key
      this.templates = (JSON.parse(localStorage.getItem('documentTemplates')) || []).filter(
        (template, index, self) => index === self.findIndex((t) => t.key === template.key),
      );

      this.loadEntries();
      window.addEventListener('refreshDocumentTypesEditor', this.loadEntries.bind(this));
    },

    loadEntries() {
      // Load entries from localStorage or initialize an empty array if none exist
      this.entries = JSON.parse(localStorage.getItem('documentTypes')) || [];
    },

    addEntry() {
      // Add a new entry with default values
      this.entries.push({
        name: '',
        entity: this.entities.length > 0 ? this.entities[0] : '', // default to first entity if exists
        primaryCode: '',
        enabledForSearch: false, // default to false
        category: this.categories.length > 0 ? this.categories[0].primaryCode : '', // default to first category if exists
        selectedTemplate: '', // holds selected template for adding
        templates: [], // empty array to hold multiple templates
        rules: {
          displayCondition: '',
          mandatoryCondition: '',
          meeDisplayCondition: '',
          approvalCondition: '',
        },
      });
      this.saveEntries(); // Save immediately to localStorage
    },

    addTemplate(entry) {
      // Add selected template if it is not already in the templates list
      if (entry.selectedTemplate && !entry.templates.includes(entry.selectedTemplate)) {
        entry.templates.push(entry.selectedTemplate);
      }
      entry.selectedTemplate = ''; // Reset selected template after adding
    },

    removeTemplate(entry, templateIndex) {
      // Remove a template at the specified index
      entry.templates.splice(templateIndex, 1);
    },

    saveEntry(index) {
      // Save the current state of all entries
      this.saveEntries();
      alert('Entry saved!');
      window.dispatchEvent(new Event('refreshDocumentTypesEditor')); // Refresh any listeners
    },

    removeEntry(index) {
      // Remove the entry at the specified index
      this.entries.splice(index, 1);
      this.saveEntries();
      window.dispatchEvent(new Event('refreshDocumentTypesEditor'));
    },

    saveEntries() {
      // Save all entries to localStorage
      localStorage.setItem('documentTypes', JSON.stringify(this.entries));
    },

    getTemplateName(templateKey) {
      // Retrieve the template name by key
      const template = this.templates.find((t) => t.key === templateKey);
      return template ? template.name : 'Unknown Template';
    },
  };
}
