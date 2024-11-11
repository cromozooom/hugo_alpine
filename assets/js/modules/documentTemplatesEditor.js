import { languages, collators, generators, pdfSample } from './dictionary.js';

export default function documentTemplatesEditor() {
  return {
    entries: [],
    languages: languages,
    collators: collators,
    generators: generators,
    pdfSample: pdfSample,

    init() {
      this.loadEntries();
      window.addEventListener('refreshdocTemplatesEditor', this.loadEntries.bind(this));
    },

    loadEntries() {
      // Load entries from localStorage or initialize an empty array
      this.entries = JSON.parse(localStorage.getItem('documentTemplates')) || [];
    },

    addEntry() {
      // Add a new entry with default values
      this.entries.push({
        name: '',
        key: '',
        language: Object.keys(this.languages)[0], // default to the first language option
        collator: this.collators[0], // default to the first collator
        generator: this.generators[0], // default to the first generator
        fileUpload: this.pdfSample[0], // default to the first file upload option
      });
      this.saveEntries(); // Save immediately to localStorage
    },

    saveEntry(index) {
      // Save the specific entry
      this.saveEntries();
      alert('Entry saved!');
      window.dispatchEvent(new Event('refreshdocTemplatesEditor')); // Refresh any listeners
    },

    removeEntry(index) {
      // Remove the entry at the specified index
      this.entries.splice(index, 1);
      this.saveEntries();
      window.dispatchEvent(new Event('refreshdocTemplatesEditor'));
    },

    saveEntries() {
      // Save all entries to localStorage
      localStorage.setItem('documentTemplates', JSON.stringify(this.entries));
    },
  };
}
