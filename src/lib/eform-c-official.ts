/**
 * OFFICIAL eForm-C SCHEMA
 *
 * Uttar Pradesh Minerals (Prevention of Illegal Mining, Transportation and Storage) Rules, 2018
 * Rule-7(III): eForm-c Pass For Transportation of Minor Mineral
 *
 * ⚠️ CRITICAL: This is a legally sensitive government form.
 * ALL content, labels, order, and structure MUST remain exact.
 * NO modifications to labels, field names, or ordering allowed.
 */

import { FormFieldDefinition, FormSchema } from "@/types";

/**
 * Form Header - Static, rendered exactly as shown
 */
export const EFORM_C_HEADER = {
  line1: "Directorate Of Geology & Mining Uttar Pradesh",
  line2:
    "The Uttar Pradesh Minerals (Prevention of Illegal Mining, Transportation and Storage) Rules, 2018",
  line3: "eForm-c Pass For Transportation of Minor Mineral See Rule-7(III)",
  divider: "",
  title: "eForm-C",
  subtitle: "Valid for one trip only & See Rule-5(2)",
};

/**
 * Main Form Fields - EXACT ORDER AND LABELS
 *
 * Row 1: eForm-C No. | Licensee Id
 * Row 2: Name of Licensee | Mobile Number Of Licensee
 * Row 3: Destination District | Licensee Details [Address,Village,(Gata/Khand),Area]
 * Row 4: Tehsil Of License | District Of License
 * Row 5: Quantity Transported | Name Of Mineral
 * Row 6: Loading From | Destination (Delivery Address)
 * Row 7: Distance(Approx) | Traveling Duration
 * Row 8: eForm-C Generated On | eForm-C Valid Upto [AUTO-GENERATED]
 * Row 9: Selling Price(Rs per tonne) | Serial Number
 */
export const EFORM_C_MAIN_FIELDS: FormFieldDefinition[] = [
  // Row 1
  {
    id: "field_eform_c_no",
    name: "eform_c_no",
    label: "eForm-C No.",
    type: "text",
    required: true,
    placeholder: "Enter eForm-C number",
    validation: { minLength: 1, maxLength: 50 },
    readOnly: false,
  },
  {
    id: "field_licensee_id",
    name: "licensee_id",
    label: "Licensee Id",
    type: "text",
    required: true,
    placeholder: "Enter Licensee ID",
    validation: { minLength: 1, maxLength: 50 },
  },

  // Row 2
  {
    id: "field_name_of_licensee",
    name: "name_of_licensee",
    label: "Name of Licensee",
    type: "text",
    required: true,
    placeholder: "Full name",
    validation: { minLength: 2, maxLength: 100 },
  },
  {
    id: "field_mobile_number_of_licensee",
    name: "mobile_number_of_licensee",
    label: "Mobile Number Of Licensee",
    type: "phone",
    required: true,
    placeholder: "Mobile number",
    validation: { minLength: 10, maxLength: 10 },
  },

  // Row 3
  {
    id: "field_destination_district",
    name: "destination_district",
    label: "Destination District",
    type: "text",
    required: true,
    placeholder: "District name",
    validation: { minLength: 1, maxLength: 50 },
  },
  {
    id: "field_licensee_details_address",
    name: "licensee_details_address",
    label: "Licensee Details [Address,Village,(Gata/Khand),Area]",
    type: "textarea",
    required: true,
    placeholder: "Address, Village, Gata/Khand Number, Area",
    validation: { minLength: 5, maxLength: 250 },
  },

  // Row 4
  {
    id: "field_tehsil_of_license",
    name: "tehsil_of_license",
    label: "Tehsil Of License",
    type: "text",
    required: true,
    placeholder: "Tehsil name",
    validation: { minLength: 1, maxLength: 50 },
  },
  {
    id: "field_district_of_license",
    name: "district_of_license",
    label: "District Of License",
    type: "text",
    required: true,
    placeholder: "District name",
    validation: { minLength: 1, maxLength: 50 },
  },

  // Row 5
  {
    id: "field_quantity_transported",
    name: "quantity_transported",
    label: "Quantity Transported",
    type: "number",
    required: true,
    placeholder: "0.00",
    validation: { min: 0.01, max: 999999 },
  },
  {
    id: "field_name_of_mineral",
    name: "name_of_mineral",
    label: "Name Of Mineral",
    type: "text",
    required: true,
    placeholder: "Mineral name",
    validation: { minLength: 1, maxLength: 100 },
  },

  // Row 6
  {
    id: "field_loading_from",
    name: "loading_from",
    label: "Loading From",
    type: "text",
    required: true,
    placeholder: "Loading location",
    validation: { minLength: 1, maxLength: 100 },
  },
  {
    id: "field_destination_delivery_address",
    name: "destination_delivery_address",
    label: "Destination (Delivery Address)",
    type: "text",
    required: true,
    placeholder: "Delivery address",
    validation: { minLength: 1, maxLength: 100 },
  },

  // Row 7
  {
    id: "field_distance_approx",
    name: "distance_approx",
    label: "Distance(Approx)",
    type: "number",
    required: true,
    placeholder: "0.00 km",
    validation: { min: 0.1, max: 9999 },
  },
  {
    id: "field_traveling_duration",
    name: "traveling_duration",
    label: "Traveling Duration",
    type: "text",
    required: true,
    placeholder: "e.g., 4 hours 30 minutes",
    validation: { minLength: 1, maxLength: 50 },
  },

  // Row 8 - AUTO-GENERATED (READ-ONLY)
  {
    id: "field_eform_c_generated_on",
    name: "eform_c_generated_on",
    label: "eForm-C Generated On",
    type: "text",
    required: false,
    readOnly: true,
    placeholder: "Auto-generated",
  },
  {
    id: "field_eform_c_valid_upto",
    name: "eform_c_valid_upto",
    label: "eForm-C Valid Upto",
    type: "text",
    required: false,
    readOnly: true,
    placeholder: "Auto-generated",
  },

  // Row 9
  {
    id: "field_selling_price",
    name: "selling_price",
    label: "Selling Price(Rs per tonne)",
    type: "number",
    required: true,
    placeholder: "0.00",
    validation: { min: 0, max: 999999999 },
  },
  {
    id: "field_serial_number",
    name: "serial_number",
    label: "Serial Number",
    type: "text",
    required: true,
    placeholder: "Serial number",
    validation: { minLength: 1, maxLength: 50 },
  },
];

