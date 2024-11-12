export const fields = [
  'Full Name',
  'Date of Birth',
  'Social Security Number/Tax Identification Number',
  'Address',
  'Email Address',
  'Phone Number',
  'Net Worth',
  'Annual Income',
  'Primary Source of Income',
  'Investment Experience',
  'Current Assets',
  'Liabilities',
  'Account Types',
  'Risk Tolerance',
  'Investment Goals',
  'Preferred Investment Types',
  'Time Horizon',
  'Account Type',
  'Beneficiary Name',
  'Beneficiary Relationship',
  'Beneficiary Percentage Share',
  'Accredited Investor Status',
  'Tax Residency',
  'Source of Funds',
  'KYC Information',
];

export const languages = {
  RO: 'Romanian',
  EN: 'English',
};
export const entities = [
  'Contact',
  'Family Offices',
  'Hedge Funds',
  'Private Foundations',
  'Holding Companies',
  'Investment Firms',
  'Pension Funds',
];
export const collators = [
  'collators_Contact',
  'collators_Family Offices',
  'collators_Hedge Funds',
  'collators_Private Foundations',
  'collators_Holding Companies',
  'collators_Investment Firms',
  'collators_Pension Funds',
];
export const generators = [
  'generators_Contact',
  'generators_Family Offices',
  'generators_Hedge Funds',
  'generators_Private Foundations',
  'generators_Holding Companies',
  'generators_Investment Firms',
  'generators_Pension Funds',
];
export const pdfSample = ['1.pdf', '2.pdf', '3.pdf', '4.pdf', '5.pdf'];

export const fieldTypes = ['string', 'textblock', 'selector', 'boolean', 'radio'];

// Utility to set and get fields dictionary from localStorage
const QUERY_LIBRARY_STORAGE_KEY = 'queryLibrary';
const DOC_CATEGORIES_STORAGE_KEY = 'documentCategories';

// Function to initialize or get the fields dictionary from localStorage
export function getQueryLibrary() {
  const storedData = localStorage.getItem(QUERY_LIBRARY_STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : [];
}
export function getdocTemplates() {
  const storedData = localStorage.getItem(DOC_CATEGORIES_STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : [];
}

// Function to add a new entry to the fields dictionary
export function addQueryLibraryEntry(query, entity, queryId) {
  if (!entities.includes(entity)) {
    console.error('Invalid entity or field value');
    return;
  }

  const dictionary = getQueryLibrary();
  dictionary.push({ query, entity, queryId });

  localStorage.setItem(QUERY_LIBRARY_STORAGE_KEY, JSON.stringify(dictionary));
}

// Function to download the fields dictionary as a JSON file
export function downloadQueryLibrary() {
  const data = getQueryLibrary();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'queryLibrary.json';
  link.click();

  URL.revokeObjectURL(url); // Clean up the URL object
}

// Function to upload and parse a JSON file to update the fields dictionary
export function uploadqueryLibrary(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const uploadedData = JSON.parse(e.target.result);

      // Validate the uploaded data (Optional)
      if (Array.isArray(uploadedData)) {
        localStorage.setItem(QUERY_LIBRARY_STORAGE_KEY, JSON.stringify(uploadedData));
        console.log('Fields dictionary updated successfully');
      } else {
        console.error('Invalid data format');
      }
    } catch (error) {
      console.error('Error parsing JSON file', error);
    }
  };
  reader.readAsText(file);
}
