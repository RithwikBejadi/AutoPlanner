import { z } from 'zod';

export const teacherSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters, spaces, and basic punctuation'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
});

export const roomSchema = z.object({
  name: z
    .string()
    .min(1, 'Room name is required')
    .min(2, 'Room name must be at least 2 characters')
    .max(50, 'Room name must be less than 50 characters'),
  
  capacity: z
    .number({
      required_error: 'Capacity is required',
      invalid_type_error: 'Capacity must be a number',
    })
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(500, 'Capacity must be less than 500'),
  
  hasLabEquipment: z.boolean().default(false),
});

export const subjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Subject name is required')
    .min(2, 'Subject name must be at least 2 characters')
    .max(100, 'Subject name must be less than 100 characters'),
  
  code: z
    .string()
    .min(1, 'Subject code is required')
    .min(2, 'Subject code must be at least 2 characters')
    .max(20, 'Subject code must be less than 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Subject code must be uppercase letters, numbers, or hyphens')
    .toUpperCase(),
  
  hoursPerWeek: z
    .number({
      required_error: 'Hours per week is required',
      invalid_type_error: 'Hours per week must be a number',
    })
    .int('Hours per week must be a whole number')
    .min(1, 'Hours per week must be at least 1')
    .max(40, 'Hours per week must be less than 40'),
  
  requiresLab: z.boolean().default(false),
  
  maxSessionsPerDay: z
    .number({
      required_error: 'Max sessions per day is required',
      invalid_type_error: 'Max sessions per day must be a number',
    })
    .int('Max sessions per day must be a whole number')
    .min(1, 'Max sessions per day must be at least 1')
    .max(10, 'Max sessions per day must be less than 10')
    .default(2),
});

export const classGroupSchema = z.object({
  name: z
    .string()
    .min(1, 'Class name is required')
    .min(2, 'Class name must be at least 2 characters')
    .max(50, 'Class name must be less than 50 characters'),
  
  studentCount: z
    .number({
      required_error: 'Student count is required',
      invalid_type_error: 'Student count must be a number',
    })
    .int('Student count must be a whole number')
    .min(1, 'Student count must be at least 1')
    .max(200, 'Student count must be less than 200'),
});

export const timeSlotSchema = z.object({
  day: z
    .string()
    .min(1, 'Day is required')
    .refine(
      (val) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(val),
      'Please select a valid day'
    ),
  
  startTime: z
    .string()
    .min(1, 'Start time is required')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'),
  
  endTime: z
    .string()
    .min(1, 'End time is required')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'),
}).refine(
  (data) => {
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);
