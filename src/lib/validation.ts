import { z } from 'zod'

// Form field validation schema
export const FormFieldDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'number', 'date', 'select', 'textarea', 'email', 'phone']),
  placeholder: z.string().optional(),
  required: z.boolean(),
  validation: z
    .object({
      minLength: z.number().positive().optional(),
      maxLength: z.number().positive().optional(),
      pattern: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
})

export type FormFieldDefinition = z.infer<typeof FormFieldDefinitionSchema>

// Form submission validation (dynamic based on schema)
export const FormSubmissionSchema = z.record(z.string(), z.any())

export type FormSubmission = z.infer<typeof FormSubmissionSchema>

// Authentication schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginInput = z.infer<typeof LoginSchema>

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })

export type SignupInput = z.infer<typeof SignupSchema>

// Record filters schema
export const RecordFiltersSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  status: z.enum(['active', 'expired', 'archived']).optional(),
  sortBy: z.enum(['created_at', 'valid_upto', 'total_scans']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

export type RecordFilters = z.infer<typeof RecordFiltersSchema>

// API response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

// Form template schema
export const FormTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  fields: z.array(FormFieldDefinitionSchema),
  validityHours: z.number().min(1, 'Validity must be at least 1 hour'),
})

export type FormTemplateInput = Omit<z.infer<typeof FormTemplateSchema>, 'id'>

// Helper function to validate form submission against schema
export function validateFormSubmission(
  data: Record<string, any>,
  fields: FormFieldDefinition[]
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  for (const field of fields) {
    const value = data[field.name]

    // Check required
    if (field.required && (value === null || value === undefined || value === '')) {
      errors[field.name] = `${field.label} is required`
      continue
    }

    if (value === null || value === undefined || value === '') {
      continue
    }

    // Type validation
    switch (field.type) {
      case 'email':
        if (!z.string().email().safeParse(value).success) {
          errors[field.name] = `${field.label} must be a valid email`
        }
        break
      case 'number':
        if (typeof value !== 'number' && !z.string().transform(Number).pipe(z.number()).safeParse(value).success) {
          errors[field.name] = `${field.label} must be a number`
        }
        break
      case 'date':
        if (!z.string().datetime().safeParse(value).success && !z.string().date().safeParse(value).success) {
          errors[field.name] = `${field.label} must be a valid date`
        }
        break
      case 'phone':
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
        if (!phoneRegex.test(String(value))) {
          errors[field.name] = `${field.label} must be a valid phone number`
        }
        break
      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          errors[field.name] = `${field.label} must be text`
        }
        break
    }

    // Custom validation rules
    if (field.validation) {
      const stringValue = String(value)

      if (field.validation.minLength && stringValue.length < field.validation.minLength) {
        errors[field.name] = `${field.label} must be at least ${field.validation.minLength} characters`
      }

      if (field.validation.maxLength && stringValue.length > field.validation.maxLength) {
        errors[field.name] = `${field.label} must be at most ${field.validation.maxLength} characters`
      }

      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern)
        if (!regex.test(stringValue)) {
          errors[field.name] = `${field.label} format is invalid`
        }
      }

      if (field.type === 'number') {
        const numValue = Number(value)
        if (field.validation.min !== undefined && numValue < field.validation.min) {
          errors[field.name] = `${field.label} must be at least ${field.validation.min}`
        }
        if (field.validation.max !== undefined && numValue > field.validation.max) {
          errors[field.name] = `${field.label} must be at most ${field.validation.max}`
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
