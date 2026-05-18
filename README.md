# HRMS System — Full-Stack Human Resource Management

A full-stack Human Resource Management System built with React + Vite (frontend) and Node.js + Express + MongoDB (backend), featuring role-based access control for Admin, HR, and Employee roles.

---

## Live Demo

🚀 **Netlify Live Link:** https://myhrms123.netlify.app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router DOM v6 |
| HTTP Client | Axios (with JWT auto-attach) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |

---

## Project Structure

```
hrms-system/
├── backend/
│   ├── config/db.js              ← MongoDB connection
│   ├── controllers/              ← Business logic (8 controllers)
│   ├── middleware/authMiddleware.js  ← JWT verify + role guard
│   ├── models/                   ← Mongoose schemas (11 models)
│   ├── routes/                   ← Express routers (8 route files)
│   └── server.js                 ← Entry point
└── frontend/
    ├── src/
    │   ├── api/                  ← Axios wrappers (8 modules)
    │   ├── components/           ← 42 reusable UI components
    │   ├── context/AuthContext.jsx  ← Global auth state
    │   └── pages/                ← 59 page components
    └── vite.config.js
```

---

## Quick Start

### Prerequisites

Make sure MongoDB is running:

```bash
# Windows
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Linux
sudo systemctl start mongod
```

Or use **MongoDB Atlas** — update `MONGO_URI` in `.env` with your Atlas connection string.

### Step 1 — Backend

```bash
cd hrms-system/backend
npm install
npm run dev        # starts with nodemon on http://localhost:5000
```

### Step 2 — Frontend

```bash
cd hrms-system/frontend
npm install
npm run dev        # starts Vite on http://localhost:5173
```

---

## Environment Variables

### `backend/.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/hrms-system
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

### `frontend/.env`
```
VITE_API_URL=http://localhost:5000/api
```

> Never commit `.env` files to Git.

---

## Roles

| Role | Access |
|------|--------|
| `admin` | Full access to everything |
| `hr` | All HR operations except admin-only deletes |
| `employee` | Own data only (attendance, leaves, payslips, goals) |

---

## What's Been Built

### Authentication
- Register with role selection (admin / hr / employee)
- Login returns a signed JWT stored in `localStorage`
- `authMiddleware.js` — verifies token and attaches `req.user`
- `authorizeRoles()` — middleware factory for role-based route guards
- Protected routes in the frontend redirect to login if unauthenticated

### Employee Management
- Full CRUD: create, view, edit, delete employees
- Fields: personal info, contact, department, designation, employment type, salary, emergency contact
- Search, filter (department / status / type), and pagination
- Stats: total, active, inactive, terminated, full-time, interns, per-department breakdown
- Unique constraints on email and employee ID

### Department Management
- Full CRUD with search and filter
- Department head assignment (ref to Employee)
- Employee count tracking per department
- Prevents deletion if employees are still assigned

### Attendance Tracking
- Mark attendance for a single employee or bulk (multiple employees at once)
- Statuses: present, absent, half-day, leave, holiday
- Check-in / check-out time recording
- Monthly attendance summary for each employee
- Stats by date (present/absent/half-day counts)
- Employee self-view (`/my-attendance`)

