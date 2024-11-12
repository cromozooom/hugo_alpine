import { pdfSample, fieldTypes as defaultFieldTypes } from './dictionary.js';

export default function fileMetadataEditor() {
  return {
    selectedFile: '', // Currently selected file
    pdfSample, // List of available PDF files
    fields: [], // Array of field objects with metadata for the selected file
    fieldTypes: defaultFieldTypes, // Field types like string, textblock, selector, etc.

    init() {
      this.fields = []; // Initialize fields as an empty array
      window.addEventListener('refreshFileMetadataEditor', this.init.bind(this));
    },

    loadFileMetadata() {
      if (!this.selectedFile) {
        this.fields = [];
        return;
      }

      // Load the entire metadata array from localStorage
      const metadataArray = JSON.parse(localStorage.getItem('fileMetadata')) || [];

      // Find the metadata for the selected file
      const fileMetadata = metadataArray.find((item) => item.fileName === this.selectedFile);

      // If metadata exists for the file, load it; otherwise, start with an empty array
      this.fields = fileMetadata ? fileMetadata.fields : [];
    },

    addField() {
      // Add a new field with default values
      this.fields.push({
        id: '',
        fieldType: this.fieldTypes[0], // Default to the first field type
        xCoord: 0,
        yCoord: 0,
      });
    },

    removeField(index) {
      // Remove a field at the specified index
      this.fields.splice(index, 1);
    },

    saveFileMetadata() {
      if (!this.selectedFile) {
        alert('Please select a file first.');
        return;
      }

      // Load the current metadata array from localStorage
      const metadataArray = JSON.parse(localStorage.getItem('fileMetadata')) || [];

      // Update or add the metadata for the selected file
      const fileIndex = metadataArray.findIndex((item) => item.fileName === this.selectedFile);
      if (fileIndex >= 0) {
        // Update existing metadata
        metadataArray[fileIndex].fields = this.fields;
      } else {
        // Add new metadata entry
        metadataArray.push({
          fileName: this.selectedFile,
          fields: this.fields,
        });
      }

      // Save the updated array back to localStorage
      localStorage.setItem('fileMetadata', JSON.stringify(metadataArray));
      alert('Metadata saved!');
    },
  };
}
