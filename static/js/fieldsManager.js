import {
  addFieldDictionaryEntry,
  downloadFieldsDictionary,
  uploadFieldsDictionary,
  entities,
  fields,
} from '/js/dictionary.js';

export default function fieldsManager() {
  return {
    codeName: '',
    selectedEntity: entities[0],
    selectedField: fields[0],
    entities: entities,
    fields: fields,

    addEntry() {
      if (this.codeName.trim()) {
        addFieldDictionaryEntry(this.codeName, this.selectedEntity, this.selectedField);
        alert('Entry added successfully!');

        // Reset form fields
        this.codeName = '';
        this.selectedEntity = '';
        this.selectedField = '';

        window.dispatchEvent(new Event('refreshFieldsEditor')); // Trigger an update for fieldsEditor
      } else {
        alert('Code Name is required.');
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
