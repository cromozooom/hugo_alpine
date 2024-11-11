import {
  addQueryLibraryEntry,
  downloadQueryLibrary,
  uploadqueryLibrary,
  getQueryLibrary,
  entities,
  fields,
} from './dictionary.js';

export default function fieldsManager() {
  return {
    query: '',
    selectedEntity: null,
    selectedField: fields[0],
    entities: entities,
    idQuery: '', // New ID field
    isIdUnique: true, // Flag to track ID uniqueness

    // Watch for changes in selectedEntity and reset ID input when entity changes
    checkUniqueId() {
      const queryLibrary = getQueryLibrary();

      // Log the inputs to help track comparisons
      console.log('Checking ID uniqueness...');
      console.log('Selected Entity:', this.selectedEntity, 'ID Query:', this.idQuery);

      this.isIdUnique = !queryLibrary.some((entry) => {
        const isDuplicate = entry.entity === this.selectedEntity && entry.queryId === this.idQuery;
        if (isDuplicate) {
          console.log('Duplicate found for entity:', entry.entity, 'queryId:', entry.queryId);
        }
        return isDuplicate;
      });

      console.log('Is ID Unique:', this.isIdUnique);
    },
    addEntry() {
      if (this.query.trim() && this.idQuery.trim() && this.isIdUnique) {
        addQueryLibraryEntry(this.query, this.selectedEntity, this.idQuery);

        alert('Entry added successfully!');

        // Reset form fields
        this.query = '';
        this.selectedEntity = null; // Reset selectedEntity
        this.idQuery = '';
        this.isIdUnique = true;

        window.dispatchEvent(new Event('refreshFieldsEditor')); // Trigger an update for fieldsEditor
      } else if (!this.isIdUnique) {
        alert('ID must be unique within the selected entity.');
      } else {
        alert('ID are required.');
      }
    },

    downloadDictionary() {
      downloadQueryLibrary();
    },

    uploadDictionary(event) {
      uploadqueryLibrary(event);
      window.dispatchEvent(new Event('refreshFieldsEditor')); // Update fieldsEditor after upload
    },
  };
}
