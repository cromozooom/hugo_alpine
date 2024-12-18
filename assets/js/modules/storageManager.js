export default function storageManager() {
  return {
    storageKeys: [],
    selectedKeys: {},

    init() {
      // Populate storageKeys with all items in localStorage
      this.storageKeys = Object.keys(localStorage);

      // Initialize each item as deselected by default and ensure each key exists
      this.storageKeys.forEach((key) => {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify([])); // Default to empty array
        }
        this.selectedKeys[key] = false; // Initialize each toggle as deselected
      });
    },

    downloadSelectedData() {
      // Gather selected items from localStorage
      const data = {};
      for (const key in this.selectedKeys) {
        if (this.selectedKeys[key]) {
          data[key] = JSON.parse(localStorage.getItem(key)) || null;
        }
      }

      // Convert selected data to JSON and trigger download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'selectedData.json';
      link.click();
      URL.revokeObjectURL(url);
    },

    uploadData(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          // Update each item in localStorage from the uploaded JSON
          for (const key in data) {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }

          alert('Data uploaded successfully!');
          // Reload the storage keys in the component to reflect changes
          this.init();
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    },
  };
}
