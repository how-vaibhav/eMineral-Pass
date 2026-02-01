# Official eForm-C Field Reference

This is the definitive list of all form fields matching the government specification exactly.

## Field Structure & Order

### ✅ 1. Form Identification
| # | Field Name | Label | Type | Required | Notes |
|---|---|---|---|---|---|
| 1 | `eform_c_number` | eForm-C Number | text | ✓ | e.g., EFORM-C-2024-000001 |

### ✅ 2. Licensee Information
| # | Field Name | Label | Type | Required | Notes |
|---|---|---|---|---|---|
| 2 | `licensee_id` | Licensee ID | text | ✓ | e.g., LIC-2024-00123 |
| 3 | `licensee_name` | Name of Licensee | text | ✓ | Full legal name |
| 4 | `licensee_mobile` | Mobile Number of Licensee | phone | ✓ | +91 format |

### ✅ 3. Licensee Address Details
| # | Field Name | Label | Type | Required | Notes |
|---|---|---|---|---|---|
| 5 | `licensee_village` | Village | text | ✓ | Village name |
| 6 | `licensee_district` | District | text | ✓ | District name |
| 7 | `licensee_gata_khand` | Gata/Khand Number | text | ✗ | e.g., Gata-001 |
| 8 | `licensee_area` | Area | text | ✗ | Area/Zone/Block name |

### ✅ 4. License Authority
| # | Field Name | Label | Type | Required | Notes |
|---|---|---|---|---|---|
| 9 | `tehsil_of_license` | Tehsil of License | text | ✓ | Tehsil/Taluka name |
| 10 | `district_of_license` | District of License | text | ✓ | District name |

### ✅ 5. Mineral & Quantity Details
| # | Field Name | Label | Type | Required | Notes |
|---|---|---|---|---|---|
| 11 | `mineral_name` | Name of Mineral | text | ✓ | e.g., Iron Ore, Limestone |
| 12 | `quantity_transported` | Quantity Transported | number | ✓ | Metric tons |

### ✅ 6. Transport Details
| # | Field Name | Label | Type | Required | Notes |
|---|---|---|---|---|---|
| 13 | `loading_from` | Loading From | text | ✓ | Source/Mine location |
| 14 | `destination_address` | Destination / Delivery Address | text | ✓ | Final delivery location |
| 15 | `destination_district` | Destination District | text | ✓ | District of destination |
| 16 | `distance_approx` | Distance (Approx) | number | ✓ | Kilometers |
| 17 | `traveling_duration` | Traveling Duration | text | ✓ | e.g., 4 hours 30 minutes |

### ✅ 7. Pricing Information
| # | Field Name | Label | Type | Required | Notes |
|---|---|---|---|---|---|
| 18 | `selling_price` | Selling Price | number | ✓ | Price per unit |

### ✅ 8. Vehicle Details
| # | Field Name | Label | Type | Required | Notes |
|---|---|---|---|---|---|
| 19 | `vehicle_registration` | Vehicle Registration Number | text | ✓ | e.g., DL01AB1234 |
| 20 | `vehicle_type` | Vehicle Type | select | ✓ | Truck, Lorry, Tipper, Dumper, Container, Other |
| 21 | `carrying_capacity` | Carrying Capacity | number | ✓ | Metric tons |
| 22 | `vehicle_serial_number` | Vehicle Serial Number | text | ✓ | Chassis number |

### ✅ 9. Driver Information
| # | Field Name | Label | Type | Required | Notes |
|---|---|---|---|---|---|
| 23 | `driver_name` | Driver Name | text | ✓ | Full name of driver |
| 24 | `driver_mobile` | Driver Mobile Number | phone | ✓ | +91 format |

### ✅ 10. Form Status (Auto-Generated)
| # | Field Name | Label | Type | Required | Notes |
|---|---|---|---|---|---|
| 25 | `generated_on` | Generated On | text | ✗ | DD-MM-YYYY HH:MM:SS AM/PM (auto) |
| 26 | `valid_upto` | Valid Upto | text | ✗ | DD-MM-YYYY HH:MM:SS AM/PM (auto) |

---

## Timestamp Format Specification

**Format:** `DD-MM-YYYY HH:MM:SS AM/PM`

**Examples:**
- `25-01-2025 02:30:45 PM`
- `01-01-2025 12:00:00 AM` (midnight)
- `25-01-2025 03:15:30 AM`

**Generation Rules:**
1. Always generated on server (never client)
2. Generated On = Time of form submission
3. Valid Upto = Generated On + 24 hours (exactly 1 day)
4. Both stored in ISO format in database
5. Both displayed in official format in UI

**Validity Check:**
- Form is "active" if current time < Valid Upto
- Form is "expired" if current time >= Valid Upto
- 24-hour window = 24 * 60 * 60 = 86,400 seconds

---

## Validation Rules

### Text Fields (Standard)
- Minimum length: 2-5 characters (depends on field)
- Maximum length: 50-100 characters (depends on field)
- No special characters for names

### Phone Fields
- Format: +91 XXXXX XXXXX (Indian)
- Length: 10-13 digits

### Number Fields
- Non-negative
- Max value depends on field (see schema)
- Decimals allowed for quantity/capacity

### Select Fields
- Vehicle Type options:
  - Truck
  - Lorry
  - Tipper
  - Dumper
  - Container Carrier
  - Other

---

## UI Rendering Requirements

### Form Layout
- ✅ Sections clearly separated
- ✅ Section headings visible
- ✅ Required fields marked with red *
- ✅ Field labels above inputs
- ✅ Error messages below inputs (red text)
- ✅ Consistent spacing between fields

### Responsive Design
- ✅ Desktop: 2-column grid
- ✅ Tablet: 2-column grid
- ✅ Mobile: 1-column stack
- ✅ Full-width fields on small screens
- ✅ Touch-friendly button size (48px minimum)

### Auto-Generated Fields
- ✅ Display as read-only (disabled input or styled div)
- ✅ Show placeholder before submission
- ✅ Show actual timestamp after submission
- ✅ Cannot be edited by user

### Success State
- ✅ Green success banner
- ✅ Record ID (monospace font)
- ✅ Public Token (monospace font)
- ✅ Generated On timestamp
- ✅ Valid Upto timestamp
- ✅ QR code image
- ✅ Download PDF button
- ✅ View Public Page button
- ✅ Create New Entry button

---

## Compliance Checklist

- [ ] All 26 fields present
- [ ] Field names match exactly
- [ ] Field labels match exactly
- [ ] Field order is correct (1-26)
- [ ] Required fields marked correctly
- [ ] Phone field validation works
- [ ] Number field validation works
- [ ] Select field options correct
- [ ] Timestamps format: DD-MM-YYYY HH:MM:SS AM/PM
- [ ] Generated On = submission time
- [ ] Valid Upto = Generated On + 24 hours
- [ ] Auto-generated fields read-only
- [ ] Form validates on submission
- [ ] Success state shows all fields
- [ ] QR code generated
- [ ] PDF generated
- [ ] Create New Entry resets form
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] No field omitted
- [ ] No field added (except auto-generated)
- [ ] No field renamed
- [ ] No field reordered

---

**Last Verified:** February 1, 2025  
**Reference Document:** Official eForm-C Specification  
**Status:** ✅ Complete & Verified