/**
 * Vehicle Details Section Header
 */
export const VEHICLE_SECTION_HEADER = "Details Of Registered Vehicle";

/**
 * Vehicle Details Fields - EXACT ORDER AND LABELS
 *
 * Row 1: Registration Number | Name Of Driver
 * Row 2: Gross Vehicle Weight in Tonne | Carrying capacity of vehicle in Tonne
 * Row 3: Mobile Number Of Driver
 */
export const EFORM_C_VEHICLE_FIELDS: FormFieldDefinition[] = [
  // Row 1
  {
    id: "field_registration_number",
    name: "registration_number",
    label: "Registration Number",
    type: "text",
    required: true,
    placeholder: "Vehicle registration number",
    validation: { minLength: 1, maxLength: 50 },
  },
  {
    id: "field_name_of_driver",
    name: "name_of_driver",
    label: "Name Of Driver",
    type: "text",
    required: true,
    placeholder: "Driver name",
    validation: { minLength: 2, maxLength: 100 },
  },

  // Row 2
  {
    id: "field_gross_vehicle_weight",
    name: "gross_vehicle_weight",
    label: "Gross Vehicle Weight in Tonne",
    type: "number",
    required: true,
    placeholder: "0.00",
    validation: { min: 0.01, max: 999999 },
  },
  {
    id: "field_carrying_capacity",
    name: "carrying_capacity",
    label: "Carrying capacity of vehicle in Tonne",
    type: "number",
    required: true,
    placeholder: "0.00",
    validation: { min: 0.01, max: 999999 },
  },

  // Row 3
  {
    id: "field_mobile_number_of_driver",
    name: "mobile_number_of_driver",
    label: "Mobile Number Of Driver",
    type: "phone",
    required: true,
    placeholder: "Mobile number",
    validation: { minLength: 10, maxLength: 10 },
  },
];

/**
 * Complete eForm-C Schema
 */
export const EFORM_C_SCHEMA: FormSchema = {
  id: "eform-c-official",
  title: "eForm-C Pass For Transportation of Minor Mineral",
  description: "Uttar Pradesh Minerals Rules, 2018 - Rule 7(III)",
  fields: [...EFORM_C_MAIN_FIELDS, ...EFORM_C_VEHICLE_FIELDS],
  validityHours: 24,
};

/**
 * Get main form fields (excluding vehicle details)
 */
export function getMainFormFields(): FormFieldDefinition[] {
  return EFORM_C_MAIN_FIELDS;
}

/**
 * Get vehicle details fields
 */
export function getVehicleFields(): FormFieldDefinition[] {
  return EFORM_C_VEHICLE_FIELDS;
}

/**
 * Get all editable fields (exclude read-only auto-generated)
 */
export function getEditableFields(): FormFieldDefinition[] {
  return EFORM_C_SCHEMA.fields.filter((field) => !field.readOnly);
}

/**
 * Organized form sections for UI rendering
 */
export interface FormSection {
  title?: string; // Optional - main form has no title
  fields: FormFieldDefinition[];
}

export function getFormSections(): FormSection[] {
  return [
    {
      fields: EFORM_C_MAIN_FIELDS,
    },
    {
      title: VEHICLE_SECTION_HEADER,
      fields: EFORM_C_VEHICLE_FIELDS,
    },
  ];
}

export type EFormCSchema = typeof EFORM_C_SCHEMA;
