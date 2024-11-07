import {
  addFieldDictionaryEntry,
  downloadFieldsDictionary,
  uploadFieldsDictionary,
  getFieldsDictionary,
  entities,
  fields,
} from '/js/dictionary.js';

export default function fieldsManager() {
  return {
    fieldQuery: '',
    selectedEntity: null,
    selectedField: fields[0],
    entities: entities,
    fields: fields,
    x: 0,
    y: 0,
    id: '', // New ID field
    isIdUnique: true, // Flag to track ID uniqueness

    // Watch for changes in selectedEntity and reset ID input when entity changes
    checkUniqueId() {
      this.isIdUnique = !getFieldsDictionary().some(
        (entry) => entry.entity === this.selectedEntity && entry.id === this.id,
      );
    },

    addEntry() {
      if (this.fieldQuery.trim() && this.id.trim() && this.isIdUnique) {
        addFieldDictionaryEntry(this.fieldQuery, this.selectedEntity, this.selectedField, this.x, this.y, this.id);
        alert('Entry added successfully!');

        // Reset form fields
        this.fieldQuery = '';
        this.selectedEntity = null; // Reset selectedEntity
        this.selectedField = fields[0];
        this.id = '';
        this.x = 0;
        this.y = 0;
        this.isIdUnique = true;

        window.dispatchEvent(new Event('refreshFieldsEditor')); // Trigger an update for fieldsEditor
      } else if (!this.isIdUnique) {
        alert('ID must be unique within the selected entity.');
      } else {
        alert('ID are required.');
      }
    },

    downloadDictionary() {
      downloadFieldsDictionary();
    },

    uploadDictionary(event) {
      uploadFieldsDictionary(event);
      window.dispatchEvent(new Event('refreshFieldsEditor')); // Update fieldsEditor after upload
    },
  };
}
