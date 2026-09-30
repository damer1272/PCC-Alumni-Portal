# PCC Alumni Portal — Figma Design Specification

Use this document together with `design-tokens.json` to recreate the app in Figma.

**Original Figma reference (if available):**  
https://www.figma.com/design/EURVJMenJyvIJvPoLhY4Tx/Set-background-image

---

## How to import into Figma

### Option A — Design tokens (recommended)
1. Install the **Tokens Studio for Figma** plugin.
2. Open a new Figma file.
3. In Tokens Studio → **Import** → select `figma/design-tokens.json`.
4. Apply tokens to color styles, text styles, and spacing variables.

### Option B — Live site capture
1. Run the app locally: `npm run dev` → http://localhost:5173
2. Install the **html.to.design** Figma plugin.
3. Capture each route listed below as a Figma frame.

### Option C — Manual build
Follow the screen inventory, layout, and component specs in this file.

---

## Frame sizes

| Breakpoint | Frame size   | Use for                          |
|------------|--------------|----------------------------------|
| Desktop    | 1440 × 900   | Dashboard, admin, register       |
| Tablet     | 768 × 1024   | Collapsed sidebar, login tablet  |
| Mobile     | 390 × 844    | Login bottom sheet, mobile nav   |

---

## Color palette (quick reference)

| Token            | Hex       | Usage                              |
|------------------|-----------|------------------------------------|
| Primary Navy     | `#1a3a6b` | Sidebar, buttons, avatars, links   |
| Primary Dark     | `#0d2850` | Button hover                       |
| Secondary Blue   | `#2d5a9e` | Gradients, chart bars              |
| Page Background  | `#f0f4f8` | App content area                   |
| Card White       | `#ffffff` | Cards, topbar                      |
| Cream Text       | `#F5F0E8` | Login / cinematic overlay text     |
| Input Background | `#f9fafb` | Form fields (gray-50)              |
| Border           | `#e5e7eb` | Inputs, dividers (gray-200)        |

### Gradients
- **Dashboard hero:** `linear-gradient(to right, #1a3a6b, #2d5a9e)`
- **Login overlay:** `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.3), rgba(0,0,0,0.55))`
- **Register sidebar:** `#0d1f3c` at 85% over campus photo

---

## Typography

| Role              | Font                 | Weight   | Size (desktop)     |
|-------------------|----------------------|----------|--------------------|
| Login hero        | Cormorant Garamond   | 400 italic | 60–72px          |
| UI body           | Inter                | 400      | 14px               |
| UI labels         | Inter                | 500      | 12–14px            |
| Page title        | Inter                | 700      | 20px               |
| Dashboard greeting| Inter                | 700      | 24px               |
| Register headline | Playfair Display     | 700      | 30px               |
| Nav uppercase     | Inter                | 500      | 10px, tracking 0.2em |

**Google Fonts URL:**  
`https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap`

---

## Layout system

### App shell (Alumni & Admin)
```
┌──────────────┬─────────────────────────────────────┐
│   Sidebar    │  Topbar (white, border-bottom)      │
│   240px      ├─────────────────────────────────────┤
│   #1a3a6b    │                                     │
│              │  Main content (#f0f4f8)             │
│              │  padding: 28px                      │
│              │                                     │
└──────────────┴─────────────────────────────────────┘
```

- **Sidebar expanded:** 240px wide, navy `#1a3a6b`
- **Sidebar collapsed:** 68px wide (icons only)
- **Topbar:** white, 1px border `#e5e7eb`, height ~56px
- **Content padding:** 20px mobile / 28px desktop
- **Card gap:** 16–24px between sections

### Sidebar nav item
- Padding: 12px 12px
- Border radius: 12px
- Active: `rgba(255,255,255,0.15)` background, white text
- Inactive: 60% white text, hover `rgba(255,255,255,0.10)`

---

## Component library

### Button — Primary
- Background: `#1a3a6b`
- Text: white, Inter 600, 14px
- Padding: 12px 24px
- Border radius: 12px
- Hover: `#0d2850`

### Button — Glass (login)
- Background: `rgba(255,255,255,0.15)`
- Border: 1px `rgba(255,255,255,0.25)`
- Text: `#F5F0E8`
- Border radius: 12px

### Input field
- Background: `#f9fafb`
- Border: 1px `#e5e7eb`
- Border radius: 12px
- Padding: 12px 16px
- Font: Inter 14px
- Focus ring: 2px `#1a3a6b` at 30% opacity

### Card
- Background: white
- Border: 1px `#f3f4f6`
- Border radius: 16px
- Shadow: `0 1px 2px rgba(0,0,0,0.05)`
- Padding: 20–24px

### Avatar
- Sizes: 32 / 36 / 80 / 96px
- Background: `#1a3a6b`
- Text: white initials, bold
- Border radius: 12px

### Badge — Status
- Padding: 4px 10px
- Border radius: 8px
- Font: 12px medium
- Employed: green-50 bg / green-700 text
- Unemployed: red-50 bg / red-700 text
- Self-Employed: blue-50 bg / blue-700 text
- Continuing Studies: purple-50 bg / purple-700 text

