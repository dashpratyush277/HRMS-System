# HRMS Layout & CSS Guide

This document explains the exact layout structure, CSS classes, and component hierarchy
for every page in the system. Use it as your reference when redesigning or restyling.

---

## Table of Contents

1. [Global Design System](#1-global-design-system)
2. [Layout Shells](#2-layout-shells)
3. [Shared Components (Building Blocks)](#3-shared-components-building-blocks)
4. [Auth Pages](#4-auth-pages)
5. [Dashboard Pages](#5-dashboard-pages)
6. [Employee Pages](#6-employee-pages)
7. [Department Pages](#7-department-pages)
8. [Attendance Pages](#8-attendance-pages)
9. [Leave Pages](#9-leave-pages)
10. [Payroll Pages](#10-payroll-pages)
11. [Performance Pages](#11-performance-pages)
12. [Recruitment Pages](#12-recruitment-pages)
13. [Profile Page](#13-profile-page)
14. [Notification Page](#14-notification-page)
15. [Audit Logs Page](#15-audit-logs-page)
16. [Calendar Pages](#16-calendar-pages)
17. [How to Change Layouts](#17-how-to-change-layouts)

---

## 1. Global Design System

### Color Palette (Tailwind slate scale)

| Role              | Tailwind class     | Usage                              |
|-------------------|--------------------|------------------------------------|
| Page background   | `bg-slate-950`     | Outermost wrapper, whole app       |
| Sidebar           | `bg-slate-900`     | Left navigation panel              |
| Navbar            | `bg-slate-900/80`  | Top bar (semi-transparent)         |
| Cards             | `bg-slate-800`     | Every info card / form panel       |
| Input background  | `bg-slate-800/60`  | All text inputs and selects        |
| Borders           | `border-slate-700` | Cards, inputs, dividers            |
| Primary text      | `text-white`       | Headings, values                   |
| Secondary text    | `text-slate-400`   | Labels, subtitles, descriptions    |
| Muted text        | `text-slate-500`   | Placeholders, timestamps           |
| Primary action    | `bg-blue-600`      | Main CTA buttons                   |
| Danger action     | `bg-red-600`       | Delete, reject buttons             |
| Success accent    | `text-emerald-400` | Active status, success messages    |

### Typography

| Element     | Classes                             |
|-------------|-------------------------------------|
| Page title  | `text-2xl font-bold text-white`     |
| Card title  | `text-lg font-semibold text-white`  |
| Section label | `text-sm font-medium text-slate-400` |
| Body text   | `text-sm text-slate-300`            |
| Small/meta  | `text-xs text-slate-500`            |

### Border Radius

- Cards and large panels: `rounded-xl` or `rounded-2xl`
- Buttons: `rounded-xl` (in `Button.jsx`) or `rounded-lg` (inline buttons)
- Badges / pills: `rounded-full`
- Inputs: `rounded-xl`

---

## 2. Layout Shells

There are only two layout wrappers. Every page uses one of them.

---

### 2A. DashboardLayout
**File:** `frontend/src/components/DashboardLayout.jsx`
**Used by:** All protected pages (every page except Login, Register, ForgotPassword, ResetPassword, Unauthorized)

```
┌─────────────────────────────────────────────────────┐
│  div.min-h-screen.bg-slate-950.flex                 │
│  ┌──────────────┬────────────────────────────────┐  │
│  │              │  div.flex-1.flex.flex-col.min-w-0│  │
│  │  <Sidebar>   │  ┌──────────────────────────┐  │  │
│  │  w-64        │  │  <Navbar> h-14           │  │  │
│  │  (fixed on   │  └──────────────────────────┘  │  │
│  │   mobile,    │  ┌──────────────────────────┐  │  │
│  │   static on  │  │  <main>                  │  │  │
│  │   desktop)   │  │  flex-1.overflow-y-auto  │  │  │
│  │              │  │  p-6                     │  │  │
│  │              │  │                          │  │  │
│  │              │  │  {children} ← page goes  │  │  │
│  │              │  │              here        │  │  │
│  │              │  └──────────────────────────┘  │  │
│  └──────────────┴────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Key classes to change:**
- Page background: `bg-slate-950` on outer div
- Content padding: `p-6` on `<main>` — change this to change all page padding at once
- Main area max width: not set (full width). To constrain, add `max-w-7xl mx-auto` to `<main>` or inside each page

---

### 2B. AuthLayout
**File:** `frontend/src/components/AuthLayout.jsx`
**Used by:** Login, Register, ForgotPassword, ResetPassword

```
┌─────────────────────────────────────────────────────┐
│  div.min-h-screen.bg-slate-950.flex                 │
│  ┌──────────────────────┬────────────────────────┐  │
│  │  LEFT PANEL          │  RIGHT PANEL            │  │
│  │  hidden lg:flex      │  w-full lg:w-1/2        │  │
│  │  lg:w-1/2            │  flex items-center      │  │
│  │                      │  justify-center          │  │
│  │  bg-gradient-to-br   │  p-6 sm:p-10            │  │
│  │  from-blue-600       │                         │  │
│  │  via-indigo-600      │  ┌───────────────────┐  │  │
│  │  to-purple-700       │  │  div.w-full.max-w-md│  │  │
│  │                      │  │                   │  │  │
│  │  - Logo              │  │  {children}       │  │  │
│  │  - "HRMS" title      │  │  (login/register  │  │  │
│  │  - Feature list      │  │   form goes here) │  │  │
│  │                      │  └───────────────────┘  │  │
│  └──────────────────────┴────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Key classes to change:**
- Left panel gradient: `from-blue-600 via-indigo-600 to-purple-700`
- Left panel: hidden on mobile (`hidden lg:flex`)
- Form container width: `max-w-md`

---

### 2C. Sidebar
**File:** `frontend/src/components/Sidebar.jsx`

```
┌─────────────────────────────┐
│  aside.w-64.bg-slate-900    │
│  border-r.border-slate-800  │
│  ┌───────────────────────┐  │
│  │  Logo area  p-5       │  │
│  │  "H" icon + "HRMS"    │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  Role label  px-5 pt-4│  │
│  │  "Admin Panel" etc.   │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  nav links  px-3      │  │
│  │  Each link:           │  │
│  │  flex gap-3 px-3 py-2.5│ │
│  │  rounded-xl           │  │
│  │  Active: bg-blue-600/20│  │
│  │          text-blue-400 │  │
│  │  Hover:  bg-slate-800  │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  User pill  p-4       │  │
│  │  border-t border-slate-800│
│  └───────────────────────┘  │
└─────────────────────────────┘
```

**Key classes to change:**
- Sidebar width: `w-64` — change here and in DashboardLayout
- Background: `bg-slate-900`
- Active link: `bg-blue-600/20 text-blue-400 border border-blue-500/30`

---

### 2D. Navbar
**File:** `frontend/src/components/Navbar.jsx`

```
┌─────────────────────────────────────────────────────┐
│  header.h-14.bg-slate-900/80.backdrop-blur-sm       │
│  border-b.border-slate-800                          │
│  flex.items-center.justify-between.px-4             │
│  ┌──────────┬────────────────────────────────────┐  │
│  │ Hamburger│  [NotificationBell] [Avatar+Name]  │  │
│  │ (mobile) │  [Logout button]                   │  │
│  └──────────┴────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 3. Shared Components (Building Blocks)

These appear across many pages. Changing one file changes all pages that use it.

### PageHeader — `frontend/src/components/PageHeader.jsx`
```
┌─────────────────────────────────────────────────┐
│  div.flex.flex-col.sm:flex-row                  │
│  sm:items-center.sm:justify-between.gap-4.mb-6  │
│  ┌───────────────────┐  ┌──────────────────┐   │
│  │  h1 — page title  │  │  {action} button │   │
│  │  text-2xl.font-bold│  │  (optional)      │   │
│  │  text-white        │  └──────────────────┘   │
│  │  p  — subtitle    │                          │
│  │  text-slate-400   │                          │
│  └───────────────────┘                          │
└─────────────────────────────────────────────────┘
```
Used on: EmployeeList, PayrollList, LeaveList, AttendanceList, DepartmentList, and most list/form pages.

---

### DashboardCard — `frontend/src/components/DashboardCard.jsx`
```
┌─────────────────────────────────────┐
│  div.bg-gradient-to-br              │
│  border.rounded-2xl.p-6             │
│  hover:scale-105.transition         │
│  ┌──────────┬──────────────────┐    │
│  │  icon    │  trend badge     │    │
│  │  text-2xl│  (optional)      │    │
│  └──────────┴──────────────────┘    │
│  p.text-3xl.font-bold.text-white    │  ← big number
│  p.text-sm.text-slate-400           │  ← label
└─────────────────────────────────────┘
```
Color variants: `blue`, `purple`, `green`, `orange`, `red`
Used on: AdminDashboard, HRDashboard, EmployeeDashboard

---

### InputField — `frontend/src/components/InputField.jsx`
```
div.space-y-1
  label  text-sm.font-medium.text-slate-300
  div.relative
    input  w-full.px-4.py-3.rounded-xl
           bg-slate-800/60.border.border-slate-700
           text-white.placeholder-slate-500
           focus:ring-2.focus:ring-blue-500
    (optional right-side children, e.g. show/hide button)
  p.text-xs.text-red-400  ← error message
```
Used on: Login, Register, ForgotPassword, ResetPassword

---

### Button — `frontend/src/components/Button.jsx`
```
button  px-6.py-3.rounded-xl.font-semibold.text-sm
        flex.items-center.justify-center.gap-2
```
Variants:
- `primary` → `bg-gradient-to-r from-blue-600 to-indigo-600`
- `secondary` → `bg-slate-700`
- `ghost` → transparent with `border-slate-700`
- `danger` → `bg-red-600`

---

### LoadingSpinner — `frontend/src/components/LoadingSpinner.jsx`
```
div.flex.flex-col.items-center.justify-center.py-20
  div.w-10.h-10.border-4.border-blue-500.border-t-transparent
     .rounded-full.animate-spin.mb-4
  p.text-slate-400.text-sm   ← message
```

---

### EmptyState — `frontend/src/components/EmptyState.jsx`
```
div.flex.flex-col.items-center.justify-center.py-20.text-center
  div.w-16.h-16.bg-slate-800.rounded-2xl  ← icon box
  h3.text-lg.font-semibold.text-white
  p.text-slate-400.text-sm
  {action}  ← optional CTA button
```

---

### Badge Components

All badge components share this pattern:
```
span  px-2.py-1 (or px-2.5.py-0.5)
      rounded-full (or rounded-md)
      text-xs.font-semibold
      bg-{color}/20.text-{color}-400
```

Files:
- `StatusBadge.jsx` — active/inactive/terminated
- `LeaveStatusBadge.jsx` — pending/approved/rejected/cancelled
- `LeaveTypeBadge.jsx` — casual/sick/earned etc.
- `PaymentStatusBadge.jsx` — pending/paid/failed
- `GoalStatusBadge.jsx` — not-started/in-progress/completed/overdue
- `AttendanceStatusBadge.jsx` — present/absent/half-day/leave
- `JobStatusBadge.jsx` — open/closed/paused
- `CandidateStageBadge.jsx` — applied/screening/interview/offer/hired/rejected

---

## 4. Auth Pages

### Login — `/login`
**File:** `pages/Login.jsx`
**Layout:** `AuthLayout`

```
AuthLayout
  └─ (right panel, max-w-md)
       ├─ Mobile logo  (lg:hidden)
       ├─ h2 "Welcome back"  text-3xl.font-bold.text-white
       ├─ p "Sign in..."    text-slate-400.text-sm.mb-8
       ├─ form.space-y-5
       │    ├─ InputField  (email)
       │    ├─ InputField  (password, with eye toggle)
       │    ├─ div.flex.items-center.justify-between
       │    │    ├─ checkbox "Remember me"
       │    │    └─ Link "Forgot password?"  text-blue-400
       │    ├─ error message  bg-red-500/10.border-red-500/20
       │    └─ Button (primary, fullWidth) "Sign in"
       └─ p "Don't have an account?" + Link "Register"
```

---

### Register — `/register`
**File:** `pages/Register.jsx`
**Layout:** `AuthLayout`

```
AuthLayout
  └─ (right panel)
       ├─ h2 "Create account"
       ├─ form.space-y-5
       │    ├─ InputField  (full name)
       │    ├─ InputField  (email)
       │    ├─ InputField  (password)
       │    ├─ InputField  (confirm password)
       │    ├─ select      (role)  bg-slate-800/60.rounded-xl
       │    └─ Button (primary, fullWidth) "Create Account"
       └─ Link to Login
```

---

### ForgotPassword — `/forgot-password`
**File:** `pages/ForgotPassword.jsx`
**Layout:** `AuthLayout` (or standalone centered card, check file)

```
AuthLayout
  └─ (right panel)
       ├─ Back arrow link to /login
       ├─ h2 "Forgot password?"
       ├─ p  instruction text
       ├─ form
       │    ├─ InputField (email)
       │    └─ Button "Send Reset Link"
       └─ success message (green box) after submit
```

---

### ResetPassword — `/reset-password/:token`
**File:** `pages/ResetPassword.jsx`
**Layout:** `AuthLayout`

```
AuthLayout
  └─ (right panel)
       ├─ h2 "Set new password"
       ├─ form
       │    ├─ InputField (new password)
       │    ├─ InputField (confirm password)
       │    └─ Button "Reset Password"
       └─ Auto-redirect to /login on success
```

---

## 5. Dashboard Pages

### AdminDashboard — `/admin/dashboard`
**File:** `pages/admin/AdminDashboard.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ Welcome header
       │    h1 text-3xl.font-bold.text-white
       │    p  text-slate-400
       │
       ├─ Stats grid  grid.grid-cols-2.lg:grid-cols-4.gap-4.mb-8
       │    └─ DashboardCard × 8–10 (employees, leaves, payroll, etc.)
       │
       ├─ Quick actions grid  grid.grid-cols-2.sm:grid-cols-4.gap-3.mb-8
       │    └─ clickable cards linking to sub-pages
       │
       └─ Bottom info grid  grid.grid-cols-1.lg:grid-cols-2.gap-6
            ├─ Recent activity list  (bg-slate-800.rounded-xl.p-5)
            └─ Leave stats list      (bg-slate-800.rounded-xl.p-5)
```

---

### HRDashboard — `/hr/dashboard`
**File:** `pages/hr/HRDashboard.jsx`
**Layout:** `DashboardLayout`

Same structure as AdminDashboard but with HR-specific stats and fewer cards (no audit log shortcut).

---

### EmployeeDashboard — `/employee/dashboard`
**File:** `pages/employee/EmployeeDashboard.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ Welcome header
       ├─ Stats row  grid.grid-cols-2.sm:grid-cols-4.gap-4
       │    └─ DashboardCard × 4 (attendance, leave, payslip, goals)
       ├─ Quick links grid  grid.grid-cols-2.sm:grid-cols-3.gap-3
       └─ My recent leaves table  bg-slate-800.rounded-xl
```

---

## 6. Employee Pages

### EmployeeList — `/employees`
**File:** `pages/employees/EmployeeList.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  title="Employees"  action="+ Add Employee" button
       │
       ├─ Filter bar  grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-4.gap-3.mb-6
       │    ├─ search input    bg-slate-800/60.border-slate-700.rounded-xl
       │    ├─ department select
       │    ├─ status select
       │    └─ employment-type select
       │
       ├─ LoadingSpinner  (while fetching)
       ├─ error message   (bg-red-500/10 box)
       ├─ EmptyState      (if 0 results)
       │
       ├─ Results count  text-sm.text-slate-400.mb-4
       │
       ├─ Cards grid  grid.grid-cols-1.sm:grid-cols-2.xl:grid-cols-3.gap-4
       │    └─ Employee card (bg-slate-800.rounded-xl.p-5.border.border-slate-700)
       │         ├─ Avatar + name + employeeId
       │         ├─ Department / designation
       │         ├─ StatusBadge
       │         └─ Action buttons (View, Edit, Delete)
       │
       └─ Pagination  flex.justify-center.gap-2.mt-6
```

---

### AddEmployee — `/employees/add`
**File:** `pages/employees/AddEmployee.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  title="Add Employee"  action=back button
       │
       └─ form  max-w-4xl.mx-auto
            ├─ Section: Personal Info  bg-slate-800.rounded-xl.p-6.mb-6
            │    grid.grid-cols-1.sm:grid-cols-2.gap-4
            │    └─ inputs: firstName, lastName, email, phone, gender, dob, address
            │
            ├─ Section: Job Info  bg-slate-800.rounded-xl.p-6.mb-6
            │    grid.grid-cols-1.sm:grid-cols-2.gap-4
            │    └─ inputs: employeeId, department, designation, employmentType,
            │               joiningDate, status
            │
            ├─ Section: Salary  bg-slate-800.rounded-xl.p-6.mb-6
            │    └─ basicSalary input
            │
            ├─ Section: Emergency Contact  bg-slate-800.rounded-xl.p-6.mb-6
            │    grid.grid-cols-1.sm:grid-cols-2.gap-4
            │    └─ emergencyContactName, emergencyContactPhone
            │
            └─ Submit row  flex.justify-end.gap-3
                 ├─ Cancel button
                 └─ Save button
```

---

### EditEmployee — `/employees/:id/edit`
Same layout as AddEmployee, fields pre-filled.

---

### EmployeeProfile — `/employees/:id`
**File:** `pages/employees/EmployeeProfile.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action = Edit + Delete buttons
       │
       ├─ Profile hero card  bg-slate-800.rounded-xl.p-6.mb-6
       │    flex.items-center.gap-6
       │    ├─ Avatar (large, initials or photo)
       │    └─ Name, employeeId, designation, StatusBadge, joiningDate
       │
       └─ Detail grid  grid.grid-cols-1.lg:grid-cols-2.gap-6
            ├─ Personal Info card   bg-slate-800.rounded-xl.p-6
            ├─ Employment Info card bg-slate-800.rounded-xl.p-6
            ├─ Salary card         bg-slate-800.rounded-xl.p-6
            └─ Emergency Contact   bg-slate-800.rounded-xl.p-6
```

---

## 7. Department Pages

### DepartmentList — `/departments`
**File:** `pages/departments/DepartmentList.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action="+ Add Department"
       ├─ Search input  mb-6
       ├─ EmptyState / LoadingSpinner
       └─ Cards grid  grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-3.gap-4
            └─ Department card  bg-slate-800.rounded-xl.p-5.border-slate-700
                 ├─ Dept name  text-lg.font-semibold
                 ├─ Description  text-slate-400.text-sm
                 ├─ Head / employee count
                 └─ Action buttons (View, Edit, Delete)
```

---

### AddDepartment / EditDepartment
Simple single-card form:
```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader
       └─ form  max-w-2xl.mx-auto
            └─ bg-slate-800.rounded-xl.p-6
                 ├─ name input
                 ├─ description textarea
                 ├─ head-of-department select/input
                 └─ Submit row
```

---

### DepartmentDetails — `/departments/:id`
```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action = Edit button
       ├─ Info card  bg-slate-800.rounded-xl.p-6.mb-6
       └─ Employee list table  bg-slate-800.rounded-xl
```

---

## 8. Attendance Pages

### AttendanceList — `/attendance`
**File:** `pages/attendance/AttendanceList.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action = "Mark Attendance" + "Bulk" buttons
       │
       ├─ Filter bar  grid.grid-cols-2.lg:grid-cols-4.gap-3.mb-6
       │    ├─ date input
       │    ├─ month/year selects
       │    ├─ status select
       │    └─ employee search
       │
       ├─ Summary strip  flex.gap-4.mb-4  (present/absent counts)
       │
       └─ Table  bg-slate-800.rounded-xl.overflow-hidden
            ├─ thead  bg-slate-900/50  th px-4.py-3 text-xs.uppercase.text-slate-400
            └─ tbody  divide-y.divide-slate-700/50
                 └─ tr  hover:bg-slate-700/30
                      ├─ Employee name + id
                      ├─ Date
                      ├─ AttendanceStatusBadge
                      ├─ Check-in / check-out
                      └─ Edit button
```

---

### MarkAttendance — `/attendance/mark`
**File:** `pages/attendance/MarkAttendance.jsx`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader
       └─ form  max-w-2xl.mx-auto.bg-slate-800.rounded-xl.p-6
            ├─ Employee select
            ├─ Date input
            ├─ Status select
            ├─ Check-in / check-out time inputs
            ├─ Remarks textarea
            └─ Submit row
```

---

### BulkAttendance — `/attendance/bulk`
```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader
       ├─ Date + Status selects (apply to all)  bg-slate-800.rounded-xl.p-4.mb-6
       └─ Employee table with per-row status overrides
            bg-slate-800.rounded-xl
```

---

### MyAttendance — `/my-attendance`
**File:** `pages/attendance/MyAttendance.jsx`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  "My Attendance"
       ├─ Month/year filter  + summary cards row
       │    flex.gap-4  (present/absent/late counts)
       └─ Table  bg-slate-800.rounded-xl
            (same table structure as AttendanceList but no Edit column)
```

---

## 9. Leave Pages

### LeaveList — `/leaves`
**File:** `pages/leaves/LeaveList.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action="Apply Leave" button
       │
       ├─ Filter bar  grid.grid-cols-2.lg:grid-cols-4.gap-3.mb-6
       │    ├─ status filter
       │    ├─ leave type filter
       │    ├─ month/year filter
       │    └─ employee search
       │
       └─ Table  bg-slate-800.rounded-xl.overflow-hidden
            ├─ thead  bg-slate-900/50
            └─ tbody  divide-y.divide-slate-700/50
                 └─ tr
                      ├─ Employee name
                      ├─ Leave type badge
                      ├─ Date range
                      ├─ Days count
                      ├─ Leave status badge
                      └─ Action buttons (View, Approve, Reject)
```

---

### ApplyLeave — `/leaves/apply` or `/apply-leave`
**File:** `pages/leaves/ApplyLeave.jsx`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader
       └─ form  max-w-2xl.mx-auto.bg-slate-800.rounded-xl.p-6
            ├─ Employee select (admin/hr only)
            ├─ Leave type select
            ├─ Start date / End date inputs  grid.grid-cols-2.gap-4
            ├─ Calculated days display
            ├─ Reason textarea
            ├─ Attachment file upload
            └─ Submit row
```

---

### LeaveDetails — `/leaves/:id`
**File:** `pages/leaves/LeaveDetails.jsx`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action = Approve/Reject buttons (admin/hr only)
       └─ grid.grid-cols-1.lg:grid-cols-3.gap-6
            ├─ Main info card (col-span-2)  bg-slate-800.rounded-xl.p-6
            │    ├─ Employee section
            │    ├─ Leave details (type, dates, days, reason)
            │    └─ Status history
            └─ Sidebar card  bg-slate-800.rounded-xl.p-6
                 ├─ Status badge (large)
                 ├─ Reviewer info
                 └─ Admin comment
```

---

### MyLeaves — `/my-leaves`
**File:** `pages/leaves/MyLeaves.jsx`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action="Apply Leave" button
       ├─ Leave balance cards row (LeaveBalanceCard components)
       └─ Table  bg-slate-800.rounded-xl  (same as LeaveList, no Approve/Reject)
```

---

### LeaveBalance — `/leaves/balance`
**File:** `pages/leaves/LeaveBalance.jsx`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  "Leave Balances"
       ├─ Employee search/select
       └─ Balance grid  grid.grid-cols-2.sm:grid-cols-3.gap-4
            └─ LeaveBalanceCard per type (casual, sick, earned, etc.)
```

---

## 10. Payroll Pages

### PayrollList — `/payroll`
**File:** `pages/payroll/PayrollList.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action = "Generate" + "Bulk" buttons
       │
       ├─ Filter bar  grid.grid-cols-2.lg:grid-cols-4.gap-3.mb-6
       │    ├─ month select
       │    ├─ year input
       │    ├─ payment status select
       │    └─ department select
       │
       └─ Table  bg-slate-800.rounded-xl
            thead  th: Employee, Month, Gross, Deductions, Net, Status, Actions
            tbody
              tr
               ├─ Employee name + id
               ├─ Month Year
               ├─ Salary amounts (formatted ₹)
               ├─ PaymentStatusBadge
               └─ Action buttons (View, Edit, Mark Paid, Delete)
```

---

### GeneratePayroll — `/payroll/generate`
**File:** `pages/payroll/GeneratePayroll.jsx`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader
       └─ form  max-w-3xl.mx-auto
            ├─ Employee + Month + Year  bg-slate-800.rounded-xl.p-6.mb-4
            ├─ Earnings section  bg-slate-800.rounded-xl.p-6.mb-4
            │    grid.grid-cols-2.gap-4
            │    └─ hra, allowances, bonus inputs
            ├─ Deductions section  bg-slate-800.rounded-xl.p-6.mb-4
            │    grid.grid-cols-2.gap-4
            │    └─ tax, pf, insurance, otherDeductions inputs
            ├─ Attendance section  bg-slate-800.rounded-xl.p-6.mb-4
            ├─ SalaryPreview component (live calculation box)
            └─ Submit row
```

---

### PayrollDetails — `/payroll/:id`
**File:** `pages/payroll/PayrollDetails.jsx`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action = Edit + Mark Paid + Export PDF buttons
       └─ grid.grid-cols-1.lg:grid-cols-3.gap-6
            ├─ Payslip main card (col-span-2)  bg-slate-800.rounded-xl.p-6
            │    ├─ Employee info row
            │    ├─ Earnings table
            │    ├─ Deductions table
            │    └─ Net pay total  bg-blue-600.rounded-xl.p-4
            └─ Sidebar card
                 ├─ Payment status
                 ├─ Payment date
                 └─ Transaction ID
```

---

### MyPayslips — `/my-payslips`
**File:** `pages/payroll/MyPayslips.jsx`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader
       ├─ Year filter
       └─ Grid  grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-3.gap-4
            └─ PayslipCard per record
```

---

## 11. Performance Pages

### GoalList — `/performance/goals`
**File:** `pages/performance/GoalList.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action="Add Goal"
       ├─ Filter bar  search + status + category selects
       └─ Goals grid  grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-3.gap-4
            └─ Goal card  bg-slate-800.rounded-xl.p-5
                 ├─ GoalStatusBadge + PriorityBadge
                 ├─ Title + description
                 ├─ ProgressBar (0–100%)
                 ├─ Due date
                 └─ Action links
```

---

### AddGoal / EditGoal
```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader
       └─ form  max-w-2xl.mx-auto.bg-slate-800.rounded-xl.p-6
            ├─ title, description inputs
            ├─ category, priority selects
            ├─ startDate, dueDate  grid.grid-cols-2.gap-4
            ├─ weight input
            └─ Submit row
```

---

### ReviewList — `/performance/reviews`
**File:** `pages/performance/ReviewList.jsx`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action="Add Review"
       ├─ Filter bar
       └─ Table  bg-slate-800.rounded-xl
            thead: Employee, Period, Reviewer, Rating, Status, Actions
```

---

### MyPerformance — `/my-performance`
**File:** `pages/performance/MyPerformance.jsx`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader
       ├─ Stats row  grid.grid-cols-3.gap-4  (active/completed/overdue goals)
       ├─ My Goals section  (same cards as GoalList)
       └─ My Reviews section  (table)
```

---

## 12. Recruitment Pages

### JobList — `/recruitment`
**File:** `pages/recruitment/JobList.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action="Add Job"
       ├─ Filter bar  search + status + department
       └─ Job cards  grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-3.gap-4
            └─ Job card  bg-slate-800.rounded-xl.p-5
                 ├─ Job title  text-lg.font-semibold
                 ├─ Department / type / location
                 ├─ JobStatusBadge
                 ├─ Salary range
                 ├─ Applicants count
                 └─ Action buttons (View, Edit, Delete)
```

---

### CandidateList — `/recruitment/candidates`
**File:** `pages/recruitment/CandidateList.jsx`

```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader  action="Add Candidate"
       ├─ Filter bar  search + stage + job
       └─ Table  bg-slate-800.rounded-xl
            thead: Candidate, Job, Applied Date, Stage, Status, Actions
```

---

### AddJob / EditJob, AddCandidate / EditCandidate
Same single-panel form layout:
```
DashboardLayout
  └─ main (p-6)
       ├─ PageHeader
       └─ form  max-w-3xl.mx-auto.bg-slate-800.rounded-xl.p-6
```

---

## 13. Profile Page

### MyProfilePage — `/profile`
**File:** `pages/profile/MyProfilePage.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ max-w-4xl.mx-auto.space-y-6
       │
       ├─ HERO CARD  bg-slate-800.rounded-xl.border-slate-700.overflow-hidden
       │    ├─ Cover strip  h-24.bg-gradient-to-r  (decorative top band)
       │    └─ px-6.pb-6
       │         ├─ -mt-10  Avatar + name/email row
       │         ├─ Role badge + Status badge + "Change Photo" button
       │         └─ Employee quick info line (id, dept, designation, since)
       │
       ├─ ProfilePictureUpload  (toggles on "Change Photo" click)
       │
       └─ grid.grid-cols-1.lg:grid-cols-3.gap-6
            │
            ├─ LEFT COLUMN  lg:col-span-2.space-y-6
            │    ├─ Personal Info card  bg-slate-800.rounded-xl.p-6
            │    │    ├─ Header row: icon + title + Edit button
            │    │    └─ View mode: InfoRow list
            │    │       Edit mode: form (name/phone/dob/gender/address)
            │    │                  Save + Cancel buttons
            │    │
            │    ├─ Employment Details card  bg-slate-800.rounded-xl.p-6
            │    │    └─ Read-only InfoRow list (id, dept, designation, etc.)
            │    │
            │    └─ Emergency Contact card  bg-slate-800.rounded-xl.p-6
            │         (only shown if employee has emergency contact data)
            │
            └─ RIGHT COLUMN  space-y-6
                 ├─ Account Info card  bg-slate-800.rounded-xl.p-6
                 │    └─ Read-only: role, status, joined date, updated date
                 │
                 └─ ChangePasswordCard  bg-slate-800.rounded-xl.p-6
                      ├─ 3 password inputs (current, new, confirm)
                      ├─ Show/hide toggles
                      ├─ Password strength bar (3 colored strips)
                      └─ Submit button (orange)

       └─ ProfileSummaryCards  bg-slate-800.rounded-xl.p-6
            └─ grid.grid-cols-2.sm:grid-cols-3.gap-3
                 └─ Stat card × 6  bg-slate-700/50.rounded-xl.p-4
                      (links to: attendance, leaves, payslips, goals, notifications, calendar)
```

---

## 14. Notification Page

### NotificationsPage — `/notifications`
**File:** `pages/notifications/NotificationsPage.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ max-w-3xl.mx-auto
       │
       ├─ Header row  flex.items-center.justify-between.mb-6
       │    ├─ BellIcon + "Notifications" + count
       │    └─ "Mark all read" button
       │
       ├─ Filter pills row  flex.flex-wrap.gap-2.mb-4
       │    ├─ Type buttons (all/leave/payroll/etc.)  rounded-full
       │    │    active: bg-blue-600  inactive: bg-slate-700
       │    └─ "Unread only" checkbox
       │
       └─ Notification list  bg-slate-800.rounded-xl.border-slate-700
            divide-y.divide-slate-700/50
            └─ Notification row  flex.items-start.gap-3.px-4.py-4
                 ├─ Colour dot (type indicator)  w-2.h-2.rounded-full
                 ├─ Content: title + message + time
                 ├─ Mark-read button  (CheckIcon)
                 └─ Delete button     (TrashIcon)

       └─ Pagination  flex.justify-center.gap-2.mt-4
            (numbered page buttons, active = bg-blue-600)
```

---

## 15. Audit Logs Page

### AuditLogsPage — `/audit-logs`
**File:** `pages/audit/AuditLogsPage.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ Header  ClipboardDocumentListIcon + "Audit Logs" + count
       │
       ├─ Filter row  flex.flex-wrap.gap-3.mb-4
       │    ├─ Action select   (CREATE/UPDATE/DELETE/etc.)
       │    ├─ Entity select   (User/Employee/Leave/etc.)
       │    └─ Search form     (description search + submit button)
       │
       └─ Table  bg-slate-800.rounded-xl.border-slate-700.overflow-hidden
            ├─ thead  bg-slate-900/50  (Action, Entity, Actor, Description, IP, Time)
            └─ tbody  divide-y.divide-slate-700/50
                 └─ tr  hover:bg-slate-700/30
                      ├─ Action (colored by type, e.g. CREATE=green, DELETE=red)
                      ├─ Entity type
                      ├─ Actor name + role
                      ├─ Description (truncated, title on hover)
                      ├─ IP address (monospace font)
                      └─ Time (relative, e.g. "2 hours ago")

       └─ Pagination
```

---

## 16. Calendar Pages

### MyCalendarPage — `/calendar/my`
**File:** `pages/calendar/MyCalendarPage.jsx`
**Layout:** `DashboardLayout`

```
DashboardLayout
  └─ main (p-6)
       ├─ Header row  flex.items-center.justify-between.mb-6
       │    ├─ CalendarIcon + "My Calendar"
       │    └─ Month navigator  (← Month Year →)
       │
       ├─ Summary pills  flex.flex-wrap.gap-3.mb-4
       │    └─ Present/Absent/Late/Half-day/Leaves counts
       │       bg-{color}/20.text-{color}-300.rounded-lg.px-3.py-1.5
       │
       ├─ Legend  flex.gap-3  (colored dots + labels)
       │
       └─ CalendarGrid  rounded-xl.border-slate-700.overflow-hidden
            ├─ Header row: Sun Mon Tue Wed Thu Fri Sat
            │    grid-cols-7.bg-slate-800
            └─ Day cells  grid-cols-7
                 └─ CalendarDay (min-h-[80px].p-1.5)
                      ├─ Day number (circle, today=bg-blue-600)
                      └─ CalendarEventBadge × n (color-coded pills)
```

---

### TeamCalendarPage — `/calendar/team`
**File:** `pages/calendar/TeamCalendarPage.jsx`
**Layout:** `DashboardLayout`

Same as MyCalendarPage plus:
```
       ├─ Employee filter select  (all employees or one specific)
       └─ CalendarGrid  (same component)
```

---

## 17. How to Change Layouts

### Change page padding / spacing
Edit `DashboardLayout.jsx`:
```jsx
// Current
<main className="flex-1 overflow-y-auto p-6">

// Example: more breathing room
<main className="flex-1 overflow-y-auto p-8">

// Example: tighter on mobile
<main className="flex-1 overflow-y-auto p-4 sm:p-6">
```

### Constrain page max-width globally
Add to `DashboardLayout.jsx`:
```jsx
<main className="flex-1 overflow-y-auto p-6">
  <div className="max-w-7xl mx-auto">   {/* ← add this wrapper */}
    {children}
  </div>
</main>
```

### Change sidebar width
In `Sidebar.jsx` change `w-64` to e.g. `w-60` or `w-72`.
Match it in `DashboardLayout.jsx` if you added width there.

### Change app-wide background color
In `DashboardLayout.jsx`: `bg-slate-950` → e.g. `bg-gray-900`
In `AuthLayout.jsx`: same class on outer div.

### Change card style (applies to all cards at once)
Most cards use `bg-slate-800 rounded-xl border border-slate-700`.
To change all at once, search for that class combination across `/pages/` and `/components/`.

### Change the primary action color (buttons, active links, focus rings)
- Buttons: `Button.jsx` `from-blue-600 to-indigo-600`
- Active sidebar link: `Sidebar.jsx` `bg-blue-600/20 text-blue-400`
- Input focus ring: `InputField.jsx` `focus:ring-blue-500`
- Inline buttons across pages: search `bg-blue-600` in `/pages/`

### Change auth page layout
- Left panel gradient: `AuthLayout.jsx` line 7 (`from-blue-600 via-indigo-600 to-purple-700`)
- Form width: `AuthLayout.jsx` line 55 (`max-w-md`)
- To make it full-width (no left panel): remove the `hidden lg:flex` left div entirely

### Change table style (all tables)
Tables share these repeated patterns in page files:
```
bg-slate-800 rounded-xl border border-slate-700 overflow-hidden
thead: bg-slate-900/50, th: px-4 py-3 text-xs font-semibold text-slate-400 uppercase
tbody: divide-y divide-slate-700/50
tr:    hover:bg-slate-700/30 transition-colors
td:    px-4 py-3 text-sm text-slate-300
```
Since tables are written inline in each page file (no shared Table component), search for `thead` in `/pages/` to find them all.

### Change filter inputs style
Shared class across most list pages:
```
bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white
focus:outline-none focus:ring-2 focus:ring-blue-500
```
Some pages define this as `const filterCls = "..."` at the top.

### Change pagination style
Pagination is also inline per page. Search for `Pagination` comment or `flex justify-center gap-2` to find each instance.

### Add a page max-width to a specific page
Inside the page file, wrap the return content:
```jsx
return (
  <DashboardLayout>
    <div className="max-w-5xl mx-auto">   {/* constrain this page only */}
      ...
    </div>
  </DashboardLayout>
);
```

---

## File Quick Reference

| What you want to change    | File to edit                                      |
|----------------------------|---------------------------------------------------|
| Overall page padding       | `components/DashboardLayout.jsx`                  |
| Sidebar width / colors     | `components/Sidebar.jsx`                          |
| Navbar height / colors     | `components/Navbar.jsx`                           |
| Auth page layout/gradient  | `components/AuthLayout.jsx`                       |
| Page title style           | `components/PageHeader.jsx`                       |
| Stat card style            | `components/DashboardCard.jsx`                    |
| Primary button style       | `components/Button.jsx`                           |
| Form input style           | `components/InputField.jsx`                       |
| Loading spinner            | `components/LoadingSpinner.jsx`                   |
| Empty state                | `components/EmptyState.jsx`                       |
| Status badge colors        | `components/StatusBadge.jsx` (and type-specific)  |
| Calendar grid              | `components/calendar/CalendarGrid.jsx`            |
| Calendar day cell          | `components/calendar/CalendarDay.jsx`             |
| Notification bell + badge  | `components/notifications/NotificationBell.jsx`   |
| Notification dropdown      | `components/notifications/NotificationDropdown.jsx`|
| Export button              | `components/common/ExportButton.jsx`              |
| Profile avatar             | `components/profile/UserAvatar.jsx`               |
| Photo upload panel         | `components/profile/ProfilePictureUpload.jsx`     |
| Change password UI         | `components/profile/ChangePasswordCard.jsx`       |
| Summary stat cards         | `components/profile/ProfileSummaryCards.jsx`      |
