
# Yogitrack

YogiTrack is a full-stack web application built to help manage the day-to-day operations of a yoga studio. This project was developed for Yoga H’om to replace manual tracking methods with a centralized, web-based system.

The application allows staff to manage instructors, customers, class packages, class schedules, sales, attendance, and reports all in one place.

---

## Project Purpose
The goal of this project is to improve efficiency and organization within a yoga studio by:
- Reducing manual record-keeping
- Automating class scheduling and attendance tracking
- Providing quick access to reports and customer information

*This project was created as part of a Software Development for the Worldwide Web course.*

---

---

## Technologies Used

- MongoDB Atlas (Database)
- Express.js (Backend framework)
- React (Frontend)
- Node.js (Server runtime)
- Axios (API requests)
- Vite (Frontend tooling)
- CSS (Styling)

---

## Features

### Instructor Management
- Add, edit, and delete instructors
- View all instructors in the system

### Customer Management
- Add, edit, and delete customers
- Track customer class balances

### Package Management
- Create and manage class packages
- Define pricing, category, and validity dates

### Class Management
- Schedule classes with assigned instructors
- Prevent schedule conflicts (same day/time)

### Sales Management
- Record package purchases
- Automatically update customer class balances
- Auto-fill package pricing

### Attendance Management
- Record attendance for scheduled classes
- Automatically assign instructor from class
- Reduce customer balance after attendance
- Display warnings for:
  - low or negative balances
  - invalid or missing packages
  - date mismatches

### Reports
- Package Sales Report
- Instructor Performance Report
- Customer Status Report
- Teacher Payment Report

### Dashboard
- Central landing page
- Clickable navigation cards
- Integrated Yoga H’om branding

---

## Project Structure
yogitrack/
client/
public/
src/
pages/
App.jsx
main.jsx
index.css
server/
models/
routes/
server.js
.env
README.md

---

## Installation & Setup

### 1. Open the Project

Open the `yogitrack` folder in VS Code or your preferred IDE.

---

### 2. Install Backend Dependencies

Open a terminal and run:

```
cd server
npm install
```

---

### 3. Install Frontend Dependencies

Open a terminal and run:

```
cd client
npm install
```

---

#### Environment Variables:

Create a .env file inside the server folder with the following:

```
MONGO_URI=<your_mongodb_connection_string>
PORT=5000
```

*This project uses MongoDB Atlas for the database connection.*

---

### 4. Running the Application

#### Start the backend

In a terminal:

```
cd server
node server.js
```

Expected Output: 

```
MongoDB connected
Server is running on port 5000
```


#### Start the frontend

In a SEPARATE terminal:

```
cd client
npm run dev
```

Open the provided URL in your browser:

Example: http://localhost:5173

---

## Business Rules Implemented:

- Only one class can exist at a specific day and time (schedule conflict prevention)
- Customer balances increase when a package is purchased
- Customer balances decrease when attendance is recorded
- Negative balances are allowed but displayed with warnings
- Package validity dates are considered when checking attendance
- Class type and package type are compared for compatibility warnings
- Attendance date should align with scheduled class day (warning displayed)

---

## Testing Notes:

- API testing (Postman)
- Frontend form submissions
- Data validation and error handling
- Each major section (Instructors, Customers, Packages, Classes, Sales, Attendance, Reports) was tested for:
- Create/Read/Update/Delete (where applicable)

## Future Improvements:

Some potential enhancements for the future include:

- Automatic ID generation
- User authentication and login system
- Role-based access (admin vs staff)
- Improved report visualizations (charts/graphs)
- Deployment to a cloud platform
- Mobile responsiveness improvements

### Author Information:
Name: Lane Hodge

Project Course: Software Development for the Worldwide Web

Term: Spring 2026

*This project was developed as part of a graduate-level coursework project focused on full-stack web development using the MERN stack.
It reflects beginner to intermediate-level experience in building a complete web application, including backend APIs, database integration, and frontend UI development.*