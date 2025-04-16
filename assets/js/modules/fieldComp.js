export default function fieldComp() {
  return {
    density: 'default',
    _density: 'compact',
    validateTool: false,
    devTool: false,
    advancedTool: false,
    currentSelected: null,
    fields: [
      {
        name: 'Field 01',
        id: 'field-01',
        readOnly: true,
        type: 'text',
        valid: false,
        touched: true,
        link: 'some stuff',
        sync: true,
        mandatory: false,
        help: 'We will never share your email with anyone else.',
        label: 'Label field 1',
        value: 'valField01',
        alert: {
          type: 'danger',
          message: 'Message of the alert is this',
        },
      },
      {
        name: 'Field 02',
        id: 'field-02',
        readOnly: false,
        type: 'date',
        valid: true,
        touched: false,
        link: '',
        sync: false,
        mandatory: true,
        label: 'Label field 2',
        value: 'valField02',
      },
      {
        name: 'Field 03',
        id: 'field-03',
        readOnly: true,
        type: 'switch',
        valid: true,
        touched: false,
        link: '',
        sync: false,
        mandatory: false,
        label: 'Label field 3',
        value: 'valField03',
      },
      {
        name: 'Password 04',
        id: 'password-04',
        readOnly: false,
        type: 'password',
        valid: true,
        touched: false,
        link: '',
        sync: false,
        mandatory: false,
        label: 'Password',
        value: 'valField04',
        alert: {
          type: 'warning',
          message: 'Message of the alert is this',
        },
      },
      {
        name: 'Field 05',
        id: 'field-05',
        readOnly: true,
        type: 'selector',
        valid: true,
        touched: false,
        link: '',
        sync: false,
        mandatory: false,
        label: 'Label field 4',
        value: 'valField04',
        option: [
          { value: 'val1', label: 'Option 1' },
          { value: 'val2', label: 'Option 2' },
          { value: 'val3', label: 'Option 3' },
          { value: 'val4', label: 'Option 4' },
        ],
      },
      {
        name: 'Field 4',
        id: 'field-06',
        readOnly: false,
        type: 'number',
        valid: true,
        touched: false,
        link: '',
        sync: false,
        mandatory: false,
        label: 'Label field 4',
        value: 'valField04',
      },
      {
        name: 'Textarea',
        id: 'field-07',
        readOnly: false,
        type: 'textarea',
        rows: 6,
        valid: true,
        touched: false,
        link: '',
        sync: false,
        mandatory: false,
        label: 'Label field 4',
        value: 'valField04',
      },
      {
        name: 'Field 4',
        id: 'field-08',
        readOnly: false,
        type: 'form',
        valid: true,
        touched: false,
        link: '',
        sync: false,
        mandatory: false,
        label: 'Label field 4',
        value: 'valField04',
      },
      {
        name: 'Field 4',
        id: 'field-09',
        readOnly: false,
        type: 'checkbox',
        valid: true,
        touched: false,
        link: '',
        sync: false,
        mandatory: false,
        label: 'Label field 4',
        inline: true,
        option: [
          { checked: false, label: 'Option 1' },
          { checked: false, label: 'Option 2' },
          { checked: false, label: 'Option 3' },
          { checked: false, label: 'Option 4' },
        ],
      },
      {
        name: 'Field 4',
        id: 'field-10',
        readOnly: false,
        type: 'text',
        valid: true,
        touched: false,
        link: '',
        sync: false,
        mandatory: false,
        label: 'Label field 4',
        value: 'valField04',
      },
    ],
    // Method to set the current selected index
    select(index) {
      console.log('select', index);
      this.currentSelected = index;
    },

    toggleValidate() {
      this.validateTool = !this.validateTool;
    },
    toggleAdvanced() {
      this.advancedTool = !this.advancedTool;
    },
    toggleDevTool() {
      this.devTool = !this.devTool;
    },

    getClass(field, index) {
      const classes = {};

      if (this.density === 'compact') {
        if (field.readOnly) {
          classes['border'] = true;
          classes['border-2'] = true;
          classes['border-dashed'] = true;
          classes['text-body-tertiary'] = true;
          if (index === this.currentSelected) {
            classes['ring-2'] = true;
            classes['ring-solid'] = true;
            classes['ring-offset'] = true;

            classes['ring-selected'] = true;
          }
        } else {
          classes['border'] = true;
          classes['border-2'] = true;
          classes['border-transparent'] = true;
          if (index === this.currentSelected) {
            classes['ring-2'] = true;
            classes['ring-solid'] = true;
            classes['ring-offset'] = true;

            classes['ring-selected'] = true;
          }
        }
      } else {
        if (field.readOnly) {
          classes['border-dashed'] = true;
          classes['border'] = true;
          classes['text-body-tertiary'] = true;
          if (index === this.currentSelected) {
            classes['ring-2'] = true;
            classes['ring-solid'] = true;
            classes['ring-offset'] = true;

            classes['ring-selected'] = true;
          }
        } else {
          classes['border'] = true;
          if (index === this.currentSelected) {
            classes['ring-2'] = true;
            classes['ring-solid'] = true;
            classes['ring-offset'] = true;

            classes['ring-selected'] = true;
          }
        }
      }

      return classes;
    },

    init() {},
  };
}
