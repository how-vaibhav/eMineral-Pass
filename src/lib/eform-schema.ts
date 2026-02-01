/**
 * Official eForm-C Schema
 * 
 * This file defines the exact structure of the government eForm-C document.
 * All field names, labels, order, and grouping must remain exactly as specified.
 * 
 * Reference: Official eForm-C Document (Mineral Transport Authority)
 */

import { FormFieldDefinition, FormSchema } from '@/types'

/**
 * eForm-C Field Groups for organizational purposes
 * These group fields logically but must appear in exact order in form rendering
 */
export const EFORM_C_SCHEMA: FormSchema = {
  id: 'eform-c-001',
  title: 'eForm-C: Mineral Transport Authority',
  description: 'Official form for mineral transport authorization and tracking',
  fields: [
    // ===== SECTION 1: FORM IDENTIFICATION =====
    {
      id: 'field_eform_c_number',
      name: 'eform_c_number',
      label: 'eForm-C Number',
      type: 'text',
      required: true,
      placeholder: 'e.g., EFORM-C-2024-000001',
      validation: { minLength: 10, maxLength: 30 },
    },

    // ===== SECTION 2: LICENSEE INFORMATION =====
    {
      id: 'field_licensee_id',
      name: 'licensee_id',
      label: 'Licensee ID',
      type: 'text',
      required: true,
      placeholder: 'e.g., LIC-2024-00123',
      validation: { minLength: 5, maxLength: 30 },
    },

    {
      id: 'field_licensee_name',
      name: 'licensee_name',
      label: 'Name of Licensee',
      type: 'text',
      required: true,
      placeholder: 'Full legal name',
      validation: { minLength: 2, maxLength: 100 },
    },

    {
      id: 'field_licensee_mobile',
      name: 'licensee_mobile',
      label: 'Mobile Number of Licensee',
      type: 'phone',
      required: true,
      placeholder: '+91 XXXXX XXXXX',
    },

    // ===== SECTION 3: LICENSEE ADDRESS DETAILS =====
    {
      id: 'field_licensee_village',
      name: 'licensee_village',
      label: 'Village',
      type: 'text',
      required: true,
      placeholder: 'Village name',
      validation: { minLength: 2, maxLength: 50 },
    },

    {
      id: 'field_licensee_district',
      name: 'licensee_district',
      label: 'District',
      type: 'text',
      required: true,
      placeholder: 'District name',
      validation: { minLength: 2, maxLength: 50 },
    },

    {
      id: 'field_licensee_gata_khand',
      name: 'licensee_gata_khand',
      label: 'Gata/Khand Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., Gata-001 or Khand-A',
      validation: { maxLength: 30 },
    },

    {
      id: 'field_licensee_area',
      name: 'licensee_area',
      label: 'Area',
      type: 'text',
      required: false,
      placeholder: 'Area/Zone/Block name',
      validation: { maxLength: 50 },
    },

    // ===== SECTION 4: LICENSE AUTHORITY =====
    {
      id: 'field_tehsil_of_license',
      name: 'tehsil_of_license',
      label: 'Tehsil of License',
      type: 'text',
      required: true,
      placeholder: 'Tehsil/Taluka name',
      validation: { minLength: 2, maxLength: 50 },
    },

    {
      id: 'field_district_of_license',
      name: 'district_of_license',
      label: 'District of License',
      type: 'text',
      required: true,
      placeholder: 'District name',
      validation: { minLength: 2, maxLength: 50 },
    },

    // ===== SECTION 5: MINERAL & QUANTITY DETAILS =====
    {
      id: 'field_mineral_name',
      name: 'mineral_name',
      label: 'Name of Mineral',
      type: 'text',
      required: true,
      placeholder: 'e.g., Iron Ore, Limestone, Granite',
      validation: { minLength: 2, maxLength: 50 },
    },

    {
      id: 'field_quantity_transported',
      name: 'quantity_transported',
      label: 'Quantity Transported',
      type: 'number',
      required: true,
      placeholder: 'e.g., 50',
      validation: { min: 0.1, max: 999999 },
    },

    // ===== SECTION 6: TRANSPORT DETAILS =====
    {
      id: 'field_loading_from',
      name: 'loading_from',
      label: 'Loading From',
      type: 'text',
      required: true,
      placeholder: 'Source/Mine location',
      validation: { minLength: 2, maxLength: 100 },
    },

    {
      id: 'field_destination_address',
      name: 'destination_address',
      label: 'Destination / Delivery Address',
      type: 'text',
      required: true,
      placeholder: 'Final delivery location',
      validation: { minLength: 2, maxLength: 100 },
    },

    {
      id: 'field_destination_district',
      name: 'destination_district',
      label: 'Destination District',
      type: 'text',
      required: true,
      placeholder: 'District of destination',
      validation: { minLength: 2, maxLength: 50 },
    },

    {
      id: 'field_distance_approx',
      name: 'distance_approx',
      label: 'Distance (Approx)',
      type: 'number',
      required: true,
      placeholder: 'Distance in kilometers',
      validation: { min: 0.1, max: 5000 },
    },

    {
      id: 'field_traveling_duration',
      name: 'traveling_duration',
      label: 'Traveling Duration',
      type: 'text',
      required: true,
      placeholder: 'e.g., 4 hours 30 minutes',
      validation: { minLength: 2, maxLength: 50 },
    },

    // ===== SECTION 7: PRICING INFORMATION =====
    {
      id: 'field_selling_price',
      name: 'selling_price',
      label: 'Selling Price',
      type: 'number',
      required: true,
      placeholder: 'Price per unit',
      validation: { min: 0, max: 999999999 },
    },

    // ===== SECTION 8: VEHICLE DETAILS =====
    {
      id: 'field_vehicle_registration',
      name: 'vehicle_registration',
      label: 'Vehicle Registration Number',
      type: 'text',
      required: true,
      placeholder: 'e.g., DL01AB1234',
      validation: { minLength: 5, maxLength: 20 },
    },

    {
      id: 'field_vehicle_type',
      name: 'vehicle_type',
      label: 'Vehicle Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Truck', value: 'truck' },
        { label: 'Lorry', value: 'lorry' },
        { label: 'Tipper', value: 'tipper' },
        { label: 'Dumper', value: 'dumper' },
        { label: 'Container Carrier', value: 'container_carrier' },
        { label: 'Other', value: 'other' },
      ],
    },

    {
      id: 'field_carrying_capacity',
      name: 'carrying_capacity',
      label: 'Carrying Capacity',
      type: 'number',
      required: true,
      placeholder: 'Capacity in metric tons',
      validation: { min: 0.1, max: 99999 },
    },

    {
      id: 'field_vehicle_serial_number',
      name: 'vehicle_serial_number',
      label: 'Vehicle Serial Number',
      type: 'text',
      required: true,
      placeholder: 'Chassis number',
      validation: { minLength: 10, maxLength: 20 },
    },

    // ===== SECTION 9: DRIVER INFORMATION =====
    {
      id: 'field_driver_name',
      name: 'driver_name',
      label: 'Driver Name',
      type: 'text',
      required: true,
      placeholder: 'Full name of driver',
      validation: { minLength: 2, maxLength: 100 },
    },

    {
      id: 'field_driver_mobile',
      name: 'driver_mobile',
      label: 'Driver Mobile Number',
      type: 'phone',
      required: true,
      placeholder: '+91 XXXXX XXXXX',
    },

    // ===== AUTO-GENERATED FIELDS (Read-only, set by server) =====
    {
      id: 'field_generated_on',
      name: 'generated_on',
      label: 'Generated On',
      type: 'text', // Display only, no input
      required: false,
      placeholder: 'DD-MM-YYYY HH:MM:SS AM/PM',
    },

    {
      id: 'field_valid_upto',
      name: 'valid_upto',
      label: 'Valid Upto',
      type: 'text', // Display only, no input
      required: false,
      placeholder: 'DD-MM-YYYY HH:MM:SS AM/PM',
    },
  ],
  validityHours: 24, // 24 hours validity
}

