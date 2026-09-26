# CampusConnect — Definitive UI Specification Document

---

## 1. UI Source of Truth & Overview

This document specifies the exact visual design system, layouts, components, typography, color palette, and screen specifications for **CampusConnect**.

The **visual source of truth** for CampusConnect is the 10-screen reference UI design image provided for the project. Every page, component, and interaction implemented in CampusConnect must conform strictly to the specifications detailed in this document.

> **CRITICAL RULE**: Developers and AI agents must NOT redesign, retheme, update to a dark mode dashboard, replace with a generic SaaS template, or invent alternative component layouts. All UI implementation work must reproduce this exact design system.

---

## 2. Global Layout Architecture

The application layout is divided into two distinct global container contexts:

### 2.1 Unauthenticated Layout Context (Auth Shell)
- **Used by**: `/login`, `/register`, `/forgot-password`, `/reset-password`.
- **Structure**: 50/50 split-screen container on desktop (`min-h-screen flex w-full bg-[#f8fafc]`).
  - **Left Column (Desktop `lg:flex lg:w-1/2`)**: Soft blue tint background (`#f0f6ff` / `bg-[#f0f6ff]`), `border-r border-blue-50`. Features top brand logo & title, tagline `"Connect. Report. Recover. Resolve."`, centered campus building vector graphic card, and bottom text `"A smarter campus, together."`.
  - **Right Column (`w-full lg:w-1/2`)**: Clean white background (`bg-white` or `#f8fafc` container padding), centered card container (`max-w-md w-full`), containing header title, role tab selector, form inputs, blue primary action button, and footer link.

### 2.2 Authenticated Layout Context (App Shell)
- **Used by**: `/dashboard`, `/issues`, `/lost-found`, `/notifications`, `/profile`, `/admin/*`, `/search`.
- **Structure**:
  - **Overall Container**: Full viewport height (`min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row`).
  - **Desktop Left Sidebar**: Fixed 256px width (`w-64 bg-white border-r border-slate-200/80 hidden md:flex flex-col h-screen sticky top-0 z-30`).
  - **Desktop Top Header**: Sticky top header (`h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20`).
  - **Main Content Workspace**: Scrollable main area (`flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8`).
  - **Mobile Bottom Navigation**: Fixed bottom bar (`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 shadow-lg z-30 px-3 py-2 flex items-center justify-around`).

---

## 3. Definitive Design System Token Reference

### 3.1 Color Palette

