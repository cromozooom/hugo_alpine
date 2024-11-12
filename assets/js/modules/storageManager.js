export default function storageManager() {
  return {
    storageKeys: [],
    selectedKeys: {},

    init() {
      // Populate storageKeys with all items in localStorage
      this.storageKeys = Object.keys(localStorage);

      // Initialize each item as deselected by default
      this.storageKeys.forEach((key) => {
        this.selectedKeys[key] = false;
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

          // Update each selected item in localStorage
          for (const key in data) {
            if (this.selectedKeys[key]) {
              localStorage.setItem(key, JSON.stringify(data[key]));
            }
          }

          alert('Data uploaded successfully!');
          window.location.reload(); // Refresh to apply new data if necessary
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    },
  };
}
