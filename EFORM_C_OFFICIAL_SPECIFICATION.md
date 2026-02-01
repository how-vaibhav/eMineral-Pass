# Official eForm-C Implementation - Final Specification

## Form Header (Exact Content - Not Editable)

```
Directorate Of Geology & Mining Uttar Pradesh
The Uttar Pradesh Minerals (Prevention of Illegal Mining, Transportation and Storage) Rules, 2018
eForm-c Pass For Transportation of Minor Mineral See Rule-7(III)

eForm-C
Valid for one trip only & See Rule-5(2)
```

## Form Fields - EXACT ORDER & LABELS

### Row 1
- **eForm-C No.** (text, read-only - may be auto-generated)
- **Licensee Id** (text, required)

### Row 2
- **Name of Licensee** (text, required)
- **Mobile Number Of Licensee** (phone, required)

### Row 3
- **Destination District** (text, required)
- **Licensee Details [Address,Village,(Gata/Khand),Area]** (textarea, required)

### Row 4
- **Tehsil Of License** (text, required)
- **District Of License** (text, required)

### Row 5
- **Quantity Transported** (number, required)
- **Name Of Mineral** (text, required)

### Row 6
- **Loading From** (text, required)
- **Destination (Delivery Address)** (text, required)

### Row 7
- **Distance(Approx)** (number, required)
- **Traveling Duration** (text, required)

### Row 8 (AUTO-GENERATED, READ-ONLY)
- **eForm-C Generated On** (text, auto-generated)
  - Format: DD-MM-YYYY HH:MM:SS AM/PM
  - Value: Server timestamp at submission
  - Example: 25-01-2026 14:30:45 PM
- **eForm-C Valid Upto** (text, auto-generated)
  - Format: DD-MM-YYYY HH:MM:SS AM/PM
  - Value: Generated On + 24 hours (exactly)
  - Example: 26-01-2026 14:30:45 PM

### Row 9
- **Selling Price(Rs per tonne)** (number, required)
- **Serial Number** (text, required)

## Vehicle Details Section Header

**"Details Of Registered Vehicle"** (bold, formal section separator)

### Vehicle Row 1
- **Registration Number** (text, required)
- **Name Of Driver** (text, required)

### Vehicle Row 2
- **Gross Vehicle Weight in Tonne** (number, required)
- **Carrying capacity of vehicle in Tonne** (number, required)

### Vehicle Row 3
- **Mobile Number Of Driver** (phone, required)
  - Note: Renders in 1 column (not 2)

## Timestamp Generation Rules

**Location:** Server-side only (never client-side)

**Generated On:**
- Set when form is submitted
- Format: DD-MM-YYYY HH:MM:SS AM/PM
- Example: 25-01-2026 02:30:45 PM

**Valid Upto:**
- Calculated as: Generated On + exactly 24 hours
- Format: DD-MM-YYYY HH:MM:SS AM/PM
- Example: 26-01-2026 02:30:45 PM

**Storage:**
- Both timestamps stored in Supabase
- Both timestamps returned to client in response
- Both timestamps displayed in form as read-only fields
- Used in success state display and PDF generation

## UI Layout Rules

### Desktop (1024px+)
- 2-column grid for main form fields
- 2-column grid for vehicle fields (except driver mobile)
- "Licensee Details" field spans 2 columns
- "Mobile Number Of Driver" spans 1 column (width 50%)
- Formal, table-like appearance
- Government portal style (not modern SaaS)

### Tablet (768px-1023px)
- 2-column grid for main form fields
- 2-column grid for vehicle fields
- Same spanning rules as desktop

### Mobile (< 768px)
- 1-column stack for all fields
- Full-width fields
- Readable, touch-friendly

## Form Validation

**Required Fields Validation:**
- All fields except "eForm-C No." and the auto-generated timestamp fields are required
- Show clear error messages on validation failure
- Validate on form submission

**Numeric Fields:**
- Quantity Transported: min 0.01, max 999,999
- Distance(Approx): min 0.1, max 9,999
- Selling Price: min 0, max 999,999,999
- Gross Vehicle Weight: min 0.01, max 999,999
- Carrying Capacity: min 0.01, max 999,999

**Phone Fields:**
- Licensee Mobile: 10 digits
- Driver Mobile: 10 digits

