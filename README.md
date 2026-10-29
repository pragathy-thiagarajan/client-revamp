# EforEvent – Event Management System

**EforEvent** is a modern, full-stack Event Management Platform designed to streamline the lifecycle of discovering, booking, hosting, and moderating live experiences, conferences, festivals, and workshops.

The application enforces a strict, transparent **Role-Based Access Control (RBAC)** architecture catering to three distinct user personas: **Attendees (Users)**, **Event Organizers**, and **Platform Administrators**.

---

## 🔑 Demo Credentials

Use any of the verified accounts below to evaluate the features for each role:

| Role | Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Attendee / User** | `eforeventuser@yopmail.com` | `123456` | Discovers events, books tickets, accesses passes, reviews events, submits inquiries |
| **Event Organizer** | `eforeventorg@yopmail.com` | `123456` | Uploads event banners, configures schedules & tickets, tracks sales analytics & attendees |
| **Administrator** | `pragathyt95@gmail.com` | `123456` | Approves/rejects events, audits platform bookings, moderates users & reviews, manages support |

*(Convenience test aliases: `user@example.com`, `organizer@example.com`, and `admin@example.com` with password `123456` are also supported, alongside 1-click quick-fill buttons on the login page).*

---

## 🛡️ Role-Based Access Control (RBAC) Specification

| Feature / Capability | Attendee (`user`) | Organizer (`organizer`) | Admin (`admin`) |
| :--- | :---: | :---: | :---: |
| Browse public approved events | ✅ | ✅ | ✅ |
| Filter events (category, date, price, location) | ✅ | ✅ | ✅ |
| **Book & Purchase Tickets** | ✅ | ❌ *(Role restricted)* | ❌ *(Role restricted)* |
| Access ticket passes & QR codes | ✅ | ❌ | ❌ |
| Transfer & Cancel bookings | ✅ | ❌ | ❌ |
| Submit event feedback & reviews | ✅ | ❌ | ❌ |
| Submit user support inquiries | ✅ | ❌ | ❌ |
| **Create & publish events (with banner upload)** | ❌ | ✅ | ❌ |
| Edit owned events & manage schedules | ❌ | ✅ | ❌ |
| View event attendee list & check-in | ❌ | ✅ | ❌ |
| View ticket sales & revenue analytics | ❌ | ✅ | ❌ |
| **Approve / Reject submitted events** | ❌ | ❌ | ✅ |
| Manage all registered user accounts & roles | ❌ | ❌ | ✅ |
| Audit all platform bookings & payments | ❌ | ❌ | ✅ |
| Review attendee feedback reports | ❌ | ❌ | ✅ |
| Answer & resolve support inquiries | ❌ | ❌ | ✅ |

> **Note on RBAC:** Booking tickets and purchasing admission is reserved strictly for Attendee accounts. Organizers and Administrators have dedicated management dashboards and consoles; they cannot purchase tickets for events.

---

## 🗺️ Application Routes

The application features clean, standardized routes for every section:

### Core & Navigation
- `/` – Landing page with featured events and quick role entry points
- `/dashboard` – Smart role-aware redirect (routes to `/bookings`, `/organizer/dashboard`, or `/admin/dashboard`)
- `/login` – Authentication portal with 1-click demo account presets
- `/register` – Public account registration with prominent Attendee vs. Organizer role selector cards (`/register?role=organizer`)

### Attendee & Events
- `/events` – Event discovery catalog with search and multi-facet filtering
- `/events/:id` – Detailed event briefing with media, schedule timeline, and reviews
- `/events/:id/book` (or `/booking/:id`) – Ticket selection and booking flow *(Attendee only)*
- `/bookings` (or `/my-bookings`) – Attendee booking history and ticket management
- `/bookings/:id` – Booking status, breakdown, and ticket transfer module
- `/bookings/:id/payment` – Secure payment checkout (with instant test payment support)
- `/bookings/:id/ticket` – Digital boarding-pass style ticket with QR code and printable voucher
- `/events/:eventId/feedback` – Attendee event rating and feedback submission
- `/support` – Attendee support helpdesk and query submission

### Organizer Console
- `/organizer` (or `/organizer/dashboard`) – Organizer executive overview with event and sales stats
- `/organizer/events` – List of organizer's events with status badges
- `/organizer/events/create` – Event creation with direct image file upload and schedule builder
- `/organizer/events/:id/edit` – Event editing and ticket configuration
- `/organizer/events/:eventId/attendees` – Attendee roster and check-in scanner
- `/organizer/analytics` – Recharts-powered ticket sales and revenue performance charts

### Administrator Console
- `/admin` (or `/admin/dashboard`) – Platform-wide operational dashboard
- `/admin/events` – Event moderation queue to approve or reject organizer submissions
- `/admin/users` – User management to update roles or account status (active/blocked)
- `/admin/bookings` – Platform transaction log and booking auditor
- `/admin/support` – Inquiry ticketing system with response editor
- `/admin/feedback` – Attendee satisfaction analytics and rating breakdown

---

## 🌟 Key Functional Highlights

1. **Direct Image Upload for Organizers**:
   Organizers can upload banner images directly from their device (with automatic client-side compression), drag-and-drop images, paste remote URLs, or select from curated event presets.
2. **Digital Boarding Pass Tickets**:
   Designed like modern boarding vouchers featuring scannable QR codes, barcode reference codes, calendar date blocks, perforated tear-off stubs, and print options.
3. **Attendee Reviews & Rating Engine**:
   Interactive 5-star rating system, recommendation metric, and key highlight badges (e.g. Inspiring Keynotes, Venue Quality, Networking).
4. **Resilient Local Mock & Hybrid Remote Backend**:
   Out of the box, the client includes an in-browser mock and `localStorage` persistence layer that enables full evaluation without external backend dependencies, while automatically proxying to `VITE_API_URL` when a remote server is connected.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Data Visualization**: Recharts
- **HTTP Client**: Axios with smart standalone adapter
- **Build Tool**: Vite 8

---

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/pragathy-thiagarajan/client-updated.git

# Install dependencies
npm install

# Start the dev server on port 3000
npm run dev
```

Visit `http://localhost:3000` to access the application.