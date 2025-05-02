import fieldManager from './fieldManager';

export default function fieldComp() {
  return {
    density: 'default',
    preview: false,
    validateTool: false,
    devTool: false,
    advancedTool: false,
    showToc: false,
    showEditor: false,
    showTreeEditors: false,

    addStepVisible: false,
    addSectionVisible: false,
    addFieldVisible: false,

    currentFieldSelected: 0,
    currentStepActive: 0,
    currentEditorSelected: 'form',
    currentStepSelected: 0,
    currentSectionSelected: 0,
    currentFieldSelected: 0,
    actionButtonsVisible: false,
    jsonEditorVisible: false,
    jsonEditorInstance: null,

    readOnlyJsonEditorVisible: false,
    readOnlyJsonEditorInstance: null,

    form: {}, // Will be initialized from localStorage
    steps: [], // Will be initialized from localStorage
    newStep: {
      title: '',
      label: '',
      id: '',
      readOnly: false,
      visible: true,
      status: 'pending',
      disabled: false,
      formIndex: 0,
      sections: [],
    },
    newSection: {
      title: '',
      label: '',
    },
    newField: {
      name: '',
      label: '',
      type: 'text', // Default field type
    },

    legacy: false, // Will be initialized from localStorage
    isAtStart: true,
    isAtEnd: false,

    searchQuery: '',
    searchResults: {
      fields: [],
    },
    debounceTimeout: null,

    // Initialize the component
    init() {
      // Load data from localStorage if it exists
      const storedData = localStorage.getItem('formData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        this.form = parsedData.form || [];
        this.steps = parsedData.steps || [];
        this.density = parsedData.density || 'default';
        this.validateTool = parsedData.validateTool || false;
        this.showToc = parsedData.showToc || false;
        this.showEditor = parsedData.showEditor || false;
        this.devTool = parsedData.devTool || false;
        this.preview = parsedData.preview || false;
        this.advancedTool = parsedData.advancedTool || false;
        this.currentStepSelected = parsedData.currentStepSelected || 0;
        this.currentSectionSelected = parsedData.currentSectionSelected || 0;
        this.currentFieldSelected = parsedData.currentFieldSelected || 0;
        this.addStepVisible = parsedData.addStepVisible || 0;
        this.addSectionVisible = parsedData.addSectionVisible || 0;
        this.addFieldVisible = parsedData.addFieldVisible || false;
        this.currentEditorSelected = parsedData.currentEditorSelected ?? 'form';
        this.showTreeEditors = parsedData.showTreeEditors || false;
      } else {
        // Initialize with default fields if no data exists
        this.form = {
          name: 'KYC_Charity',
          id: '123',
          actionButtons: {
            startButtons: [
              {
                label: 'Cancel',
                id: 'cancel-button',
                icon: 'fa-solid fa-play',
                type: 'button',
                ui: 'outline',
              },
            ],
            endButtons: [
              {
                label: 'Save',
                id: 'save-button',
                icon: 'fa-solid fa-play',
                type: 'button',
                ui: 'solid',
              },
            ],
          },
          steps: [
            {
              title: 'details',
              label: 'Details',
              id: 'step-01',
              readOnly: false,
              visible: true,
              status: 'completed',
              disabled: false,
              formIndex: 0,
              sections: [
                {
                  title: 'details-section 1',
                  label: 'Details Section 1',
                  fields: [
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
                      name: 'Date of birth',
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
                      name: 'Suitability Review Lookup',
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
                      name: 'Password',
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
                      name: 'Are you a UK resident for tax purposes?',
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
                      name: 'Budget',
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
                      label: 'Budget',
                      value: 'valField04',
                    },
                    {
                      name: 'Are you resident in any other country for tax purposes?',
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
                      name: 'Are you in good health 149?',
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
                      name: 'Are you in good health? - (inline)',
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
                      name: 'Are you in good health ?',
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
                      name: 'Are you a smoker?',
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
                  ],
                },
              ],
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
              sections: [
                {
                  title: 'recent-financial-objective',
                  label: 'Recent Financial objective',

                  fields: [
                    {
                      name: 'Date of objective',
                      id: 'field-020',
                      readOnly: false,
                      visible: true,
                      disabled: false,
                      type: 'date',
                      valid: true,
                      touched: false,
                      link: '',
                      sync: false,
                      mandatory: true,
                      label: 'Date of objective',
                      value: 'valField020',
                    },
                  ],
                },
              ],
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
          ],
        };
        this.addStepVisible = false;
        this.addSectionVisible = false;
        this.addFieldVisible = false;
        this.currentStepSelected = 0;
        this.currentSectionSelected = 0;
        this.currentFieldSelected = 0;
        this.currentEditorSelected = 'form';
        this.showTreeEditors = false;
      }

      // Ensure $watch is called after initialization
      this.$watch('form', () => this.saveToLocalStorage());
      this.$watch('density', () => this.saveToLocalStorage());
      this.$watch('showToc', () => this.saveToLocalStorage());
      this.$watch('showEditor', () => this.saveToLocalStorage());
      this.$watch('preview', () => this.saveToLocalStorage());
      this.$watch('validateTool', () => this.saveToLocalStorage());
      this.$watch('devTool', () => this.saveToLocalStorage());
      this.$watch('advancedTool', () => this.saveToLocalStorage());
      this.$watch('currentEditorSelected', () => this.saveToLocalStorage());
      this.$watch('currentStepSelected', () => this.saveToLocalStorage());
      this.$watch('currentSectionSelected', () => this.saveToLocalStorage());
      this.$watch('currentFieldSelected', () => this.saveToLocalStorage());
      this.$watch('addStepVisible', () => this.saveToLocalStorage());
      this.$watch('addSectionVisible', () => this.saveToLocalStorage());
      this.$watch('addFieldVisible', () => this.saveToLocalStorage());
      this.$watch('showTreeEditors', () => this.saveToLocalStorage());
    },

    async loadStaticForm() {
      try {
        const response = await fetch('/field/kyc-charity.json'); // Path to the JSON file
        if (!response.ok) {
          throw new Error('Failed to load the form.');
        }

        const formData = await response.json();
        this.form = formData; // Update the form with the loaded data
        this.saveToLocalStorage(); // Save the loaded form to localStorage
        alert('KYC Charity Form loaded successfully!');
      } catch (error) {
        console.error('Error loading the form:', error);
        alert('Failed to load the form. Please try again.');
      }
    },

    toggleShowTreeEditors() {
      this.showTreeEditors = !this.showTreeEditors;
      if (this.showTreeEditors) {
        this.currentStepSelected = 0;
        this.currentSectionSelected = 0;
        this.currentFieldSelected = 0;
        this.currentEditorSelected = 'form';
        this.selectAndScroll(0);
      } else {
        this.currentStepSelected = null;
        this.currentSectionSelected = null;
        this.currentFieldSelected = null;
        this.currentEditorSelected = 'form';
      }
    },

    toggleJsonEditor() {
      this.jsonEditorVisible = !this.jsonEditorVisible;

      if (this.jsonEditorVisible) {
        this.$nextTick(() => {
          const container = document.getElementById('jsoneditor');
          if (!this.jsonEditorInstance) {
            this.jsonEditorInstance = new JSONEditor(container, {
              mode: 'code', // You can also use 'tree', 'view', or 'text'
              modes: ['code', 'tree', 'view'], // Allowed modes
              onChangeJSON: (updatedJson) => {
                this.form = updatedJson; // Update the form object dynamically
              },
            });
          }
          this.jsonEditorInstance.set(this.form); // Load the current form data into the editor
        });
      } else {
        if (this.jsonEditorInstance) {
          this.jsonEditorInstance.destroy();
          this.jsonEditorInstance = null;
        }
      }
    },

    saveJsonEditor() {
      if (this.jsonEditorInstance) {
        try {
          const updatedForm = this.jsonEditorInstance.get(); // Get the updated JSON
          this.form = updatedForm; // Update the form object
          this.saveToLocalStorage(); // Save the updated form to local storage
          this.toggleJsonEditor(); // Close the editor
        } catch (error) {
          console.error('Invalid JSON:', error);
          alert('Invalid JSON. Please fix the errors before saving.');
        }
      }
    },

    toggleReadOnlyJsonEditor() {
      this.readOnlyJsonEditorVisible = !this.readOnlyJsonEditorVisible;

      if (this.readOnlyJsonEditorVisible) {
        this.$nextTick(() => {
          const container = document.getElementById('readOnlyJsonEditor');
          if (!this.readOnlyJsonEditorInstance) {
            this.readOnlyJsonEditorInstance = new JSONEditor(container, {
              mode: 'code', // Default mode
              modes: ['code', 'tree'], // Allow switching between code and tree modes
              onChangeJSON: (updatedJson) => {
                const field =
                  this.form.steps?.[this.currentStepSelected]?.sections?.[this.currentSectionSelected]?.fields?.[
                    this.currentFieldSelected
                  ];
                if (field) {
                  field.readOnly = updatedJson.readOnly; // Update only the readOnly property
                }
              },
            });
          }

          // Load the current readOnly property into the editor
          const field =
            this.form.steps?.[this.currentStepSelected]?.sections?.[this.currentSectionSelected]?.fields?.[
              this.currentFieldSelected
            ];
          if (field) {
            this.readOnlyJsonEditorInstance.set({ readOnly: field.readOnly });
          }
        });
      } else {
        if (this.readOnlyJsonEditorInstance) {
          this.readOnlyJsonEditorInstance.destroy();
          this.readOnlyJsonEditorInstance = null;
        }
      }
    },

    saveReadOnlyJsonEditor() {
      if (this.readOnlyJsonEditorInstance) {
        try {
          const updatedData = this.readOnlyJsonEditorInstance.get(); // Get the updated JSON
          const field =
            this.form.steps?.[this.currentStepSelected]?.sections?.[this.currentSectionSelected]?.fields?.[
              this.currentFieldSelected
            ];
          if (field) {
            field.readOnly = updatedData.readOnly; // Update only the readOnly property
          }
          this.saveToLocalStorage(); // Save the updated form to local storage
          this.toggleReadOnlyJsonEditor(); // Close the editor
        } catch (error) {
          console.error('Invalid JSON:', error);
          alert('Invalid JSON. Please fix the errors before saving.');
        }
      }
    },

    duplicateStep(stepIndex) {
      if (stepIndex === null || stepIndex === undefined) {
        console.warn('No step selected to duplicate');
        return;
      }

      // Get the current step
      const currentStep = this.form.steps?.[stepIndex];
      if (!currentStep) {
        console.warn('Step not found');
        return;
      }

      // Create a deep copy of the step
      const newStep = JSON.parse(JSON.stringify(currentStep));

      // Modify the new step (e.g., update the title or ID)
      newStep.title = `${newStep.title} (Copy)`;
      newStep.id = `${newStep.id || ''}_copy`;

      // Insert the new step after the current step
      this.form.steps.splice(stepIndex + 1, 0, newStep);

      // Save the updated steps to local storage
      this.saveToLocalStorage();

      console.log('Step duplicated and saved to local storage:', newStep);
    },

    navigateToAnything(stepIndex, sectionIndex, fieldIndex) {
      if (fieldIndex === undefined || fieldIndex === null) {
        this.navToSection(stepIndex, sectionIndex);
      } else {
        this.navToField(stepIndex, sectionIndex, fieldIndex);
      }
    },

    navToSection(stepIndex, sectionIndex) {
      if (this.showTreeEditors) {
        this.navToField(stepIndex, sectionIndex, 0);
      } else {
        this.currentStepSelected = stepIndex;
        this.currentSectionSelected = sectionIndex;
        this.currentFieldSelected = null;
      }
      console.log('navToSection', stepIndex, sectionIndex);

      this.$nextTick(() => {
        const mainArea = document.querySelector('#mainArea');
        const sectionElement = mainArea?.querySelector(
          `[data-sectionLink-step-index="${stepIndex}"][data-sectionLink-section-index="${sectionIndex}"]`,
        );

        if (!sectionElement) {
          console.warn('Section element not found');
          return;
        }

        // Calculate the offset
        const offset = 10 * parseFloat(getComputedStyle(document.documentElement).fontSize); // Convert 5rem to pixels
        const elementTop = sectionElement.offsetTop; // Position of the element relative to the container

        // Scroll the container to the element with the offset
        mainArea.scrollTo({
          top: elementTop - offset,
          behavior: 'smooth',
        });

        if (!this.showTreeEditors) {
          this.currentEditorSelected = 'section';
        }
      });

      return;
    },

    navToField(stepIndex, sectionIndex, fieldIndex) {
      console.log('navToField', stepIndex, sectionIndex, fieldIndex);

      this.currentStepSelected = stepIndex;
      this.currentSectionSelected = sectionIndex;
      this.currentFieldSelected = fieldIndex;

      // Wait for Alpine.js to update the DOM
      this.$nextTick(() => {
        const mainArea = document.querySelector('#mainArea');
        const fieldElement = mainArea?.querySelector(
          `[data-fieldLink-step-index="${stepIndex}"][data-fieldLink-section-index="${sectionIndex}"][data-fieldLink-field-index="${fieldIndex}"]`,
        );

        if (fieldElement) {
          // Scroll the field into view within #mainArea
          fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (!this.showTreeEditors) {
            this.currentEditorSelected = 'field';
          }
        } else {
          console.warn('Field element not found');
        }
      });
    },

    debounceSearch() {
      clearTimeout(this.debounceTimeout); // Clear the previous timeout
      this.debounceTimeout = setTimeout(() => {
        this.performSearch(); // Call the search function after the delay
      }, 300); // Adjust the delay (in milliseconds) as needed
    },

    // Method to add a new step

    performSearch() {
      const query = this.searchQuery.toLowerCase().trim();

      // Clear previous results
      this.searchResults = { fields: [] };

      // If the query is empty, do not perform the search
      if (!query) {
        return;
      }

      // Ensure `form.steps` is defined and is an array
      if (!this.form.steps || !Array.isArray(this.form.steps)) {
        console.warn('form.steps is undefined or not an array');
        return;
      }

      // Search only in fields
      this.form.steps.forEach((step, stepIndex) => {
        // Ensure `step.sections` is defined and is an array
        if (!step.sections || !Array.isArray(step.sections)) {
          console.warn(`step.sections is undefined or not an array for stepIndex: ${stepIndex}`);
          return;
        }

        step.sections.forEach((section, sectionIndex) => {
          // Ensure `section.fields` is defined and is an array
          if (!section.fields || !Array.isArray(section.fields)) {
            console.warn(`section.fields is undefined or not an array for sectionIndex: ${sectionIndex}`);
            return;
          }

          section.fields.forEach((field, fieldIndex) => {
            // Check if any field property matches the query
            for (const key in field) {
              if (
                // check all key for fields
                // typeof field[key] === 'string' && field[key].toLowerCase().includes(query)

                (key === 'name' || key === 'label') &&
                typeof field[key] === 'string' &&
                field[key].toLowerCase().includes(query)
              ) {
                // Add the result with indices
                this.searchResults.fields.push({
                  stepIndex,
                  sectionIndex,
                  fieldIndex,
                  fieldName: field.name,
                  fieldKey: key,
                  fieldValue: field[key],
                });
                break; // Stop checking other properties of this field
              }
            }
          });
        });
      });
    },

    // Save data to localStorage
    saveToLocalStorage() {
      const dataToStore = {
        form: this.form,
        steps: this.steps,
        showToc: this.showToc,
        showEditor: this.showEditor,
        density: this.density,
        validateTool: this.validateTool,
        devTool: this.devTool,
        advancedTool: this.advancedTool,
        preview: this.preview,
        currentEditorSelected: this.currentEditorSelected,
        currentStepSelected: this.currentStepSelected,
        currentSectionSelected: this.currentSectionSelected,
        currentFieldSelected: this.currentFieldSelected,
        addStepVisible: this.addStepVisible,
      };
      localStorage.setItem('formData', JSON.stringify(dataToStore));
    },

    // Method to set the current selected index
    selectEditor(editor) {
      if (editor === 'form') {
        this.currentStepSelected = null;
        this.currentSectionSelected = null;
        this.currentFieldSelected = null;
      }
      if (this.showTreeEditors) {
        if (this.currentEditorSelected === editor) {
          console.log('Editor selected:', this.currentEditorSelected);
          console.log('Editor already selected:', editor);
          this.currentEditorSelected = null;
        } else {
          this.currentEditorSelected = editor;
        }
      } else {
        this.currentEditorSelected = editor;
      }
    },
    selectField(index) {
      this.currentFieldSelected = index;
    },

    select(stepIndex, sectionIndex, fieldIndex) {
      // Update the current step if it's different
      if (stepIndex !== this.currentStepSelected) {
        this.currentStepSelected = stepIndex;
        this.currentEditorSelected = 'step';
      }

      // Update the current section if it's different and not null
      if (sectionIndex !== null && sectionIndex !== this.currentSectionSelected) {
        this.currentSectionSelected = sectionIndex;
        this.currentEditorSelected = 'section';
      } else if (sectionIndex === null) {
        this.currentSectionSelected = null; // Reset if sectionIndex is null
      }

      // Update the current field if it's different and not null
      if (fieldIndex !== null && fieldIndex !== this.currentFieldSelected) {
        this.currentFieldSelected = fieldIndex;
        this.currentEditorSelected = 'field';
      } else if (fieldIndex === null && sectionIndex !== null) {
        // Ensure the editor is set to 'section' if fieldIndex is null but sectionIndex is valid
        this.currentFieldSelected = null;
        this.currentEditorSelected = 'section';
      } else if (fieldIndex === null && sectionIndex === null) {
        // Reset editor to 'step' if both sectionIndex and fieldIndex are null
        this.currentEditorSelected = 'step';
      }

      // Debugging output (optional)
      console.log('select', stepIndex, sectionIndex, fieldIndex, this.currentEditorSelected);
    },

    toggleAddFieldVisible() {
      this.addFieldVisible = !this.addFieldVisible;
    },
    toggleAddSectionVisible() {
      this.addSectionVisible = !this.addSectionVisible;
    },
    toggleAddStepVisible() {
      this.currentEditorSelected = 'step';
      console.log('toggleAddStepVisible', this.currentEditorSelected);
      this.addStepVisible = !this.addStepVisible;
    },
    toggleToc() {
      this.showToc = !this.showToc;
    },
    toggleEditor() {
      if (showTreeEditors) {
        this.showEditor = !this.showEditor;
      }
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

    scrollSteps(direction) {
      const container = document.getElementById('scrollable-steps');
      const scrollAmount = container.offsetWidth; // Scroll by the width of the container

      if (direction === 'next') {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      } else if (direction === 'prev') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }

      // Check scroll position after scrolling
      this.checkScrollPosition();
    },

    checkScrollPosition() {
      const container = document.getElementById('scrollable-steps');
      this.isAtStart = container.scrollLeft === 0;
      this.isAtEnd = container.scrollLeft + container.offsetWidth >= container.scrollWidth;
    },

    selectAndScroll(stepIndex) {
      if (!this.showTreeEditors) {
        this.selectStep(stepIndex);
        this.select(stepIndex, null, null);
        this.currentEditorSelected = 'step';
      } else {
        this.select(stepIndex, 0, 0);
        this.selectStep(stepIndex);
      }
    },

    // Method to add a new section
    addSection() {
      if (!this.newSection.title || !this.newSection.label) {
        alert('Please fill out all fields.');
        return;
      }

      // Ensure the current step and its sections array exist
      const currentStep = this.form.steps[this.currentStepSelected];
      if (!currentStep) {
        alert('No step is selected or the step does not exist.');
        return;
      }

      if (!currentStep.sections) {
        currentStep.sections = []; // Initialize sections as an empty array
      }

      // Add the new section to the current step
      currentStep.sections.push({
        ...this.newSection,
        fields: [], // Initialize with an empty fields array
      });

      // Reset the newSection object
      this.newSection = {
        title: '',
        label: '',
      };

      this.saveToLocalStorage();
      alert('Section added successfully!');
    },

    addStep() {
      if (!this.newStep.title || !this.newStep.label || !this.newStep.id) {
        alert('Please fill out all fields.');
        return;
      }

      // Add the new step to the steps array
      this.form.steps.push({ ...this.newStep });

      // Reset the newStep object
      this.newStep = {
        title: '',
        label: '',
        id: '',
        readOnly: false,
        visible: true,
        status: 'pending',
        disabled: false,
        formIndex: 0,
        sections: [],
      };

      this.saveToLocalStorage();
      this.selectStep(this.form.steps.length - 1);

      alert('Step added successfully!');
    },

    trashStep(stepIndex) {
      if (confirm('Are you sure you want to delete this step?')) {
        let prevStepIndex = stepIndex - 1;
        // Remove the step at the given index
        this.form.steps.splice(stepIndex, 1);

        // Optionally reset the current selection if the deleted step was selected
        if (this.currentStepSelected === stepIndex) {
          this.currentStepSelected = null;
          this.currentSectionSelected = null;
          this.currentFieldSelected = null;
        }
        if (prevStepIndex < 0) {
          this.selectStep(0);
        } else {
          this.selectStep(prevStepIndex);
        }
      }
    },

    addField() {
      if (!this.newField.name || !this.newField.label) {
        alert('Please fill out all fields.');
        return;
      }

      // Ensure the current section and its fields array exist
      const currentSection = this.form.steps?.[this.currentStepSelected]?.sections?.[this.currentSectionSelected];
      if (!currentSection) {
        alert('No section is selected or the section does not exist.');
        return;
      }

      if (!currentSection.fields) {
        currentSection.fields = []; // Initialize fields as an empty array
      }

      // Generate the field ID
      const fieldId = `${this.newField.name.toLowerCase().replace(/\s+/g, '-')}-step${this.currentStepSelected}-section${this.currentSectionSelected}-field${currentSection.fields.length}`;

      // Add the new field to the current section
      currentSection.fields.push({
        ...this.newField,
        id: fieldId, // Automatically generated ID
        value: '', // Default value
        mandatory: false,
        readOnly: false,
        help: '',
        option: [], // For selector or checkbox types
      });

      // Reset the newField object
      this.newField = {
        name: '',
        label: '',
        type: 'text',
      };

      this.saveToLocalStorage();
      alert('Field added successfully!');
    },

    editField(fieldIndex) {
      this.currentFieldSelected = fieldIndex;
      this.currentEditorSelected = 'field'; // Switch to field editor
    },

    trashField(fieldIndex) {
      if (confirm('Are you sure you want to delete this field?')) {
        this.form.steps[this.currentStepSelected].sections[this.currentSectionSelected].fields.splice(fieldIndex, 1);
        this.saveToLocalStorage(); // Save changes to local storage
      }
    },

    selectStep(stepIndex) {
      this.currentStepSelected = stepIndex;

      // Scroll the selected step into the visible area only if it's not fully visible
      const container = document.getElementById('scrollable-steps');
      const stepElement = container.children[stepIndex];
      if (stepElement) {
        const containerLeft = container.scrollLeft;
        const containerRight = container.scrollLeft + container.offsetWidth;

        const stepLeft = stepElement.offsetLeft;
        const stepRight = stepElement.offsetLeft + stepElement.offsetWidth;

        // Check if the step is fully visible
        if (stepLeft < containerLeft) {
          // Scroll to bring the step into view on the left side
          container.scrollTo({ left: stepLeft, behavior: 'smooth' });
        } else if (stepRight > containerRight) {
          // Scroll to bring the step into view on the right side
          container.scrollTo({ left: container.scrollLeft + (stepRight - containerRight), behavior: 'smooth' });
        }
      }

      // Check scroll position after selecting a step
      this.checkScrollPosition();
    },

    // Method to download the form as a JSON file
    downloadForm() {
      const dataStr = JSON.stringify(this.form, null, 2); // Convert form data to JSON
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create a temporary link element
      const a = document.createElement('a');
      a.href = url;
      a.download = 'form.json'; // File name for the downloaded file
      a.click();

      // Clean up the URL object
      URL.revokeObjectURL(url);
    },

    // Method to load a JSON file and update the form
    loadForm(event) {
      const file = event.target.files[0];
      if (!file) {
        alert('No file selected.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result); // Parse the JSON file
          this.form = jsonData; // Update the form with the loaded data
          this.saveToLocalStorage(); // Save the loaded form to localStorage
          alert('Form loaded successfully!');
        } catch (error) {
          alert('Invalid JSON file.');
          console.error('Error loading form:', error);
        }
      };
      reader.readAsText(file); // Read the file as text
    },

    getClass(field, stepIndex, sectionIndex, fieldIndex) {
      const isSelected =
        this.currentStepSelected === stepIndex &&
        this.currentSectionSelected === sectionIndex &&
        this.currentFieldSelected === fieldIndex;

      const classes = {
        'field-selected': isSelected, // Add a class if the field is selected
        'field-readonly': field.readOnly, // Add a class if the field is read-only
        'field-mandatory': field.mandatory, // Add a class if the field is mandatory
      };

      // Add density-specific and read-only logic
      if (this.density === 'compact') {
        if (field.readOnly) {
          Object.assign(classes, {
            border: true,
            'border-dark': true,
            'border-2': true,
            'border-doted': true,
            'text-body-tertiary': true,
          });
          if (isSelected) {
            Object.assign(classes, {
              'shadow-sm': true,
              'ring-3': true,
              'ring-solid': true,
              'ring-offset-2': true,
              'ring-selected': true,
            });
          }
        } else {
          Object.assign(classes, {
            'shadow-sm': true,
            border: true,
            'border-1': true,
            'border-transparent': true,
          });
          if (isSelected) {
            Object.assign(classes, {
              'ring-3': true,
              'ring-solid': true,
              'ring-offset-2': true,
              'ring-selected': true,
            });
          }
        }
      } else {
        if (field.readOnly) {
          Object.assign(classes, {
            'xopacity-75': true,
            'border-doted': true,
            border: true,
            'border-dark': true,
            'border-2': true,
            'text-body-tertiary': true,
          });
          if (isSelected) {
            Object.assign(classes, {
              'ring-3': true,
              'ring-solid': true,
              'ring-offset-2': true,
              'ring-selected': true,
            });
          }
        } else {
          Object.assign(classes, {
            border: true,
            'border-2': true,
          });
          if (isSelected) {
            Object.assign(classes, {
              'ring-3': true,
              'ring-solid': true,
              'ring-offset-2': true,
              'ring-selected': true,
            });
          }
        }
      }

      return classes;
    },
  };
}
