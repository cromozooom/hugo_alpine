import { getQueryLibrary, entities } from './dictionary.js';

export default function queryEditor() {
  return {
    entries: [],
    entities: entities,
    isIdUnique: true,

    init() {
      this.loadEntries();
      window.addEventListener('refreshFieldsEditor', this.loadEntries.bind(this));
    },

    loadEntries() {
      // Initialize each entry with an `isIdUnique` property to track uniqueness
      this.entries = getQueryLibrary().map((entry) => ({ ...entry, isIdUnique: true })) || [];
    },

    checkUniqueId(entry) {
      const queryLibrary = getQueryLibrary();

      // Check if any entry in queryLibrary has the same entity and queryId as the current entry, excluding itself
      entry.isIdUnique = !queryLibrary.some(
        (existingEntry) =>
          existingEntry.entity === entry.entity && existingEntry.queryId === entry.queryId && existingEntry !== entry, // Exclude itself from the check
      );

      console.log('Is ID Unique for entry:', entry.queryId, entry.isIdUnique); // Log to verify
    },

    saveEntry(index) {
      const entry = this.entries[index];

      // Check for uniqueness before saving
      if (entry.isIdUnique) {
        // If unique, proceed with saving
        localStorage.setItem('queryLibrary', JSON.stringify(this.entries));
        alert('Entry saved!');
        window.dispatchEvent(new Event('refreshFieldsEditor'));
      } else {
        // If not unique, show an error
        alert('ID must be unique within the selected entity.');
      }
    },

    addEntry() {
      this.entries.push({ query: '', entity: this.entities[0], queryId: '', isIdUnique: true });
      localStorage.setItem('queryLibrary', JSON.stringify(this.entries));
    },

    removeEntry(index) {
      this.entries.splice(index, 1);
      localStorage.setItem('queryLibrary', JSON.stringify(this.entries));
      window.dispatchEvent(new Event('refreshFieldsEditor'));
    },
  };
}
