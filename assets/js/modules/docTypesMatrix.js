export default function docTypesMatrix() {
  return {
    docTypes: [],
    groupedData: {},
    groupBy: '',

    init() {
      this.docTypes = JSON.parse(localStorage.getItem('documentTypes')) || [];
      this.prepareData();
      // this.flatTemplates();
    },

    flatTemplates() {
      // Ensure docTypes is properly initialized
      if (!this.docTypes.length) {
        console.warn('No document types available.');
        return;
      }

      let result = this.docTypes.flatMap((docType) =>
        docType.templates.map((template) => ({
          name: docType.name,
          templateName: template,
          entity: docType.entity,
          primaryCode: docType.primaryCode,
          enabledForSearch: docType.enabledForSearch,
          category: docType.category,
          fields: docType.customFileMetadata[template] || [],
          rules: docType.rules,
        })),
      );

      console.log('Flattened templates:', result);
    },

    prepareData() {
      // Process each docType to gather required properties
      this.docTypes = this.docTypes.map((docType) => {
        return {
          ...docType,
          queries: this.getQueriesFromMetadata(docType.customFileMetadata),
        };
      });

      this.groupData(); // Group data by the selected groupBy field
      this.flatTemplates(); // Generate the flattened templates
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