| Token Category | Color Name | Hex Code | Tailwind Equivalent | Usage / Application |
|:---|:---|:---|:---|:---|
| **Page Background** | Off-White Slate | `#F8FAFC` | `bg-slate-50` / `bg-[#f8fafc]` | Overall page workspace background |
| **Auth Left Panel** | Light Blue Tint | `#F0F6FF` | `bg-[#f0f6ff]` | Left panel on Login & Register screens |
| **Surface / Card** | Pure White | `#FFFFFF` | `bg-white` | All card containers, forms, headers, sidebar |
| **Primary Accent** | Royal Blue | `#2563EB` | `bg-[#2563eb]` / `text-[#2563eb]` | Primary buttons, active tabs, active sidebar items |
| **Primary Hover** | Deep Royal Blue | `#1D4ED8` | `hover:bg-[#1d4ed8]` | Primary button hover state |
| **Teal Accent** | Cyan Teal | `#06B6D4` / `#0284C7` | `bg-teal-500` / `bg-cyan-500` | Lost & Found quick action card icon background |
| **Borders** | Subtle Slate | `#E2E8F0` / `#E2E8F0/80` | `border-slate-200` | Card borders, sidebar border, input borders |
| **Text Primary** | Dark Slate | `#0F172A` | `text-slate-900` | Page headings, card titles, primary body text |
| **Text Muted** | Slate Gray | `#64748B` | `text-slate-500` | Subtitles, labels, metadata, timestamps |
| **Status: Open** | Soft Red / Coral | `#FEF2F2` / `#EF4444` | `bg-red-50 text-red-600 border-red-200` | `Open` status pill badge |
| **Status: In Progress** | Soft Blue | `#EFF6FF` / `#2563EB` | `bg-blue-50 text-blue-600 border-blue-200` | `In Progress` status pill badge |
| **Status: Assigned** | Soft Orange | `#FFEDD5` / `#EA580C` | `bg-orange-50 text-orange-600 border-orange-200` | `Assigned` status pill badge |
| **Status: Resolved** | Soft Emerald | `#ECFDF5` / `#059669` | `bg-emerald-50 text-emerald-600 border-emerald-200` | `Resolved` status pill badge |
| **Status: Searching** | Soft Purple | `#F3E8FF` / `#9333EA` | `bg-purple-50 text-purple-600 border-purple-200` | `Searching` status pill badge for Lost items |
| **Status: Possible Match**| Soft Green | `#F0FDF4` / `#16A34A` | `bg-green-50 text-green-600 border-green-200` | `Possible Match` status pill badge |
| **Priority: High** | Red Pill | `#FEF2F2` / `#DC2626` | `bg-red-50 text-red-600 border-red-200` | `High` priority pill |
| **Priority: Medium** | Orange Pill | `#FFEDD5` / `#D97706` | `bg-amber-50 text-amber-600 border-amber-200` | `Medium` priority pill |
| **Priority: Low** | Green Pill | `#ECFDF5` / `#059669` | `bg-emerald-50 text-emerald-600 border-emerald-200` | `Low` priority pill |

### 3.2 Typography & Font Hierarchy

- **Font Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (`font-sans`).
- **Scale**:
  - **Page Title**: `text-2xl` to `text-3xl` (`24px`–`30px`), `font-extrabold` (`800`), `tracking-tight`, `text-slate-900`.
  - **Section Heading**: `text-lg` to `text-xl` (`18px`–`20px`), `font-bold` (`700`), `text-slate-900`.
  - **Card Title**: `text-base` (`16px`), `font-bold` (`700`), `text-slate-900`.
  - **Item Title**: `text-sm` (`14px`), `font-bold` (`700`), `text-slate-900`.
  - **Subtitles & Descriptions**: `text-sm` (`14px`) or `text-xs` (`12px`), `font-medium` (`500`), `text-slate-500`.
  - **Form Labels**: `text-xs` (`12px`), `font-bold` (`700`), `uppercase`, `tracking-wider`, `text-slate-700`.
  - **Badges & Status Pills**: `text-xs` (`12px`) or `text-[11px]`, `font-bold` (`700`).

### 3.3 Elevation, Shadows & Borders

- **Card Borders**: `border border-slate-200/80` (thin subtle gray border).
- **Card Corners**: `rounded-2xl` (`16px`) for primary cards and sections; `rounded-xl` (`12px`) for nested items and inputs.
- **Card Shadows**: `shadow-sm` (`0 1px 2px 0 rgb(0 0 0 / 0.05)`).
- **Button Radius**: `rounded-xl` (`12px`) for all action buttons.

---

## 4. Navigation & Layout System

### 4.1 Desktop Sidebar Specification (`w-64 bg-white border-r border-slate-200/80`)
- **Brand Header**: Top padding `p-6`, flex row with 36px x 36px `#2563eb` rounded-xl icon containing building/school glyph + `"CampusConnect"` in `font-extrabold text-[#0f172a] text-base`.
- **Navigation Links**: Vertical stack (`space-y-1.5 px-4 py-4`).
  - **Active State**: `bg-blue-50 text-[#2563eb] font-semibold rounded-xl px-3.5 py-2.5 flex items-center gap-3.5 text-sm`. Icon is colored `#2563eb`.
  - **Inactive State**: `text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium rounded-xl px-3.5 py-2.5 flex items-center gap-3.5 text-sm`. Icon is colored `text-slate-400`.
