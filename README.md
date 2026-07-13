<div align="center">

# AI Job Copilot

### Apply smarter. Prepare better. Track every opportunity.

A full-stack job-search assistant that helps users manage resumes, compare them with job descriptions, generate application content, practise interviews, and track job applications from one dashboard.

<br />

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)

</div>

---

## Overview

AI Job Copilot brings the main parts of a job search into one connected platform.

Users can upload and manage resumes, add job descriptions, analyse resume compatibility, generate cover letters, practise interview questions, track applications, and review progress through analytics.

The project is currently undergoing UI/UX refinement and deployment preparation.

---

## Key Features

### Resume Management

- Upload PDF and DOCX resumes
- Extract resume content using Apache Tika
- Parse skills, education, experience, projects, and contact details
- Maintain multiple resume versions
- Rename, delete, re-parse, and select an active resume

### ATS and Job Matching

- Compare a resume with a selected job description
- Review overall compatibility
- Identify missing keywords and skill gaps
- Receive improvement recommendations
- Review category-level scoring information

### Job Description Management

- Save and organise job descriptions
- Extract useful role information
- Identify required skills and experience
- Connect job descriptions with resumes and applications

### Cover Letter Generation

- Generate cover letters using resume and job-description context
- Review and edit generated content
- Save cover letters for later use

### Interview Practice

- Generate job-specific interview questions
- Practise answers
- Review feedback and scoring
- Track interview preparation sessions

### Application Tracker

- Track applications through different stages
- Use list and Kanban views
- Store company, role, salary, notes, and follow-up information
- Filter and sort application records

### Analytics

- Review application activity
- Track pipeline progress
- View ATS and interview trends
- Monitor recent activity

### Authentication and Settings

- Registration and login
- Access and refresh-token authentication
- Password reset flow
- Profile management
- Password change
- Notification and appearance preferences

---

## Screenshots

Screenshots will be added after the current UI refinement pass is complete.

Planned screenshots:

- Landing page
- Dashboard
- Resume intelligence
- ATS report
- Application tracker
- Interview practice
- Analytics

---

## Architecture

```mermaid
flowchart LR
    User[User] --> Frontend[Next.js Frontend]

    Frontend -->|REST API| Backend[Spring Boot Backend]

    Backend --> Database[(PostgreSQL)]
    Backend --> Cache[(Redis)]
    Backend --> AI[AI Provider]

    Backend --> Storage[Resume File Storage]
