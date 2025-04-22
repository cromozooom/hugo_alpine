export default function fieldComp() {
  return {
    density: 'default',
    preview: false,
    validateTool: false,
    devTool: false,
    advancedTool: false,
    currentFieldSelected: null,
    currentStepActive: 1,
    currentStepSelected: 1,
    fields: [], // Will be initialized from localStorage
    steps: [], // Will be initialized from localStorage
    initialFIelds: [], // Will be initialized from localStorage

    // Initialize the component
    init() {
      // Load data from localStorage if it exists
      const storedData = localStorage.getItem('fieldData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        this.fields = parsedData.fields || [];
        this.steps = parsedData.steps || [];
        this.density = parsedData.density || 'default';
        this.validateTool = parsedData.validateTool || false;
        this.devTool = parsedData.devTool || false;
        this.preview = parsedData.preview || false;
        this.advancedTool = parsedData.advancedTool || false;
        this.currentFieldSelected = parsedData.currentFieldSelected || null;
      } else {
        // Initialize with default fields if no data exists
        this.steps = [
          {
            title: 'details',
            label: 'Details',
            id: 'step-01',
            readOnly: false,
            visible: true,
            status: 'completed',
            disabled: false,
            formIndex: 0,
          },
          {
            title: 'financial objectives',
            label: 'Financial Objectives',
            id: 'step-02',
            readOnly: true,
            visible: true,
            status: 'completed',
            disabled: false,
            formIndex: 0,
          },
          {
            title: 'communication details',
            label: 'Communication Details',
            id: 'step-03',
            readOnly: false,
            visible: true,
            status: 'completed',
            disabled: false,
            formIndex: 0,
          },
          {
            title: 'hidden dynamic fields',
            label: 'Hidden Dynamic Fields',
            id: 'step-03',
            readOnly: false,
            visible: true,
            status: 'completed',
            disabled: false,
            formIndex: 0,
          },
          {
            title: 'client specific',
            label: 'Client Specific',
            id: 'step-03',
            readOnly: false,
            visible: true,
            status: 'completed',
            disabled: false,
            formIndex: 0,
          },
          {
            title: 'client specific',
            label: 'Client Specific',
            id: 'step-03',
            readOnly: false,
            visible: true,
            status: 'completed',
            disabled: false,
            formIndex: 0,
          },
          {
            title: 'client specific',
            label: 'Client Specific',
            id: 'step-03',
            readOnly: false,
            visible: true,
            status: 'completed',
            disabled: false,
            formIndex: 0,
          },
        ];
        this.fields = [
          {
            name: 'Contact Category',
            id: 'field-01',
            readOnly: true,
            visible: true,
            disabled: false,
            type: 'text',
            valid: false,
            touched: true,
            link: 'some stuff',
            sync: true,
            mandatory: false,
            help: 'We will never share your email with anyone else.',
            label: 'Contact Category',
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
            visible: true,
            disabled: false,
            type: 'date',
            valid: true,
            touched: false,
            link: '',
            sync: false,
            mandatory: true,
            label: 'Date of birth',
            value: 'valField02',
          },
          {
            name: 'Field 03',
            id: 'field-03',
            readOnly: true,
            visible: true,
            disabled: false,
            type: 'switch',
            valid: true,
            touched: false,
            link: '',
            sync: false,
            mandatory: false,
            label: 'Suitability Review Lookup',
            value: 'valField03',
          },
          {
            name: 'Password 04',
            id: 'password-04',
            readOnly: false,
            visible: true,
            disabled: false,
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
            visible: true,
            disabled: false,
            type: 'selector',
            valid: true,
            touched: false,
            link: '',
            sync: false,
            mandatory: true,
            label: 'Are you a UK resident for tax purposes?',
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
            visible: true,
            disabled: false,
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
            visible: true,
            disabled: false,
            type: 'textarea',
            rows: 6,
            valid: true,
            touched: false,
            link: '',
            sync: false,
            mandatory: false,
            label: 'Are you resident in any other country for tax purposes?',
            help: 'Are you resident in any other country for tax purposes?',
            value: 'valField04',
            alert: {
              type: 'danger',
              message: 'Message of the alert is this',
            },
          },
          {
            name: 'Field 4',
            id: 'field-08',
            readOnly: false,
            visible: true,
            disabled: false,
            type: 'form',
            valid: true,
            touched: false,
            link: '',
            sync: false,
            mandatory: false,
            label: 'Are you in good health 149?',
            help: 'Please provide your tax identification or reference numbers',
            value: 'valField04',
          },
          {
            name: 'Field 4',
            id: 'field-09',
            readOnly: false,
            visible: true,
            disabled: false,
            type: 'checkbox',
            valid: true,
            touched: false,
            link: '',
            sync: false,
            mandatory: false,
            label: 'Are you in good health? - (inline)',
            help: 'This is inline - Please provide your tax identification or reference numbers',
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
            id: 'field-09',
            readOnly: false,
            visible: true,
            disabled: false,
            type: 'checkbox',
            valid: true,
            touched: false,
            link: '',
            sync: false,
            mandatory: false,
            label: 'Are you in good health ?',
            help: 'Please provide your tax identification or reference numbers',
            inline: false,
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
            visible: true,
            disabled: false,
            type: 'text',
            valid: true,
            touched: false,
            link: '',
            sync: false,
            mandatory: false,
            label: 'Are you a smoker?',
            help: 'Please provide additional information if you have answered ‘No’ above:',
            value: 'valField04',
          },
        ];
      }

      // Ensure $watch is called after initialization
      this.$watch('fields', () => this.saveToLocalStorage());
      this.$watch('density', () => this.saveToLocalStorage());
      this.$watch('preview', () => this.saveToLocalStorage());
      this.$watch('validateTool', () => this.saveToLocalStorage());
      this.$watch('devTool', () => this.saveToLocalStorage());
      this.$watch('advancedTool', () => this.saveToLocalStorage());
      this.$watch('currentFieldSelected', () => this.saveToLocalStorage());
    },

    // Save data to localStorage
    saveToLocalStorage() {
      const dataToStore = {
        fields: this.fields,
        steps: this.steps,
        density: this.density,
        validateTool: this.validateTool,
        devTool: this.devTool,
        advancedTool: this.advancedTool,
        preview: this.preview,
        currentFieldSelected: this.currentFieldSelected,
      };
      localStorage.setItem('fieldData', JSON.stringify(dataToStore));
    },

    // Method to set the current selected index
    select(index) {
      this.currentFieldSelected = index;
    },

    togglePreview() {
      this.preview = !this.preview;
      // if (this.currentFieldSelected !== null) {
      //   this.currentFieldSelected = null;
      // }
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
          classes['border-dark'] = true;
          classes['border-2'] = true;
          classes['border-doted'] = true;
          classes['text-body-tertiary'] = true;
          if (index === this.currentFieldSelected) {
            classes['shadow-sm'] = true;
            classes['ring-3'] = true;
            classes['ring-solid'] = true;
            classes['ring-offset-2'] = true;
            classes['ring-selected'] = true;
          }
        } else {
          classes['shadow-sm'] = true;
          classes['border'] = true;
          classes['border-1'] = true;
          classes['border-transparent'] = true;
          if (index === this.currentFieldSelected) {
            classes['ring-3'] = true;
            classes['ring-solid'] = true;
            classes['ring-offset-2'] = true;
            classes['ring-selected'] = true;
          }
        }
      } else {
        if (field.readOnly) {
          classes['xopacity-75'] = true;
          classes['border-doted'] = true;
          classes['border'] = true;
          classes['border-dark'] = true;
          classes['border-2'] = true;
          classes['text-body-tertiary'] = true;
          if (index === this.currentFieldSelected) {
            classes['ring-3'] = true;
            classes['ring-solid'] = true;
            classes['ring-offset-2'] = true;
            classes['ring-selected'] = true;
          }
        } else {
          classes['border'] = true;
          classes['border-2'] = true;
          if (index === this.currentFieldSelected) {
            classes['ring-3'] = true;
            classes['ring-solid'] = true;
            classes['ring-offset-2'] = true;
            classes['ring-selected'] = true;
          }
        }
      }

      return classes;
    },
  };
}
