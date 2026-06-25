# Food Discovery Platform by CodeCuisine

## Team Members

* Liu Yuqi
* Zhu Penglong

---

## Project Description

CodeCuisine is a food discovery platform designed to help users find reliable and high-quality restaurant recommendations.

Unlike traditional review platforms that rely heavily on simple star ratings, CodeCuisine focuses on review credibility through proof-of-dine verification and multi-dimensional review metrics.

Users can:

* Register and log in securely
* Create multi-dimensional food reviews
* Submit proof-of-dine verification
* Upload food and restaurant images
* Browse community reviews and discover new restaurants
* Search and filter restaurants dynamically
* Evaluate review by its dining verification

Future versions will allow users to:

* Like and comment on reviews
* Save favorite restaurants to a personal wishlist
* Evaluate review by its Quality & Trust Score

---

## Motivation

Many food review platforms suffer from unreliable ratings, fake reviews, and limited review depth.

CodeCuisine aims to provide a more trustworthy and informative food discovery experience by introducing:

* Multi-dimensional rating systems
* Proof-of-dine verification
* Review quality assessment
* Personalized quick-saved wishlist
* Dynamic search & filter system

---

## Tech Stack

### Frontend

* React + TypeScript
* Vite development environment
* Component-based architecture
* React Router for client-side routing
* Context API for global authentication state management
* Axios for API communication

### Backend

* Golang
* Gin for HTTP web frame
* Gorm for connecting and operating database
* JWT
* bcrypt for password encryption and verification

### Database

* MySQL for database

---

## Installation

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
npm install
go run main.go
```

---

## Key Features

### User Authentication

* User registration and login
* JWT-based authentication
* Protected routes

### Multi-Dimensional Reviews

Users can rate restaurants across multiple categories, including:

* Taste
* Value
* Ambience

### Proof-of-Dine Verification

Users can upload supporting evidence of their dining experience to improve review credibility.

### Restaurant Discovery

Browse reviews and discover restaurants through community-generated content.

---

## Current Progress

### Milestone 2

Completed:

* User Authentication
* Protected Routes
* Review Creation
* Basic Frontend Interface
* Review Submission Workflow
* Image Upload Functionality
* Dynamic Search & Filter Feed
* dining verification
* ............

### Planned for Future Milestones

* Quick-Save Wishlist
* Review Quality & Trust Scoring

---

## Project Structure

```text
frontend/
├── src/
│   ├── pages/
│   ├── components/
│   ├── context/
│   ├── services/
│   ├── api/
|   └──types/

backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   ├── database/
│   │   └── database.go
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── review.go
│   │   └── verification.go
│   ├── middleware/
│   │   └── auth.go
│   └── models/
│       ├── user.go
│       ├── restaurant.go
│       ├── review.go
│       ├── verification.go
│       └── photo.go
├── pkg/
│   └── utils/
│       └── jwt.go
└── go.mod
```

---

## Future Features

* Quick-Save Wishlist
* Review Quality & Trust Scoring

---

## Screenshots
* Login Page
  
  <img width="788" height="400" alt="image" src="https://github.com/user-attachments/assets/5bb9b4de-bf78-4bdf-bcf9-67e9177bf57a" />
  Users can log in using their registered credentials.

* Register Page
  <img width="815" height="427" alt="image" src="https://github.com/user-attachments/assets/ba15684a-c6c1-46ee-afe5-5894b56a3192" />
  New users can create an account through the registration form.

* Profile Page
  <img width="769" height="457" alt="image" src="https://github.com/user-attachments/assets/b393e174-ee97-4fb3-b9e7-137641e5111d" />
  Displays authenticated user information and account details.

* Review Page
  <img width="1274" height="1120" alt="image" src="https://github.com/user-attachments/assets/5e78ff0c-8c81-4d63-aec2-77443689fe7a" />
  Users can create food reviews, provide multi-dimensional ratings, and upload images as proof of their dining experience.
  And the review will also showcase whether it is verified.

* Dynamic Search & Filter Page
  <img width="1220" height="884" alt="image" src="https://github.com/user-attachments/assets/c0e263b5-80ae-4adc-8447-526634e96ed0" />
  Users can search for restaunt reviews, and filter the results by "verified only" / "minimum rating".


More screenshots will be added in future milestones.
