export default function documentCategoriesEditor() {
  return {
    entries: [],

    init() {
      this.loadEntries();
      window.addEventListener('refreshDocumentCategoriesEditor', this.loadEntries.bind(this));
    },

    loadEntries() {
      // Load entries from localStorage or initialize an empty array if none exist
      this.entries = JSON.parse(localStorage.getItem('documentCategories')) || [];
    },

    addEntry() {
      // Add a new entry with default values
      this.entries.push({
        name: '',
        primaryCode: '',
        canHoldDocumentTemplates: false, // default to false
        enabledForSearch: false, // default to false
      });
      this.saveEntries(); // Save immediately to localStorage
    },

    saveEntry(index) {
      // Save the current state of all entries
      this.saveEntries();
      alert('Entry saved!');
      window.dispatchEvent(new Event('refreshDocumentCategoriesEditor')); // Refresh any listeners
    },

    removeEntry(index) {
      // Remove the entry at the specified index
      this.entries.splice(index, 1);
      this.saveEntries();
      window.dispatchEvent(new Event('refreshDocumentCategoriesEditor'));
    },

    saveEntries() {
      // Save all entries to localStorage
      localStorage.setItem('documentCategories', JSON.stringify(this.entries));
    },
  };
}