- **Role-Based Nav Items**:
  - **Student**: Dashboard, Report Issue, Lost & Found, My Issues, Notifications (with red dot), Profile.
  - **Staff**: Dashboard, Assigned Issues, Lost & Found, Claims, Notifications (with red dot), Profile.
  - **Admin**: Overview, Issues, Lost & Found, Users, Staff, Departments, Analytics, AI Insights, Audit Logs, Settings.

### 4.2 Top Header Specification (`h-16 bg-white border-b border-slate-200/80`)
- **Search Bar (Desktop)**: Left/Center aligned input container (`max-w-md w-full`). Background `#f8fafc`, `border border-slate-200`, `rounded-xl`, `py-2 pl-9 pr-4 text-xs text-slate-900`, search icon `text-slate-400` left-aligned inside input.
- **User Profile Area**: Right aligned flex container.
  - 32px x 32px circular avatar badge (`bg-blue-100 text-[#2563eb] font-bold text-xs flex items-center justify-center border border-blue-200`). Displays user initials (e.g., `"VS"`).
  - User name (`font-bold text-slate-900 text-xs`) and role (`text-[10px] text-slate-500`).
  - Sign out icon button (`text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl`).

### 4.3 Mobile Navigation Specification (`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 shadow-lg`)
- **Items (4 items)**: Home, Issues, Lost & Found, Profile.
- **Item Style**: Vertical flex column (`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-3 rounded-xl`).
- **Active Item**: `text-[#2563eb] font-semibold`.

---

## 5. Detailed Page Specifications

### 5.1 Login Screen (`/login`)
- **Left Panel**: `#f0f6ff` background. Top brand logo + title `"CampusConnect"`, tagline `"Connect. Report. Recover. Resolve."`. Center card with campus building graphic. Footer `"A smarter campus, together."`.
- **Right Panel**:
  - Title: `"Welcome Back"`, Subtitle: `"Login to your account"`.
  - Segmented Role Tab: `[Student, Staff, Admin]` inside `#f1f5f9` container. Active tab is white with `#2563eb` text and shadow.
  - Form Fields:
    - `Email or Student ID` (input with user icon).
    - `Password` (input with lock icon).
    - Right-aligned link `"Forgot password?"` in `#2563eb`.
    - Submit Button: Full width `#2563eb` button (`py-3 text-sm font-semibold rounded-xl text-white shadow-md hover:bg-[#1d4ed8]`).
  - Footer: `"Don't have an account? Sign up"`.

### 5.2 Registration Screen (`/register`)
- **Layout**: Identical split-screen structure as Login.
- **Right Panel**:
  - Title: `"Create Your Account"`, Subtitle: `"Join CampusConnect today"`.
  - Segmented Role Tab: `[Student, Staff, Admin]`.
  - Form Fields: `Full Name`, `Email or Student ID`, `Password`, `Confirm Password`.
  - Submit Button: Full width `#2563eb` button (`py-3 text-sm font-semibold rounded-xl text-white shadow-md hover:bg-[#1d4ed8]`).
  - Footer: `"Already have an account? Login"`.

### 5.3 Student Dashboard Screen (`/dashboard` - Student Role)
- **Header**: `"Good Morning, [Name]"`, Subtitle: `"Welcome back to CampusConnect"`. Top right avatar initials badge (`VS`).
- **Quick Action Cards Grid (2-Column Grid)**:
  - **Card 1 (Report Issue)**: White card (`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-5`). Icon: 56px x 56px `#2563eb` blue circular/rounded square with white wrench/tools icon. Title: `"Report Issue"`, Subtitle: `"Fix campus problems"`.
  - **Card 2 (Lost & Found)**: White card (`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-5`). Icon: 56px x 56px `#06b6d4` teal/cyan circular/rounded square with white magnifying glass icon. Title: `"Lost & Found"`, Subtitle: `"Find or report lost items"`.