**Text Fields:**
- Name of Licensee: 2-100 characters
- Licensee Details: 5-250 characters
- Name Of Mineral: 1-100 characters
- Name Of Driver: 2-100 characters

## Success State

After form submission:

1. **Display green success banner** with:
   - Checkmark icon (✓)
   - Title: "eForm-C Generated Successfully"
   - Subtitle: "Your pass for transportation of minor mineral has been created."

2. **Show record information** including:
   - Record ID (monospace)
   - eForm-C No. (monospace)
   - Generated On (with timestamp)
   - Valid Upto (with timestamp)

3. **Display QR Code** (center-aligned, labeled)

4. **Action buttons:**
   - "📄 Download PDF Pass" (primary button)
   - "🔗 View Record" (secondary button)
   - "➕ Create New Entry" (blue button)

5. **Create New Entry** behavior:
   - Clears form data
   - Closes success state
   - Returns to empty form
   - Allows unlimited repeat submissions
   - Each submission gets unique ID, token, timestamps

## Submission Flow

1. User fills form with all required data
2. Clicks "Generate eForm-C Pass" button
3. Client-side validation runs
4. If valid, sends to server
5. Server generates:
   - Unique Record ID
   - Unique Public Token
   - eForm-C Generated On (server timestamp)
   - eForm-C Valid Upto (Generated On + 24 hours)
   - QR Code
   - PDF document
6. Returns success response
7. UI shows success state
8. User can download, view, or create new entry

## Technical Implementation

### Schema Definition File
- **Location:** `src/lib/eform-c-official.ts`
- **Contains:**
  - `EFORM_C_HEADER` - Static header content
  - `EFORM_C_MAIN_FIELDS` - All 9 rows of main form
  - `VEHICLE_SECTION_HEADER` - Section title
  - `EFORM_C_VEHICLE_FIELDS` - Vehicle details fields
  - `EFORM_C_SCHEMA` - Complete schema
  - Helper functions: `getMainFormFields()`, `getVehicleFields()`, `getEditableFields()`, `getFormSections()`

### Form Page
- **Location:** `src/app/(dashboard)/form/page.tsx`
- **Renders:**
  - Official header from EFORM_C_HEADER
  - Main form fields in 2-column grid
  - Vehicle section with separator
  - Vehicle fields in appropriate grid layout
  - Submit button: "Generate eForm-C Pass"
  - Success state with record info and QR code

### Backend (Timestamps)
- **Location:** `src/lib/records.server.ts`
- **Generates:**
  - Server timestamps using official format
  - Generated On = current server time
  - Valid Upto = Generated On + 24 hours
  - Both stored in database and returned to client

### Timestamp Utilities
- **Location:** `src/lib/timestamp-utils.ts`
- **Functions:**
  - `formatTimestamp(date)` → DD-MM-YYYY HH:MM:SS AM/PM
  - `calculateValidityExpiration(generatedOn)` → Valid Upto
  - `isFormStillValid(validUpto)` → boolean
  - `getRemainingValidityTime(validUpto)` → string

## Critical Rules - NON-NEGOTIABLE

✅ **Content:**
- All labels must match EXACTLY
- No rewording, simplification, or "improvement"
- All field names preserved exactly
- Order never changed
- Punctuation and spacing preserved

✅ **Auto-Generated Fields:**
- Always generated on server
- Never use client system time
- Always read-only in UI
- Always display in form
- Format: DD-MM-YYYY HH:MM:SS AM/PM

✅ **Layout:**
- Formal government portal style
- Table-like appearance
- 2-column on desktop, 1-column on mobile
- Clear section separation
- Professional, clean design

✅ **Validation:**
- All required fields enforced
- Type validation for numeric fields
- Phone validation for mobile fields
- Clear error messaging

✅ **Submission:**
- One trip only (valid for 24 hours)
- Unlimited repeat submissions allowed
- Each submission gets unique credentials
- QR code and PDF generated
- Success state shows all key info

---

**Status:** ✅ FINAL - Pixel-accurate, Content-accurate, Legally compliant  
**Version:** 1.0.0 Official  
**Date:** February 1, 2026  
**Authority:** Uttar Pradesh Minerals Rules, 2018