### Leave Management
- Six leave types: casual, sick, earned, maternity, paternity, unpaid
- Leave balance tracking per employee per year
- Overlap detection (can't apply two leaves on the same dates)
- Auto-calculation of total leave days
- Admin / HR approval workflow (approve / reject with comment)
- Employee self-service: apply, view status, cancel
- Admin can update leave balances manually

### Payroll
- Generate payroll for a single employee or bulk
- Earnings: basic salary, HRA, allowances, bonus
- Deductions: tax, provident fund, insurance, other deductions
- Auto-calculated: gross salary, total deductions, net salary
- Loss of pay calculation based on unpaid leave days
- Payment status tracking: pending / paid / failed
- Employee self-view of payslips (`/my-payslips`)

### Performance Management
- **Goals**: create, assign to employees, track progress (0–100%), score (0–10), priority, category
- **Reviews**: create performance reviews, star ratings, reviewer assignment, status workflow
- Employee self-view of own goals and reviews (`/my-performance`)
- Stats: goal completion rates, review counts

### Recruitment Pipeline
- **Job Openings**: create, manage status (open / closed / on-hold), set priority, track opening count
- **Candidates**: add candidates to job openings, track through pipeline stages
- Candidate profile: experience, skills, qualification, ratings, notes
- Stage tracking for each candidate across the hiring pipeline
- Candidate count per job opening

### Dashboards
- **Admin Dashboard** — stats for employees, departments, attendance, leaves, payroll
- **HR Dashboard** — HR-relevant stats and quick actions
- **Employee Dashboard** — self-service quick links (mark attendance, apply leave, view payslips)

### UI / UX
- Dark theme with Tailwind CSS
- Responsive layout (mobile, tablet, desktop)
- Role-based sidebar navigation (shows only relevant links per role)
- Loading spinners and empty states
- Confirmation modals for all destructive actions
- Status badges with color coding for all entities

---

## API Overview

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Auth | Get current user |

### Employees — `/api/employees`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/employees/stats` | Admin / HR |
| GET | `/api/employees` | Admin / HR |
| POST | `/api/employees` | Admin / HR |
| GET | `/api/employees/:id` | Admin / HR |
| PUT | `/api/employees/:id` | Admin / HR |
| DELETE | `/api/employees/:id` | Admin only |

### Departments — `/api/departments`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/departments/stats` | Admin / HR |
| GET | `/api/departments` | Admin / HR |
| POST | `/api/departments` | Admin / HR |
| GET | `/api/departments/:id` | Admin / HR |
| PUT | `/api/departments/:id` | Admin / HR |
| DELETE | `/api/departments/:id` | Admin only |

### Attendance — `/api/attendance`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/attendance/stats` | Admin / HR |
| GET | `/api/attendance/my` | All roles |
| POST | `/api/attendance/bulk` | Admin / HR |
| GET | `/api/attendance/employee/:id` | Admin / HR |
| GET / POST | `/api/attendance` | Admin / HR |
| GET / PUT / DELETE | `/api/attendance/:id` | Admin / HR |

### Leaves — `/api/leaves`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/leaves/stats` | Admin / HR |
| GET | `/api/leaves/my` | All roles |
| GET | `/api/leaves/my/balance` | All roles |
| GET / PUT | `/api/leaves/balance/:id` | Admin |
| GET / POST | `/api/leaves` | Admin / HR |
| PUT | `/api/leaves/:id/status` | Admin / HR |
| PUT | `/api/leaves/:id/cancel` | All roles |

### Payroll — `/api/payroll`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/payroll/my` | All roles |
| POST | `/api/payroll/bulk` | Admin / HR |
| GET / POST | `/api/payroll` | Admin / HR |
| GET / PUT / DELETE | `/api/payroll/:id` | Admin / HR |
| PUT | `/api/payroll/:id/status` | Admin / HR |

### Performance — `/api/performance`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/performance/my-goals` | All roles |
| GET / POST | `/api/performance/goals` | Admin / HR |
| PUT | `/api/performance/goals/:id/progress` | All roles |
| GET | `/api/performance/my-reviews` | All roles |
| GET / POST | `/api/performance/reviews` | Admin / HR |
| PUT | `/api/performance/reviews/:id/status` | Admin / HR |

### Recruitment — `/api/recruitment`
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/recruitment/stats` | Admin / HR |
| GET / POST | `/api/recruitment/jobs` | Admin / HR |
| PUT | `/api/recruitment/jobs/:id/status` | Admin / HR |
| GET / POST | `/api/recruitment/candidates` | Admin / HR |
| PUT | `/api/recruitment/candidates/:id/stage` | Admin / HR |

---

## What Still Needs to Be Done

### High Priority
- [ ] **Email notifications** — no email service is wired up; the system has no transactional emails (leave approval, payroll generated, account created). Needs Nodemailer + SMTP or a service like SendGrid.
- [ ] **File / attachment uploads** — leave requests support an `attachment` field in the schema but there is no file upload implementation (no Multer, no storage). Resume uploads for recruitment candidates are also missing.
- [ ] **Profile picture upload** — User and Employee models are ready but the upload endpoint and frontend form do not exist yet.
- [ ] **Input validation on the backend** — controllers rely on Mongoose validation but have no explicit request-body validation layer (e.g., express-validator or Joi). Malformed requests can reach the DB.

### Medium Priority
- [ ] **Testing** — zero unit or integration tests. Recommend Jest + Supertest for the backend and React Testing Library for the frontend.
- [ ] **API documentation** — no Swagger / OpenAPI spec or Postman collection. Should be generated from routes.
- [ ] **Audit log** — models store `createdBy` / `updatedBy` but there is no dedicated audit trail view or log endpoint.
- [ ] **Forgot password / reset password flow** — no password reset via email exists.
- [ ] **Calendar view** — attendance and leave data would benefit from a monthly calendar UI instead of just tables.
- [ ] **Export to PDF / Excel** — payslips, attendance reports, and leave reports have no export functionality.
- [ ] **In-app notifications** — no notification bell / notification center. Approvals, rejections, and reminders are silent on the frontend.

### Low Priority / Nice to Have
- [ ] **Docker / docker-compose** — no containerization for easy deployment.
- [ ] **Rate limiting** — no `express-rate-limit` on auth routes (brute-force risk).
- [ ] **Refresh tokens** — JWT expires after 7 days with no refresh mechanism; users get silently logged out.
- [ ] **Training & development module** — not implemented (common HRMS feature).
- [ ] **Asset / equipment tracking** — not implemented.
- [ ] **Org chart view** — visual hierarchy of departments and employees.
- [ ] **Mobile app** — currently web-only.

---

## How Authentication Works

```
1. User registers → POST /api/auth/register
   → Password hashed with bcryptjs → Saved to MongoDB

2. User logs in → POST /api/auth/login
   → Password compared → JWT signed → Returned to frontend

3. Frontend stores token in localStorage
   → axios.js attaches it as "Authorization: Bearer <token>" on every request

4. Protected backend routes run protect middleware
   → Valid token → req.user attached → proceeds
   → Invalid/missing → 401 Unauthorized

5. Role-restricted routes also run authorizeRoles(...roles)
   → req.user.role not in allowed list → 403 Forbidden
```