- **Section 1: "My Issues"**: Header with right-aligned `"View all"` link. List of issue cards (`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3`):
  - Left icon in soft square container (Snowflake for AC, Chair for broken furniture, Wifi for network, Droplet for plumbing).
  - Title & location subtitle (`Block C - Room 204`).
  - Status badge pill (`In Progress` blue pill, `Assigned` orange pill, `Open` red/amber pill, `Resolved` green pill).
  - Date (`Apr 24, 2025`) and right chevron `>`.
- **Section 2: "Recent Updates"**:
  - Feed list item: Green check icon in circular badge, title `"Your issue #1023 has been resolved"`, timestamp `"2 hours ago"`.

### 5.4 Report Issue Screen (`/issues/new`)
- **Header**: `"Report Issue"`, Subtitle: `"Tell us what's wrong and we'll take care of it."`.
- **Card Form (`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5`)**:
  - `Issue Category` (Select dropdown: `"Select category"`).
  - `Building / Block` & `Room / Location` grid inputs.
  - `Issue Title` (optional text input: `"e.g. AC not cooling"`).
  - `Description` (Textarea: `"Describe the issue..."`).
  - `Upload Photo (optional)` (Dashed dropzone box with cloud upload icon, `"Click to upload or drag and drop"`, `"PNG, JPG (max 5MB)"`).
  - Submit Button: Full width `#2563eb` button (`py-3.5 font-bold text-sm rounded-xl text-white shadow-md hover:bg-[#1d4ed8]`).

### 5.5 My Issues Screen (`/issues`)
- **Header**: `"My Issues"`, Subtitle: `"Track and monitor all your submitted campus issues."`. Right action button `"Report Issue"`.
- **Main Card Container (`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6`)**:
  - **Tabs Bar**: `All` (active with blue bottom border) | `Open` | `In Progress` | `Resolved` | `Closed`.
  - **Search Bar**: Input with left search icon (`bg-slate-50 border border-slate-200 rounded-xl`).
  - **List Items**: Category icon, Title, Location, Status Badge, Date, Right Chevron `>`.

### 5.6 Issue Details Screen (`/issues/[id]`)
- **NOT SHOWN IN REFERENCE — UI MUST FOLLOW THE SAME DESIGN SYSTEM**:
  - White card container (`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm`).
  - Header with priority & status badges, issue title, location metadata.
  - Description body, attachments grid, resolution details box (green tint `#ecfdf5`).
  - Staff resolution form (for Staff/Admin) & Submitter verification/reopen buttons (for Student).
  - Comments section with flat comment cards and input field.

### 5.7 Lost & Found Directory Screen (`/lost-found`)
- **Header**: `"Lost & Found"`, Subtitle: `"Browse lost belongings or report found items on campus."`. Right action button `"Post Item"`.
- **Main Card Container (`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6`)**:
  - **Tabs Bar**: `Lost Items` (active with blue bottom border) | `Found Items` | `My Claims`.
  - **Search Input**: Input with search icon.
  - **Item Cards List**: Left 48px x 48px image thumbnail or fallback letter badge, Title, Location & Type subtitle (`Lost • Block B`), Date, Status pill (`Searching` purple, `Possible Match` green, `Under Review` orange), Right Chevron `>`.

### 5.8 Report Lost Item Screen (`/lost-found/new?type=Lost`)
- **Header**: `"Lost & Found"`.
- **Card Form (`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5`)**:
  - Tab Bar: `Report Lost` (active blue bottom border) | `Report Found`.
  - `Item Name` & `Category` grid inputs.
  - `Description` (Textarea).
  - `Last Seen Location` & `Date & Time` grid inputs.
  - `Upload Photo (optional)` dashed dropzone box.
  - Submit Button: Full width `#2563eb` button (`py-3.5 font-bold text-sm rounded-xl text-white shadow-md hover:bg-[#1d4ed8]`).

### 5.9 Report Found Item Screen (`/lost-found/new?type=Found`)
- Identical layout to Report Lost Item, with `Report Found` tab active.

