import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function useFormValidation(schema, defaultValues = {}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange', // Validate on change for real-time feedback
  });

  return form;
}

export function getFieldError(errors, fieldName) {
  return errors[fieldName]?.message;
}

export function hasFieldError(errors, fieldName) {
  return !!errors[fieldName];
}
