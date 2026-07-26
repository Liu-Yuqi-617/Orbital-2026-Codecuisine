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
* Evaluate review by its Quality & Trust Score
* Add your favorite restaurants into Quick-save wishlist

---

## Motivation

Many food review platforms suffer from unreliable ratings, fake reviews, and limited review depth.

CodeCuisine aims to provide a more trustworthy and informative food discovery experience by introducing:

* Multi-dimensional rating systems
* Proof-of-dine verification
* Review quality assessment
* Personalized quick-saved wishlist
* Dynamic search & filter system
* Review quality & trust scoring

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

## 🚀 Core Features

## 1. User Authentication

FoodTrust provides a secure user management system.

### User Registration

<img width="2198" height="1311" alt="屏幕截图 2026-07-21 103504" src="https://github.com/user-attachments/assets/9f956b90-3d6d-42d2-b9fd-1bb6841c45d9" />

Users can create accounts by providing:
- Username
- Email address
- Password
- Password confirmation

The registration system ensures:
- Complete user information
- Valid email format
- Secure password requirements
- Correct password confirmation

### User Login
Registered users can securely access personalized features.

<img width="2007" height="1297" alt="屏幕截图 2026-07-21 103449" src="https://github.com/user-attachments/assets/f62939f7-792d-4401-9950-94c1d243abbc" />

After login, users can:
- Submit restaurant reviews
- Track review history
- View personal trust scores
- Manage account information

---

# 2. Multi-Dimensional Restaurant Review System

FoodTrust provides a structured restaurant review experience by allowing users to evaluate restaurants from different perspectives.

## Rating Categories

<img width="2216" height="1324" alt="屏幕截图 2026-07-21 103523" src="https://github.com/user-attachments/assets/0f66c398-3654-4609-88e6-5c0e6f615fe6" />

<img width="1461" height="731" alt="屏幕截图 2026-07-21 103603" src="https://github.com/user-attachments/assets/3dad22e6-ea59-4fcd-aa41-6292a6fdb84a" />

### 🍜 Taste Rating
Evaluates food quality and flavor:
- Food quality
- Freshness
- Cooking style
- Flavor balance

### 💰 Value Rating
Evaluates price-performance:
- Portion size
- Price fairness
- Overall cost performance

### 🌿 Ambiance Rating
Evaluates dining environment:
- Cleanliness
- Atmosphere
- Interior design
- Dining comfort

## Review Content

Users can provide:
- Review title
- Detailed description
- Restaurant information
- Dining experience

This helps users understand both numerical ratings and personal experiences.

---

# 3. Review Verification System

FoodTrust improves review reliability by allowing users to verify their dining experiences.

## Receipt Verification

<img width="1507" height="926" alt="屏幕截图 2026-07-21 103550" src="https://github.com/user-attachments/assets/afb0a785-e275-4773-9b08-bdee92854334" />

Users can upload receipt images as proof of dining.

Supported verification information:
- Receipt images
- Verification status
- Verification type

## Verification Labels

Reviews are categorized as:

✅ **Verified Review**
- Supported by valid proof of dining experience

⚪ **Unverified Review**
- No supporting evidence provided

Verification allows users to distinguish between personal opinions and confirmed experiences.

---

# 4. Reviewer Trust Scoring System

<img width="2020" height="500" alt="屏幕截图 2026-07-21 103611" src="https://github.com/user-attachments/assets/9e5b4abc-bbc9-4426-902b-3f8a79f715b1" />


FoodTrust introduces a credibility system to evaluate reviewer reliability.

Each user receives a:

**Trust Score (0-100)**

Higher scores represent more trustworthy reviewers.

## Trust Levels

| Trust Score | Level |
|-------------|-------|
| 80-100 | Expert Critic |
| 60-79 | Trusted Reviewer |
| 40-59 | Regular User |
| 0-39 | Newcomer |

## Improving Trust Score

<img width="1346" height="381" alt="屏幕截图 2026-07-21 103718" src="https://github.com/user-attachments/assets/ce038240-4e7e-4b56-9986-24eed9fa2767" />

Users can increase credibility by:

- Writing more reviews
- Providing verification evidence
- Maintaining consistent and high-quality contributions

---

# 5. Personal Profile Dashboard

<img width="1445" height="1098" alt="屏幕截图 2026-07-21 103710" src="https://github.com/user-attachments/assets/11035b2a-f325-4e32-ac91-339e2627df29" />


Users can manage their account and track review activity.

## Personal Information

<img width="2241" height="1202" alt="屏幕截图 2026-07-21 103655" src="https://github.com/user-attachments/assets/2f4e7cbe-4cc9-49fa-8867-0cd537451a0a" />

Users can view:
- Username
- Email
- Account creation date
- Current trust level

## Review Statistics

Dashboard provides:

- Total Reviews
- Verified Reviews
- Verification Rate
- Average Rating Given

Example:

## Review Filtering

<img width="2266" height="1076" alt="屏幕截图 2026-07-21 103631" src="https://github.com/user-attachments/assets/213cd590-5b08-4c70-9c8e-36e0e97f36d6" />


Users can filter reviews by:

### Verification Status
- All reviews
- Verified reviews only

### Minimum Rating
Example:


### Cuisine Type
Supported categories:
- Chinese
- Japanese
- Korean
- Western
- Italian
- Indian
- Thai

### Price Level
Users can filter restaurants based on expected spending level.

---

# 6. Wishlist & Quick Save

The **Wishlist** feature enables users to bookmark restaurants they are interested in, allowing them to revisit their favorite restaurants without searching again.

### Features

- **Quick Save**
  - Save restaurants directly from the Search page with a single click.
  - Instantly add restaurants to a personalized wishlist while browsing.

- **Restaurant Information**
  - Each saved restaurant includes:
    - Restaurant name
    - Cuisine category
    - Rating
    - Restaurant image

- **Wishlist Management**
  - Display all saved restaurants in a clean card-based layout.
  - Remove restaurants from the wishlist at any time.
  - Automatically update the interface after any changes.

- **Frontend Data Persistence**
  - Wishlist data is currently stored using the browser's **localStorage**.
  - Saved restaurants remain available after page refreshes.
  - This implementation demonstrates the complete frontend user experience before backend integration.


# 7. Review Display and Credibility Information

Reviews are displayed through clear review cards.

Each review includes:

## Restaurant Information
- Restaurant name
- Restaurant details

## Review Information
- Review title
- Written experience
- Individual ratings

## Credibility Information
- Verification status
- Reviewer trust level
- Reviewer information

---

# 8. Restaurant Comparison

FoodTrust enables users to compare restaurants based on multiple aspects.

| Category | Purpose |
|-----------|---------|
| Taste | Compare food quality |
| Value | Compare price-performance |
| Ambiance | Compare dining environment |
| Trust Score | Compare reviewer reliability |

This provides a more comprehensive decision-making experience.

---

# 9. User-Friendly Interface

FoodTrust focuses on providing a simple and intuitive user experience.

Main interface features:
- Simple navigation
- Clear review cards
- Organized rating displays
- Easy review submission
- Personalized profile dashboard

---