### 5.10 Lost & Found Item Details Screen (`/lost-found/[id]`)
- **NOT SHOWN IN REFERENCE — UI MUST FOLLOW THE SAME DESIGN SYSTEM**:
  - White card container with item metadata, type badge, status pill, image attachment preview, and ownership claim form (`Submit Ownership Claim` for Found items).

### 5.11 Claims Screen (`/lost-found?tab=MyClaims`)
- Rendered within `/lost-found` under `My Claims` tab. Displays claim cards with found item title, evidence snippet, and status badge (`Approved` green, `Pending` amber, `Rejected` red).

### 5.12 Notifications Screen (`/notifications`)
- **NOT SHOWN IN REFERENCE — UI MUST FOLLOW THE SAME DESIGN SYSTEM**:
  - Header: `"Notifications"`, right action `"Mark all read"`. List of notification cards (`bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm`). Unread items have soft blue tint (`bg-blue-50/50`).

### 5.13 Profile Screen (`/profile`)
- **NOT SHOWN IN REFERENCE — UI MUST FOLLOW THE SAME DESIGN SYSTEM**:
  - Header: `"User Profile"`. White card container displaying user avatar, name, role badge, email, campus ID, department, and phone number cards.

### 5.14 Staff Dashboard Screen (`/dashboard` - Staff Role)
- **Header**: `"Staff Dashboard"`, Subtitle: `"Manage your assigned tasks"`.
- **3 Stat Cards Row**:
  - **Card 1 (Assigned Issues)**: White card (`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center justify-between`). Count: `12` in `text-3xl font-extrabold text-slate-900`. Icon: 48px x 48px `#eff6ff` light blue square with `#2563eb` clipboard/wrench icon.
  - **Card 2 (Found Items)**: Count: `8`. Icon: 48px x 48px `#ecfdf5` light green square with `#059669` check circle icon.
  - **Card 3 (Pending Claims)**: Count: `3`. Icon: 48px x 48px `#fff7ed` light orange square with `#d97706` box icon.
- **Section: "Recent Assigned Issues"**: Header with right-aligned `"View all"` link. List of issue cards with icon, title, location, priority badge (`High` red pill, `Medium` orange pill, `Low` green pill), date, right chevron `>`.

### 5.15–5.16 Staff Sub-Pages
- **NOT SHOWN IN REFERENCE — UI MUST FOLLOW THE SAME DESIGN SYSTEM**:
  - Staff Assigned Issues (`/issues?assigned=me`), Staff Lost & Found (`/lost-found`). Follow white card layout and table/list design system.

### 5.17 Admin Dashboard Screen (`/dashboard` - Admin Role)
- **Header**: `"Admin Dashboard"`, Subtitle: `"Campus overview and key statistics"`.
- **4 Stat Cards Row**:
  - **Card 1 (Total Users)**: Count `248`, green trend badge `↑ 12%` (`bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full text-xs`).
  - **Card 2 (Resolved)**: Count `186`, trend badge `↑ 8%`.
  - **Card 3 (Lost Items)**: Count `42`, trend badge `↑ 5%`.
  - **Card 4 (Returned)**: Count `37`, trend badge `↑ 6%`.
- **Main Grid (2-Column Desktop Grid)**:
  - **Left Card ("Issue Categories")**: White card container. Donut chart / percentage progress bars:
    - AC / Ventilation: 22% (Royal Blue)
    - Electrical: 16% (Purple)
    - Plumbing: 14% (Pink)
    - Furniture: 12% (Orange)
    - Wi-Fi / Network: 10% (Yellow)
    - Others: 24% (Green)
  - **Right Card ("Recent Activity")**: Activity feed list:
    - `New issue reported` (`Block A • Wi-Fi Issue`, `2h ago`)
    - `Item claimed` (`Black laptop bag`, `4h ago`)
    - `Issue resolved` (`Broken chair`, `6h ago`)