### Glass login panel
- Width: 380px (desktop), full-width bottom sheet (mobile)
- Background: `rgba(255,255,255,0.10)`
- Backdrop blur: 24px
- Border: 1px `rgba(255,255,255,0.20)`
- Border radius: 16px (desktop) / 16px top only (mobile)
- Shadow: xl

### Stat card (dashboard)
- White card, 16px radius
- Icon container: 40×40px, colored background (blue/green/purple/orange-50)
- Value: bold 24px
- Label: 12px gray-500

### Data table
- Header: gray-50 background, 12px uppercase semibold gray-500
- Row padding: 12px 24px
- Row hover: gray-50
- Divider: gray-100

---

## Screen inventory

### Public / Auth

| # | Screen            | Route               | Key elements                                      |
|---|-------------------|---------------------|---------------------------------------------------|
| 1 | Login (Cinematic) | `/`                 | Full-bleed campus photo, dark gradient overlay, hero text left, viewfinder frame center, glass login panel right/bottom, footer stats |
| 2 | Register          | `/register`         | Split: left navy panel (320px) + right white form |
| 3 | Forgot Password   | `/forgot-password`  | Centered card on blurred campus background        |

**Login hero copy:**
- Line 1: *Your Career* (Cormorant Garamond italic)
- Line 2: *Journey Starts Here*
- Subtext: Connect with fellow graduates…

**Login panel fields:** Email, Password, Remember me, Forgot password, Alumni/Admin toggle

**Register fields:** Student ID, Graduation Year, Full Name, Gender, Course, Email, Password, Confirm Password

**Courses (dropdown options):**
- Bachelor of Science in Information Technology (BSIT)
- Bachelor of Science in Criminology (BSCrim)
- Bachelor of Science in Accountancy (BSA)
- Bachelor of Science in Business Administration (BSBA)
- Bachelor of Elementary Education (BEEd)

---

### Alumni panel (`/alumni/*`)

| # | Screen            | Route                    | Key elements                           |
|---|-------------------|--------------------------|----------------------------------------|
| 4 | Dashboard         | `/alumni/dashboard`      | Gradient hero, 4 stat cards, quick actions grid, recent announcements |
| 5 | My Profile        | `/alumni/profile`        | Avatar card, personal info grid, social links |
| 6 | Edit Profile      | `/alumni/edit-profile`   | Avatar upload, form fields, social URLs |
| 7 | Career Tracking   | `/alumni/career`         | Employment history timeline, add form |
| 8 | Alumni Directory  | `/alumni/directory`      | Search, filters, alumni card grid      |
| 9 | Announcements     | `/alumni/announcements`  | Announcement cards list                |

**Alumni sidebar nav:**
- Dashboard
- My Profile
- Career Tracking
- Alumni Directory
- Announcements

---

### Admin panel (`/admin/*`)

| # | Screen               | Route                       | Key elements                          |
|---|----------------------|-----------------------------|---------------------------------------|
| 10 | Dashboard           | `/admin/dashboard`          | 5 stat cards, pie chart (employment), bar chart (graduates per course), bar chart (batch year), recent registrations table |
| 11 | Manage Alumni       | `/admin/alumni`             | Search, filters, alumni data table    |
| 12 | Manage Announcements| `/admin/announcements`      | CRUD table + modal form               |
| 13 | Reports             | `/admin/reports`            | 4 charts: employment pie, company bar, course bar, year bar |
| 14 | User Management     | `/admin/users`              | Users table with activate/delete actions |

**Admin sidebar nav:**
- Dashboard
- Manage Alumni
- Announcements
- Reports
- User Management

**Graduates per course chart labels:**
- BSIT, BSCrim, BSA, BSBA, BEEd

---

## Assets needed in Figma

| Asset            | Location in project        | Notes                          |
|------------------|----------------------------|--------------------------------|
| Campus background| `src/imports/bg.png`       | Login, register, forgot password |
| Graduation cap   | Lucide icon                | Brand icon in sidebar          |
| UI icons         | Lucide React               | 16–20px stroke icons           |

---

## Suggested Figma page structure

```
📄 Cover
📄 Design Tokens
📄 Components
   ├── Buttons
   ├── Inputs
   ├── Cards
   ├── Badges
   ├── Sidebar
   ├── Topbar
   ├── Tables
   └── Charts
📄 Auth
   ├── Login — Desktop
   ├── Login — Mobile
   ├── Register
   └── Forgot Password
📄 Alumni
   ├── Dashboard
   ├── Profile
   ├── Edit Profile
   ├── Career Tracking
   ├── Directory
   └── Announcements
📄 Admin
   ├── Dashboard
   ├── Manage Alumni
   ├── Announcements
   ├── Reports
   └── User Management
```

---

## Institution details

- **App name:** Alumni Career Portal / PCC Alumni Portal
- **Institution:** Pagadian Capitol College, Inc.
- **Tagline:** Alumni Career Tracking and Networking Portal
