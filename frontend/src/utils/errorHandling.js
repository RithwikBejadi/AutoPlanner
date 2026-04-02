export function getErrorMessage(error) {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.response) {
    // Axios error with response
    const data = error.response.data;
    
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return data.error;
    }
    
    // HTTP status messages
    const statusMessages = {
      400: 'Invalid request. Please check your input.',
      401: 'Unauthorized. Please log in again.',
      403: 'Forbidden. You don\'t have permission to perform this action.',
      404: 'Resource not found.',
      409: 'Conflict. This resource already exists.',
      422: 'Validation error. Please check your input.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      502: 'Bad gateway. The server is temporarily unavailable.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. The request took too long.',
    };
    
    return statusMessages[error.response.status] || `Request failed with status ${error.response.status}`;
  }
  
  if (error.request) {
    // Network error
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

export function handleApiError(error, toast) {
  const message = getErrorMessage(error);
  
  if (toast) {
    toast.error(message);
  }
  
  console.error('API Error:', error);
  
  return message;
}

export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  return true;
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please enter a valid email address', 'email');
  }
  return true;
}

export function validateNumber(value, fieldName, min, max) {
  const num = Number(value);
  
  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a number`, fieldName);
  }
  
  if (min !== undefined && num < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
  }
  
  if (max !== undefined && num > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`, fieldName);
  }
  
  return true;
}

export function validateTimeRange(startTime, endTime) {
  if (startTime >= endTime) {
    throw new ValidationError('End time must be after start time', 'endTime');
  }
  return true;
}

export function createValidator(validations) {
  return (formData) => {
    const errors = {};
    
    for (const [field, rules] of Object.entries(validations)) {
      try {
        for (const rule of rules) {
          rule(formData[field], formData);
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          errors[field] = error.message;
        } else {
          throw error;
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };
}
