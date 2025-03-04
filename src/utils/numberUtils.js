/**
 * Safely parse a string to a number, returning a default value if parsing fails
 * @param {string|number} value - The value to parse
 * @param {number} defaultValue - Value to return if parsing fails
 * @return {number} The parsed number or default value
 */
export const safeParseNumber = (value, defaultValue = 0) => {
  // Already a number, just validate it's not NaN
  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : value;
  }
  
  // Null, undefined or empty string
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  // Try to convert string to number
  try {
    const parsed = Number(value.toString().replace(/,/g, '').trim());
    return isNaN(parsed) ? defaultValue : parsed;
  } catch (err) {
    console.error('Error parsing number:', err);
    return defaultValue;
  }
};

/**
 * Format a number as currency
 * @param {number} value - The number to format
 * @param {string} locale - The locale to use for formatting
 * @return {string} Formatted currency string
 */
export const formatCurrency = (value, locale = 'en-US') => {
  // Ensure value is a valid number
  const numValue = safeParseNumber(value, 0);
  
  try {
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(numValue);
  } catch (err) {
    console.error('Error formatting currency:', err);
    return '$0.00';
  }
};
