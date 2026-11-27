# SoftroniicsSMS — Student & Intern Management System

A full-stack **Student & Intern Management System** built with the **MERN** stack (MongoDB, Express.js, React, Node.js) and **Vite**. It provides separate, role-based portals for **Administrators / Staff** and **Interns** to manage courses, batches, schedules, tasks, materials, attendance, evaluations, and notifications.

---

## Key Features

### Admin & Staff Portal
- **Dashboard & Analytics**: Live KPIs (Total Courses, Total Interns, Active Batches, Total Staff), course filtering, weekly task activity summary, and upcoming test/evaluation cards.
- **Role-Based Access Control (RBAC)**: Create custom roles with granular page- and action-level permissions.
- **Staff & Mentor Management**: Manage staff profiles, multi-branch assignments, mentor designations, and available timings.
- **Intern Management**: Full student lifecycle management with auto-generated, immutable unique Intern IDs (`INT-YYYY-XXXX`), search/filtering, CSV export, and document uploads (photo & resume).
- **Course & Syllabus Management**: Organize Categories, Courses, Modules, and Topics.
- **Batch & Schedule Management**: Configure branches, batches, timings, mentor batch assignments, and weekly schedules.
- **Tasks & Study Materials**: Assign tasks to batches/individuals, evaluate submissions with marks and feedback, and share downloadable/viewable study materials.
- **Attendance & Leave Requests**: Mark daily student attendance, view monthly attendance reports, and approve/reject intern leave requests.
- **Notifications**: Send targeted announcements by branch, batch, or audience.

### Intern Portal
- **Weekly Schedule**: View assigned weekly sessions and topics.
- **Weekly & Monthly Evaluation Cards**: Track test scores, project scores, soft skills, aptitude, technical, logical, communication ratings, and attendance percentages.
- **Tasks & Materials**: View assigned tasks, submit work, and access/download course materials.
- **Attendance & Leave**: Monitor personal attendance records and submit leave requests.
- **Notifications**: Receive real-time updates and announcements from admins and mentors.

---

## Tech Stack

- **Frontend**: React, Vite, React Router, Axios, React Icons, Lucide React
- **Backend**: Node.js, Express.js, Mongoose (MongoDB), JSON Web Tokens (JWT), bcrypt / bcryptjs, Multer
- **Database**: MongoDB

---

## Project Structure

```text
SoftroniicsSMS/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Shared UI components & layouts (Adminlayout, Internlayout, Loader, Toast)
│   │   ├── hooks/              # Custom hooks (permission checks)
│   │   ├── pages/
│   │   │   ├── Register/       # Login page
│   │   │   ├── admin/          # Admin modules (Dashboard, Administration, Course, Syllabus, Schedule, Tasks, Attendance, Settings)
│   │   │   └── intern/         # Intern portal pages (WeeklySchedule, WeeklyCard, MonthlyCard, Tasks, Attendance, Notifications)
│   │   └── services/           # Axios API service layers (AdminService, UserService)
│   └── package.json
├── server/                     # Express + MongoDB backend
│   ├── Config/                 # Database connection
│   ├── Controllers/            # Route handlers & business logic
│   ├── Middleware/             # Auth & upload middleware
│   ├── Models/                 # Mongoose schemas
│   ├── Routes/                 # Express API route definitions
│   ├── Index.js                # Server entry point
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm**
- **MongoDB** (local instance or MongoDB Atlas cluster)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd SoftroniicsSMS
```

### 2. Configure Environment Variables

Create a `.env` file inside the `server/` directory (`server/.env`) with your own configuration values. **Never commit `.env` files or real credentials to version control.**

```env
PORT=7000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Install Dependencies

Install dependencies for both the backend and frontend:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Run the Application

Open two terminals:

**Terminal 1 — Start the Backend Server**
```bash
cd server
npm run dev
```

**Terminal 2 — Start the Frontend Dev Server**
```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend API on `http://localhost:7000` (or the `PORT` specified in `server/.env`).

---

## Available Scripts

### Server (`server/`)
- `npm run dev` — Start the Express server with `nodemon`
- `npm start` — Start the Express server with `node Index.js`

### Client (`client/`)
- `npm run dev` — Start the Vite development server
- `npm run build` — Build the production bundle into `client/dist`
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run linter checks

---

## API Overview

Base routes mounted in `server/Index.js`:

| Route Prefix | Description |
| :--- | :--- |
| `/auth` | Authentication & current user profile |
| `/Rolemanagement` | Roles & permissions |
| `/staffmanagement` | Staff & mentor records |
| `/internmanagement` | Intern enrollment & profiles |
| `/branchmanagement` | Branch locations |
| `/batchmanagement` | Student batches |
| `/mentorbatches` | Mentor-to-batch assignments |
| `/timemanagement` | Class timings |
| `/weeklyschedule` | Admin weekly schedules |
| `/internschedule` | Intern schedule & weekly cards |
| `/internmonthlycard` | Intern monthly evaluation cards |
| `/categorymanagement` | Course categories |
| `/coursemanagement` | Courses |
| `/modulemanagement` | Course modules |
| `/topicmanagement` | Module topics |
| `/taskmanagement` | Tasks & submissions |
| `/materialmanagement` | Study materials |
| `/attendancemanagement` | Daily attendance & reports |
| `/leaverequestmanagement` | Intern leave requests |
| `/notificationmanagement` | Announcements & notifications |

---

## Security Notes

- Ensure `.env` files are excluded via `.gitignore` before pushing to GitHub.
- Use a strong, random `JWT_SECRET` in production.
- Rotate any database or API credentials immediately if they were ever exposed locally or in git history.
