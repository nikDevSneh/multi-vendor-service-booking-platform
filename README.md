# 🚀 ServiceHub — Multi-Vendor Service Booking Platform

ServiceHub is a full-stack web application that connects customers with service providers through an online service discovery and booking platform.

Customers can browse available services and book time slots, vendors can manage their services and bookings, and administrators can manage the overall platform.

---

## ✨ Features

### 👤 Customer

- Register and login
- Browse available services
- View service details
- Book services for future time slots
- View booking history
- Cancel bookings
- Track booking status

### 🏪 Vendor

- Vendor authentication
- Create and manage vendor profile
- Create service listings
- Edit service listings
- Delete services
- View customer bookings
- Confirm or complete bookings

### 👨‍💼 Admin

- Admin authentication
- Dashboard statistics
- Manage users
- Manage services
- Manage bookings
- Update booking status
- Delete users, services and bookings

---

## 🔐 Security

ServiceHub uses:

- JWT authentication
- Spring Security
- Role-based authorization
- BCrypt password hashing
- Protected REST APIs
- Environment variables for sensitive configuration
- Booking ownership authorization
- Vendor service ownership authorization

### User Roles

```text
CUSTOMER
VENDOR
ADMIN

🏗️ System Architecture
                  ┌─────────────────────┐
                  │    React Frontend   │
                  │      + Vite         │
                  └──────────┬──────────┘
                             │
                           Axios
                             │
                             ▼
                  ┌─────────────────────┐
                  │   Spring Boot REST  │
                  │        APIs         │
                  └──────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        Spring Security   Service Layer   Controllers
              │              │
             JWT             │
                             ▼
                    Spring Data JPA
                             │
                             ▼
                     ┌─────────────┐
                     │ PostgreSQL  │
                     └─────────────┘
📁 Project Structure

multi-vendor-service-booking-platform/
│
├── backend/
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   │   └── booking_platform/
│       │   │       ├── controller/
│       │   │       ├── dto/
│       │   │       ├── entity/
│       │   │       ├── exception/
│       │   │       ├── repository/
│       │   │       ├── security/
│       │   │       └── service/
│       │   └── resources/
│       │       └── application.properties
│       │
│       └── test/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── api.js
│       └── main.jsx
│
├── .gitignore
├── .gitattributes
└── test.http

