import React from 'react';
import { Controller } from 'react-hook-form';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Toggle from '../ui/Toggle';
import Checkbox from '../ui/Checkbox';

export function FormInput({ name, control, label, required, ...props }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Input
          {...field}
          {...props}
          label={label}
          required={required}
          error={error?.message}
          id={name}
        />
      )}
    />
  );
}

export function FormSelect({ name, control, label, required, children, ...props }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Select
          {...field}
          {...props}
          label={label}
          required={required}
          error={error?.message}
          id={name}
        >
          {children}
        </Select>
      )}
    />
  );
}

export function FormToggle({ name, control, label, description, ...props }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <Toggle
          {...props}
          label={label}
          description={description}
          checked={value}
          onChange={onChange}
        />
      )}
    />
  );
}

export function FormCheckbox({ name, control, label, ...props }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <Checkbox
          {...props}
          label={label}
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          error={error?.message}
          id={name}
        />
      )}
    />
  );
}
