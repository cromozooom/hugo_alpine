export default function docTypesMatrix() {
  return {
    docTypes: [],
    groupedData: {},
    groupBy: '',

    init() {
      this.docTypes = JSON.parse(localStorage.getItem('documentTypes')) || [];
      this.prepareData();
    },

    prepareData() {
      // Process each docType to gather required properties
      this.docTypes = this.docTypes.map((docType) => {
        return {
          name: docType.name || '',
          entity: docType.entity || '',
          queries: this.getQueriesFromMetadata(docType.customFileMetadata),
          category: docType.category || '',
        };
      });
      this.groupData();
    },

    getQueriesFromMetadata(customFileMetadata) {
      // Extract unique queries from customFileMetadata
      const queries = [];
      for (const templateKey in customFileMetadata) {
        const fields = customFileMetadata[templateKey];
        fields.forEach((field) => {
          if (field.query && !queries.includes(field.query)) {
            queries.push(field.query);
          }
        });
      }
      return queries;
    },

    groupData() {
      if (!this.groupBy) {
        this.groupedData = {}; // Reset grouped data if no grouping
        return;
      }

      this.groupedData = this.docTypes.reduce((groups, item) => {
        const groupKey = item[this.groupBy] || 'Undefined';
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
      }, {});
    },

    watch: {
      groupBy() {
        this.groupData();
      },
    },
  };
}
