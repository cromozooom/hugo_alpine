import {
  addFieldDictionaryEntry,
  downloadFieldsDictionary,
  uploadFieldsDictionary,
  entities,
  fields,
} from '/js/dictionary.js';

export default function fieldsManager() {
  return {
    fieldQuery: '',
    selectedEntity: entities[0],
    selectedField: fields[0],
    entities: entities,
    fields: fields,
    x: 0,
    y: 0,

    addEntry() {
      if (this.fieldQuery.trim()) {
        addFieldDictionaryEntry(this.fieldQuery, this.selectedEntity, this.selectedField, this.x, this.y);
        alert('Entry added successfully (fieldsManager)!');

        // Reset form fields except x and y
        this.fieldQuery = '';
        this.selectedEntity = '';
        this.selectedField = '';

        // Trigger an update for fieldsEditor
        window.dispatchEvent(new Event('refreshFieldsEditor'));
      } else {
        alert('Code Name is required.');
      }
    },

    xxx_addEntry() {
      if (this.fieldQuery.trim()) {
        addFieldDictionaryEntry(this.fieldQuery, this.selectedEntity, this.selectedField, this.x, this.y);
        alert('Entry added successfully!');

        // Reset form fields
        this.fieldQuery = '';
        this.selectedEntity = '';
        this.selectedField = '';
        this.x = 0;
        this.y = 0;

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