/**
 * Helper function to get input fields (exclude auto-generated read-only fields)
 */
export function getEditableFormFields(): FormFieldDefinition[] {
  return EFORM_C_SCHEMA.fields.filter(
    (field) => field.name !== 'generated_on' && field.name !== 'valid_upto'
  )
}

/**
 * Helper function to group fields by section for UI rendering
 */
export interface FormSection {
  title: string
  fields: FormFieldDefinition[]
}

export function getFormSections(): FormSection[] {
  const sections: FormSection[] = [
    {
      title: 'Form Identification',
      fields: EFORM_C_SCHEMA.fields.filter((f) => ['eform_c_number'].includes(f.name)),
    },
    {
      title: 'Licensee Information',
      fields: EFORM_C_SCHEMA.fields.filter((f) =>
        ['licensee_id', 'licensee_name', 'licensee_mobile'].includes(f.name)
      ),
    },
    {
      title: 'Licensee Address Details',
      fields: EFORM_C_SCHEMA.fields.filter((f) =>
        ['licensee_village', 'licensee_district', 'licensee_gata_khand', 'licensee_area'].includes(
          f.name
        )
      ),
    },
    {
      title: 'License Authority',
      fields: EFORM_C_SCHEMA.fields.filter((f) =>
        ['tehsil_of_license', 'district_of_license'].includes(f.name)
      ),
    },
    {
      title: 'Mineral & Quantity Details',
      fields: EFORM_C_SCHEMA.fields.filter((f) =>
        ['mineral_name', 'quantity_transported'].includes(f.name)
      ),
    },
    {
      title: 'Transport Details',
      fields: EFORM_C_SCHEMA.fields.filter((f) =>
        [
          'loading_from',
          'destination_address',
          'destination_district',
          'distance_approx',
          'traveling_duration',
        ].includes(f.name)
      ),
    },
    {
      title: 'Pricing Information',
      fields: EFORM_C_SCHEMA.fields.filter((f) => ['selling_price'].includes(f.name)),
    },
    {
      title: 'Vehicle Details',
      fields: EFORM_C_SCHEMA.fields.filter((f) =>
        [
          'vehicle_registration',
          'vehicle_type',
          'carrying_capacity',
          'vehicle_serial_number',
        ].includes(f.name)
      ),
    },
    {
      title: 'Driver Information',
      fields: EFORM_C_SCHEMA.fields.filter((f) =>
        ['driver_name', 'driver_mobile'].includes(f.name)
      ),
    },
    {
      title: 'Form Status',
      fields: EFORM_C_SCHEMA.fields.filter((f) =>
        ['generated_on', 'valid_upto'].includes(f.name)
      ),
    },
  ]

  return sections.filter((section) => section.fields.length > 0)
}

/**
 * Export for type safety
 */
export type EFormCSchema = typeof EFORM_C_SCHEMA
