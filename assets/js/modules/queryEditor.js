import { getQueryLibrary, entities } from './dictionary.js';

export default function queryEditor() {
  return {
    entries: [],
    entities: entities,

    init() {
      this.loadEntries();
      window.addEventListener('refreshFieldsEditor', this.loadEntries.bind(this));
    },

    loadEntries() {
      this.entries = getQueryLibrary() || [];
    },

    addEntry() {
      this.entries.push({ query: '', entity: this.entities[0], queryId: '' });
      localStorage.setItem('queryLibrary', JSON.stringify(this.entries));
    },

    saveEntry(index) {
      localStorage.setItem('queryLibrary', JSON.stringify(this.entries));
      alert('Entry saved!');
    },

    removeEntry(index) {
      this.entries.splice(index, 1);
      localStorage.setItem('queryLibrary', JSON.stringify(this.entries));
      window.dispatchEvent(new Event('refreshFieldsEditor'));
    },
  };
}
