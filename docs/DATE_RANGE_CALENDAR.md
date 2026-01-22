# Date Range Calendar Implementation

## Overview

This document explains all the changes made to implement a date range calendar for filtering transactions in the magic link feature.

## What Was Added

### 1. Date Range Calendar Component

**File:** `src/components/magic/DateRangeCalendar.tsx`

A new calendar component that allows users to:

- Select a date range (from date and to date) using a visual calendar
- See the selected date range highlighted
- Use quick action buttons (Last 7 days, Last 30 days, This month)
- Apply the selected dates with an "Apply" button

**Key Features:**

- Calendar popover that opens when clicking the date button
- Month navigation (previous/next month buttons)
- Visual indicators for:
  - Selected start date (blue background, white text)
  - Selected end date (blue background, white text)
  - Dates in between the range (light blue background)
  - Today's date (ring border)
- Temporary date selection (dates are not applied until "Apply" is clicked)
- Apply button that is only enabled when both dates are selected

### 2. Updated Header Component

**File:** `src/components/magic/header.tsx`

**Changes:**

- Replaced the old date input fields (two separate date inputs) with the new `DateRangeCalendar` component
- The calendar component now handles all date selection UI

### 3. Updated API to Accept Date Parameters

**File:** `src/utils/magic/getMagicLinkLedger.ts`

**Changes:**

- Added `from` and `to` date parameters to the `GetMagicLinkLedgerRequest` interface
- Updated the API call to send these dates as query parameters when provided
- Dates are sent in `DD-MM-YYYY` format (e.g., "01-12-2024")

**Before:**

```typescript
interface GetMagicLinkLedgerRequest {
  linkId: string;
  sort?: "asc" | "desc";
  viewMode?: "statement" | "t";
}
```

**After:**

```typescript
interface GetMagicLinkLedgerRequest {
  linkId: string;
  sort?: "asc" | "desc";
  viewMode?: "statement" | "t";
  from?: string; // Date in DD-MM-YYYY format
  to?: string; // Date in DD-MM-YYYY format
}
```

### 4. Updated Magic Page

**File:** `src/app/magic/page.tsx`

**Changes:**

- Updated the API call to include `from` and `to` date parameters
- Added dates to the `useEffect` dependencies so the API is called when dates change
- The API is now called when:
  - Page loads initially
  - View mode changes
  - Date range changes (after clicking Apply)

**How it works:**

1. User selects dates in the calendar
2. User clicks "Apply" button
3. `fromDate` and `toDate` state variables are updated
4. `useEffect` detects the date change and calls the API with the new dates
5. API returns filtered transactions based on the date range
6. Table displays the filtered results

### 5. Component Export

**File:** `src/components/magic/index.ts`

**Changes:**

- Added export for the new `DateRangeCalendar` component so it can be imported by other files

## How It Works

### User Flow

1. **Opening the Calendar:**
   - User clicks the date range button in the header
   - Calendar popover opens showing the current month

2. **Selecting Dates:**
   - User clicks a date to set the "from" date
   - Calendar automatically switches to selecting "to" date
   - User clicks another date to set the "to" date
   - Selected range is highlighted visually

3. **Applying Dates:**
   - User clicks the "Apply" button
   - Dates are sent to the API
   - API returns filtered transactions
   - Table updates with filtered results

4. **Quick Actions:**
   - User can click "Last 7 days", "Last 30 days", or "This month" buttons
   - These automatically set both dates
   - User still needs to click "Apply" to send the request

### Technical Flow

1. **Date Selection (Temporary State):**
   - When calendar opens, it creates temporary date variables (`tempFromDate`, `tempToDate`)
   - User selections update these temporary variables
   - Visual calendar shows these temporary selections

2. **Date Application:**
   - When "Apply" is clicked, temporary dates are applied to actual state
   - `onFromDateChange` and `onToDateChange` callbacks are triggered
   - These update the `fromDate` and `toDate` in the parent component

3. **API Call:**
   - `useEffect` in the magic page detects date changes
   - Formats dates using `formatDateForAPI` function (converts to DD-MM-YYYY)
   - Calls `getMagicLinkData` with date parameters
   - API request includes `from` and `to` as query parameters

4. **Data Filtering:**
   - API filters transactions server-side based on the date range
   - Returns only transactions within the selected date range
   - Client-side also applies additional filtering if needed

## Benefits

1. **Better User Experience:**
   - Visual calendar is easier to use than typing dates
   - Clear indication of selected date range
   - Quick action buttons for common date ranges

2. **Prevents Unnecessary API Calls:**
   - Dates are only applied when "Apply" is clicked
   - No API calls while user is selecting dates
   - Reduces server load and improves performance

3. **Server-Side Filtering:**
   - API filters data on the server
   - Only relevant transactions are sent to the client
   - Faster response times and less data transfer

## Files Modified

1. `src/components/magic/DateRangeCalendar.tsx` - **NEW FILE**
2. `src/components/magic/header.tsx` - **MODIFIED**
3. `src/components/magic/index.ts` - **MODIFIED**
4. `src/utils/magic/getMagicLinkLedger.ts` - **MODIFIED**
5. `src/app/magic/page.tsx` - **MODIFIED**

## Dependencies Used

- `date-fns` - For date manipulation and formatting (already in project)
- `lucide-react` - For calendar icons (already in project)
- React hooks (`useState`, `useEffect`, `useRef`) - For component state management

## Date Format

- **Display Format:** `dd MMM yyyy` (e.g., "01 Dec 2024")
- **API Format:** `DD-MM-YYYY` (e.g., "01-12-2024")
- **Mobile Display:** `dd/MM` (e.g., "01/12")

## Notes

- The calendar closes automatically when clicking outside of it
- The calendar resets to show the "from" date month when opened
- If user selects a "to" date that is before the "from" date, both dates are reset
- The Apply button is disabled until both dates are selected
- Quick action buttons set both dates but still require clicking Apply
