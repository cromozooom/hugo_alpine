export default function docTypes() {
  return {
    pdfSupport: true,
    templateCategory: [
      {
        name: 'Category name 1',
        id: 1,
      },
      {
        name: 'Category name 2',
        id: 2,
      },
      {
        name: 'Category name 3',
        id: 3,
      },
      {
        name: 'Category name 4',
        id: 4,
      },
      {
        name: 'Category name 5',
        id: 5,
      },
    ],
    documentCategory: [
      {
        name: 'Document category 1',
        canHoldTemplates: true,
      },
      {
        name: 'Document category 2',
        canHoldTemplates: false,
      },
      {
        name: 'Document category 3',
        canHoldTemplates: true,
      },
    ],
    entities: ['user', 'entity 2'],
    documentsTypes: [
      {
        name: 'Razz test',
        id: 1,
        fieldsGroups: [
          {
            fieldGroup: 'General',
            fields: [
              {
                label: 'Name',
                value: null,
                type: 'string',
              },
              {
                label: 'Primary Code',
                value: null,
                type: 'string',
              },
              {
                label: 'Template category',
                value: null,
                type: 'dropdown',
                options: this.templateCategory,
              },
              {
                label: 'Document category',
                value: null,
                type: 'dropdown',
                options: this.documentCategory,
              },
              {
                label: 'Entity',
                value: null,
                type: 'dropdown',
                options: this.entities,
              },
              {
                label: 'Secondary',
                value: null,
                type: 'dropdown',
                secondary: true,
                options: this.entities,
              },
            ],
          },

          {
            fieldGroup: 'Rules',
            fields: [
              {
                label: 'Name',
                value: null,
                type: 'string',
              },
            ],
          },
        ],
        templates: null,
      },
    ],
    init() {
      this.docTypes = this.documentsTypes;
    },
  };
}
