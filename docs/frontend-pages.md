# Frontend Page Suggestions

This document outlines potential frontend pages based on the backend API and Prisma schema.

## Overview

The Kangalos platform manages research projects, stakeholders, funding, and organisational units for the University of Rwanda. The schema defines entities like projects, categories, users, roles, positions, evaluations, and SDGs. See `prisma/schema.prisma` for enum definitions such as `UserType` and `ProjectStatus`【F:prisma/schema.prisma†L14-L37】. The README explains how the platform tracks projects from proposal to completion with features like evaluations, funding lifecycle, and nested categories【F:README.md†L13-L39】.

Below are suggested pages grouped by feature area. Recommended roles are indicative and assume an RBAC system where permissions are configurable.

## Authentication

- **Register / Login / Forgot Password / Reset Password**  
  Corresponding endpoints: `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`【F:src/auth/auth.controller.ts†L16-L45】.  
  **Roles**: Public (unauthenticated users).
- **Email Verification Page**  
  Uses `/auth/verify-email` to confirm email addresses.

## User Management

- **User List & Search**  
  Uses `/users`, `/users/search`, `/users/by-type/:userType`, `/users/by-org-unit/:orgUnitId`. Allows filtering by type and organisation unit.  
  **Roles**: Admin, Staff with appropriate permissions.
- **User Detail & Edit**  
  Endpoints: `/users/:id`, `PATCH /users/:id`, `DELETE /users/:id`.  
  **Roles**: Admin.
- **My Profile**  
  `/users/me` to view and `PUT /users/me` to update personal info.  
  **Roles**: Any authenticated user.
- **Assign Roles & Positions**  
  `/users/:id/roles`, `/users/:id/positions`, managed also via `/user-roles` and `/user-positions` controllers.  
  **Roles**: Admin or HR staff.

## Organisation Units & Positions

- **Organisation Unit Tree**  
  `/organisation-unit/tree` for viewing the hierarchical structure. Includes links to positions, projects, stakeholders.  
  **Roles**: Admin, Staff.
- **Organisation Unit CRUD**  
  `/organisation-unit` endpoints for create, update, delete; `/organisation-unit/:id/children` etc.  
  **Roles**: Admin.
- **Position Management**  
  `/positions` CRUD and `/positions/:id/occupants` for assigning users.  
  **Roles**: Admin or HR staff.

## Role & Permission Administration

- **Roles Page**  
  Manage roles via `/roles` and assign permissions (`/roles/:id/permissions`).  
  **Roles**: Admin.
- **Permissions Page**  
  CRUD for permissions (`/permissions`).  
  **Roles**: Admin.

## Project Management

- **Project Listing & Search**  
  `/projects` and `/projects/search` provide filters for year, status, and more【F:src/projects/projects.controller.ts†L23-L34】.  
  **Roles**: Authenticated users (view); Admin/Staff (manage).
- **Project Detail**  
  `/projects/:id` to view, `PATCH /projects/:id` to update or delete. Show authors, funders, stakeholders, attachments and reports.  
  **Roles**: Project owners, Admin.
- **Create Project**  
  `/projects/project` endpoint for submission.  
  **Roles**: Students, Staff, Partners with create permission.
- **Attachments**  
  `/attachments` CRUD, `/attachments/:id/download`, `/by-project/:projectId`.  
  **Roles**: Project contributors, Admin.
- **Categories**  
  `/categories` endpoints and `/categories/tree` for nested tags. Useful when categorising projects.  
  **Roles**: Admin manages; all users can browse.
- **Funders & Stakeholders**  
  CRUD via `/funder` and `/stakeholder` plus project links through `/project-funder` and `/project-stakeholders`.  
  **Roles**: Admin or finance team.
- **Project Authors**  
  `/project-author` endpoints to manage authorship links.  
  **Roles**: Admin, Project owners.
- **Project Evaluations**  
  `/project-evaluations` and `/projects/:id/evaluations` for reviewers to submit scores and view summaries【F:src/project-evaluation/project-evaluation.controller.ts†L20-L46】.  
  **Roles**: Evaluators, Admin.
- **Project Reports**  
  `/project-reports` and `/projects/:id/reports` for periodic updates and summaries【F:src/project-report/projects-reports.controller.ts†L17-L36】.  
  **Roles**: Project team members (create/update), Admin.
- **Startups**  
  `/startups` with filters like `/registered` or `/by-year/:year`. Tracks spin‑off companies.  
  **Roles**: Admin, Innovation office.
- **SDG Tracking**  
  `/projects/:id/sdgs` to link projects with Sustainable Development Goals and statistics endpoints like `/sdgs/coverage`【F:src/sdg/sdg.controller.ts†L14-L36】【F:src/sdg/sdg.controller.ts†L37-L48】.  
  **Roles**: Admin, Reporting team.

## Reporting & Analytics

- **Evaluation Dashboard**  
  Aggregated view from `/evaluations/pending`, `/projects/:id/evaluations/summary`, etc.  
  **Roles**: Evaluators, Admin.
- **Funding & Stakeholder Reports**  
  Use `/project-funder` and `/stakeholder` data to show financial and partnership summaries.  
  **Roles**: Finance team, Admin.
- **SDG Statistics**  
  `/sdgs/statistics` for charts showing goal coverage.  
  **Roles**: Admin, Public (optional).

These pages should align with the backend routes and provide role‑based access depending on the organisation's permissions configuration.
