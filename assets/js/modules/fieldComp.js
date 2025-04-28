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

    currentFieldSelected: 0,
    currentStepActive: 0,
    currentEditorSelected: 'form',
    currentStepSelected: 0,
    currentSectionSelected: 0,
    currentFieldSelected: 0,

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
        this.currentStepSelected = parsedData.currentStepSelected || null;
        this.currentSectionSelected = parsedData.currentSectionSelected || null;
        this.currentFieldSelected = parsedData.currentFieldSelected || null;
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

    navigateToField(stepIndex, sectionIndex, fieldIndex) {
      this.currentStepSelected = stepIndex;
      this.currentSectionSelected = sectionIndex;
      this.currentFieldSelected = fieldIndex;

      // Wait for Alpine.js to update the DOM
      this.$nextTick(() => {
        const mainArea = document.querySelector('#mainArea');
        const fieldElement = mainArea?.querySelector(
          `[data-step-index="${stepIndex}"][data-section-index="${sectionIndex}"][data-field-index="${fieldIndex}"]`,
        );

        if (fieldElement) {
          // Scroll the field into view within #mainArea
          fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
              if (typeof field[key] === 'string' && field[key].toLowerCase().includes(query)) {
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
      };
      localStorage.setItem('formData', JSON.stringify(dataToStore));
    },

    // Method to set the current selected index
    selectEditor(editor) {
      if (this.currentEditorSelected === editor) {
        this.currentEditorSelected = null;
      } else {
        this.currentEditorSelected = editor;
      }
    },
    selectField(index) {
      this.currentFieldSelected = index;
    },

    select(stepIndex, sectionIndex, fieldIndex) {
      if (stepIndex !== this.currentStepSelected) {
        this.currentStepSelected = stepIndex;
      } else {
      }
      if (sectionIndex !== this.currentSectionSelected) {
        this.currentSectionSelected = sectionIndex;
      } else {
      }
      if (fieldIndex !== this.currentFieldSelected) {
        this.currentFieldSelected = fieldIndex;
      } else {
      }
      // console.log('select 650', stepIndex, sectionIndex, fieldIndex);
    },

    toggleToc() {
      this.showToc = !this.showToc;
    },
    toggleEditor() {
      this.showEditor = !this.showEditor;
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
      this.select(stepIndex, 0, 0);
      this.selectStep(stepIndex);
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

    _getClass(field, index) {
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
