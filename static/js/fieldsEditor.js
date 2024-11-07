import { getFieldsDictionary, entities, fields } from '/js/dictionary.js';

export default function fieldsEditor() {
  return {
    entries: [],
    entities: entities,
    fields: fields,

    init() {
      this.loadEntries();
      window.addEventListener('refreshFieldsEditor', this.loadEntries.bind(this));
    },

    loadEntries() {
      this.entries = getFieldsDictionary() || [];
    },

    addEntry() {
      this.entries.push({ fieldQuery: '', entity: this.entities[0], field: this.fields[0], x: 0, y: 0 });
      localStorage.setItem('fieldsDictionary', JSON.stringify(this.entries));
    },

    saveEntry(index) {
      localStorage.setItem('fieldsDictionary', JSON.stringify(this.entries));
      alert('Entry saved!');
    },

    removeEntry(index) {
      this.entries.splice(index, 1);
      localStorage.setItem('fieldsDictionary', JSON.stringify(this.entries));
      window.dispatchEvent(new Event('refreshFieldsEditor'));
    },
  };
}