### 5.18 Admin Users Screen (`/admin/users`)
- **NOT SHOWN IN REFERENCE — UI MUST FOLLOW THE SAME DESIGN SYSTEM**:
  - Header: `"User & Role Management"`. White card container with data table listing User Name, Email, Campus ID, Role selector dropdown (`Student`, `Staff`, `Administrator`), Status badge (`Active`, `Deactivated`), and Action buttons (`Activate`/`Deactivate`).

### 5.19–5.24 Admin Sub-Pages
- **NOT SHOWN IN REFERENCE — UI MUST FOLLOW THE SAME DESIGN SYSTEM**:
  - Admin Audit Logs (`/admin/audit`), Admin Reports (`/admin/reports`). Follow white card container layout with data tables and filter bars.

### 5.25 Mobile Student UI Specification
- **Top Bar**: Compact white bar with CampusConnect logo, search icon, bell icon, menu icon. Top right user avatar badge (`VS`).
- **Header**: `"Good Morning, Vishnu"`, subtitle `"Welcome back to CampusConnect"`.
- **Quick Action Cards**: 2-column grid (`Report Issue` blue card & `Lost & Found` teal card).
- **"My Summary" Card**: White card with list items:
  - `My Issues` (`3 >`)
  - `My Lost Items` (`1 >`)
  - `My Found Items` (`0 >`)
- **Fixed Bottom Navigation Bar**: 4 icons (`Home` active blue, `Issues`, `Lost & Found`, `Profile`).

### 5.26–5.27 Mobile Staff & Admin UI Specifications
- **NOT SHOWN IN REFERENCE — UI MUST FOLLOW THE SAME DESIGN SYSTEM**:
  - Uses the same compact header, 2-column mobile stat card grid, and bottom navigation bar.

---

## 6. Component Specifications

### 6.1 Action Buttons
- **Primary Button**: `bg-[#2563eb] text-white font-bold text-sm rounded-xl py-3 px-6 shadow-md hover:bg-[#1d4ed8] focus:outline-none transition-all disabled:opacity-50`.
- **Secondary Button**: `bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl py-2.5 px-4 hover:bg-slate-200 transition-all`.
- **Icon Button**: `p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors`.

### 6.2 Form Inputs & Select Dropdowns
- **Text Input / Select**: `w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all`.
- **Textarea**: `w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all`.

### 6.3 Drag-and-Drop Dropzone
- **Dashed Upload Box**: `border-2 border-dashed border-slate-200 hover:border-[#2563eb] rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer`. Icon: 48px circular `#eff6ff` container with `#2563eb` cloud upload icon.

### 6.4 Status & Priority Badges
- **Pill Badges**: `px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1`.

---

## 7. Strict Visual Rules (What Must NOT Be Changed)

1. **Do NOT create dark purple, dark slate, or dark mode dashboards**. The background must remain crisp off-white (`#f8fafc`) and cards must remain pure white (`#ffffff`).
2. **Do NOT use large purple hero banners**. Welcome sections must use text headings (`Good Morning, [Name]`) on white workspace backgrounds.
3. **Do NOT use broken glyphs or `??` icon placeholders**. Use `lucide-react` vector components cleanly.
4. **Do NOT use `Reported` as an issue status badge in the UI**. Display `Open` for reported issues in UI badges.
5. **Do NOT introduce Admin approval warning banners** on the login or registration pages.
6. **Do NOT alter card proportions, rounded corner radiuses (`16px`), or blue primary accent colors (`#2563eb`)**.

---

## 8. Summary of Non-Visible Pages (Design Extensions)

The following pages were not explicitly shown in the 10-screen reference image and must be constructed by extending the established light design system:
- Issue Details (`/issues/[id]`)
- Lost & Found Item Details (`/lost-found/[id]`)
- Notifications Inbox (`/notifications`)
- User Profile (`/profile`)
- Admin Users Management (`/admin/users`)
- Admin Audit Logs (`/admin/audit`)
- Admin Reports Exporter (`/admin/reports`)
