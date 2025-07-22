# Kangalos Project Management Platform - System Diagrams

## 1. System Context Diagram

```mermaid
graph TB
    subgraph "External Entities"
        S[Students]
        F[Faculty/Staff]
        R[Researchers]
        A[Administrators]
        FU[Funders]
        P[Partners]
        E[External Evaluators]
    end

    subgraph "Kangalos Platform"
        K[Kangalos Project Management System]
    end

    subgraph "External Systems"
        ES[Email System]
        FS[File Storage]
        DB[Database]
        AU[Authentication System]
    end

    S --> K
    F --> K
    R --> K
    A --> K
    FU --> K
    P --> K
    E --> K

    K --> ES
    K --> FS
    K --> DB
    K --> AU

    K --> S
    K --> F
    K --> R
    K --> A
    K --> FU
    K --> P
    K --> E
```

## 2. High-Level Use Case Diagram

```mermaid
graph TB
    subgraph "Kangalos System"
        subgraph "Project Management"
            UC1[Submit Project Proposal]
            UC2[Review Project]
            UC3[Approve/Reject Project]
            UC4[Track Project Progress]
            UC5[Submit Project Reports]
        end

        subgraph "Funding Management"
            UC6[Request Funding]
            UC7[Approve Funding]
            UC8[Track Fund Usage]
            UC9[Receive Installments]
        end

        subgraph "User Management"
            UC10[Register User]
            UC11[Assign Roles]
            UC12[Manage Permissions]
        end

        subgraph "Reporting & Analytics"
            UC13[Generate Reports]
            UC14[View Dashboard]
            UC15[Export Data]
        end
    end

    Student((Student)) --> UC1
    Student --> UC4
    Student --> UC5

    Faculty((Faculty)) --> UC1
    Faculty --> UC2
    Faculty --> UC4
    Faculty --> UC5

    Evaluator((Evaluator)) --> UC2
    Evaluator --> UC3

    Admin((Administrator)) --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14

    Funder((Funder)) --> UC6
    Funder --> UC7
    Funder --> UC8
    Funder --> UC9

    Researcher((Researcher)) --> UC1
    Researcher --> UC4
    Researcher --> UC5
    Researcher --> UC6
```

## 3. User Journey - Project Submission Flow

```mermaid
journey
    title Project Submission and Approval Journey

    section Project Initiation
        Student/Researcher logs in: 5: Student, Researcher
        Browse existing projects: 4: Student, Researcher
        Create new project proposal: 5: Student, Researcher
        Fill project details: 4: Student, Researcher
        Add collaborators: 4: Student, Researcher
        Upload attachments: 3: Student, Researcher
        Submit for review: 5: Student, Researcher

    section Review Process
        Receive notification: 5: Evaluator
        Review project details: 4: Evaluator
        Evaluate against criteria: 3: Evaluator
        Provide feedback: 4: Evaluator
        Make decision: 5: Evaluator

    section Post-Approval
        Receive approval notification: 5: Student, Researcher
        Set up project tracking: 4: Student, Researcher
        Submit periodic reports: 3: Student, Researcher
        Track progress: 4: Student, Researcher
```

## 4. Data Flow Diagram - Project Lifecycle

```mermaid
flowchart TD
    A[User Creates Project] --> B[Project Data Validation]
    B --> C[SHA256 Hash Generation]
    C --> D[Duplication Check]
    D --> E{Duplicate Found?}

    E -->|Yes| F[Reject Submission]
    E -->|No| G[Store Project Data]

    G --> H[Assign to Org Unit]
    H --> I[Notify Evaluators]
    I --> J[Evaluation Process]

    J --> K{Approved?}
    K -->|Yes| L[Update Status to APPROVED]
    K -->|No| M[Update Status to REJECTED]

    L --> N[Funding Request Process]
    M --> O[Archive Project]

    N --> P{Funding Approved?}
    P -->|Yes| Q[Status: FUNDED]
    P -->|No| R[Status: APPROVED]

    Q --> S[Project Implementation]
    S --> T[Progress Reporting]
    T --> U[Fund Usage Tracking]
    U --> V[Project Completion]
    V --> W[Final Evaluation]
    W --> X[Archive as COMPLETED]
```

## 5. User Role and Permission Flow

```mermaid
flowchart LR
    subgraph "User Management"
        A[New User Registration] --> B[Email Verification]
        B --> C[Profile Completion]
        C --> D[Org Unit Assignment]
        D --> E[Role Assignment]
        E --> F[Permission Calculation]
    end

    subgraph "Access Control"
        F --> G{User Action Request}
        G --> H[Check Permissions]
        H --> I{Authorized?}
        I -->|Yes| J[Allow Action]
        I -->|No| K[Deny Access]
    end

    subgraph "Role Hierarchy"
        L[Super Admin] --> M[University Admin]
        M --> N[College Admin]
        N --> O[Department Admin]
        O --> P[Faculty]
        P --> Q[Student]
    end
```

## 6. Funding Process Flow

```mermaid
sequenceDiagram
    participant P as Project Owner
    participant S as System
    participant F as Funder
    participant A as Admin
    participant B as Bank/Payment

    P->>S: Submit Funding Request
    S->>S: Validate Request
    S->>F: Notify Funder
    F->>S: Review Application

    alt Funding Approved
        F->>S: Approve Funding
        S->>P: Notify Approval
        S->>A: Setup Fund Tracking

        loop Installment Process
            F->>B: Transfer Installment
            B->>S: Confirm Receipt
            S->>P: Notify Fund Receipt
            P->>S: Submit Usage Report
        end

    else Funding Rejected
        F->>S: Reject Funding
        S->>P: Notify Rejection
    end
```

## 7. Project Status State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: Project Submitted

    PENDING --> UNDER_REVIEW: Assigned to Evaluator
    UNDER_REVIEW --> APPROVED: Evaluation Positive
    UNDER_REVIEW --> REJECTED: Evaluation Negative
    UNDER_REVIEW --> PENDING: Request Modifications

    APPROVED --> FUNDED: Funding Secured
    APPROVED --> ARCHIVED: No Funding Needed

    FUNDED --> COMPLETED: Project Finished

    REJECTED --> ARCHIVED: Final Rejection
    COMPLETED --> ARCHIVED: Documentation Complete

    ARCHIVED --> [*]
```

## 8. Organizational Hierarchy and Project Flow

```mermaid
flowchart TD
    subgraph "University Structure"
        A[University of Rwanda] --> B[College of Science & Technology]
        A --> C[College of Business]
        A --> D[College of Medicine]

        B --> E[School of Engineering]
        B --> F[School of IT]

        E --> G[Civil Engineering Dept]
        E --> H[Mechanical Engineering Dept]

        F --> I[Computer Science Dept]
        F --> J[Information Systems Dept]
    end

    subgraph "Project Assignment"
        K[Project Submission] --> L{Determine Org Unit}
        L --> G
        L --> H
        L --> I
        L --> J

        G --> M[Dept. Evaluator]
        H --> M
        I --> M
        J --> M

        M --> N[College Evaluator]
        N --> O[University Committee]
    end
```

## 9. Stakeholder Interaction Diagram

```mermaid
graph TB
    subgraph "Internal Stakeholders"
        ST[Students]
        FA[Faculty]
        AD[Administrators]
        EV[Evaluators]
    end

    subgraph "External Stakeholders"
        FU[Funders]
        PA[Partners]
        RE[Regulators]
        BE[Beneficiaries]
    end

    subgraph "Kangalos Platform"
        PR[Projects]
        FN[Funding]
        RP[Reports]
        DA[Data/Analytics]
    end

    ST --> PR
    FA --> PR
    ST --> RP
    FA --> RP

    EV --> PR
    AD --> DA
    AD --> PR

    FU --> FN
    PA --> PR
    RE --> RP
    BE --> DA

    PR --> ST
    PR --> FA
    FN --> FU
    RP --> RE
    DA --> AD
```

## 10. Document and File Management Flow

```mermaid
flowchart LR
    A[User Upload] --> B[File Validation]
    B --> C[Virus Scan]
    C --> D[SHA256 Hash]
    D --> E{Duplicate?}

    E -->|Yes| F[Link to Existing]
    E -->|No| G[Store File]

    G --> H[Generate Metadata]
    H --> I[Update Database]
    I --> J[Notify User]

    subgraph "File Operations"
        K[Download] --> L[Access Check]
        L --> M{Authorized?}
        M -->|Yes| N[Serve File]
        M -->|No| O[Access Denied]
    end
```

## 11. Reporting and Analytics Flow

```mermaid
flowchart TD
    subgraph "Data Sources"
        A[Projects Data]
        B[Users Data]
        C[Funding Data]
        D[Evaluation Data]
        E[Reports Data]
    end

    subgraph "Processing"
        F[Data Aggregation]
        G[Statistical Analysis]
        H[Trend Analysis]
        I[Impact Assessment]
    end

    subgraph "Outputs"
        J[Executive Dashboard]
        K[Department Reports]
        L[Funding Reports]
        M[Impact Reports]
        N[Custom Reports]
    end

    A --> F
    B --> F
    C --> F
    D --> F
    E --> F

    F --> G
    F --> H
    F --> I

    G --> J
    G --> K
    H --> L
    I --> M
    G --> N
    H --> N
    I --> N
```

## 12. Project Evaluation Workflow

```mermaid
flowchart TD
    A[Project Submitted] --> B[Automatic Assignment]
    B --> C[Evaluator Pool]

    C --> D[Primary Evaluator]
    C --> E[Secondary Evaluator]
    C --> F[Domain Expert]

    D --> G[Technical Review]
    E --> H[Feasibility Review]
    F --> I[Innovation Review]

    G --> J[Score & Comments]
    H --> J
    I --> J

    J --> K{Consensus?}
    K -->|Yes| L[Final Decision]
    K -->|No| M[Committee Review]

    M --> L
    L --> N{Approved?}

    N -->|Yes| O[Notify Acceptance]
    N -->|No| P[Notify Rejection]

    O --> Q[Setup Project Tracking]
    P --> R[Archive with Feedback]
```

## 13. User Authentication and Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client App
    participant A as Auth Service
    participant D as Database
    participant S as System

    U->>C: Login Request
    C->>A: Validate Credentials
    A->>D: Check User Data
    D->>A: Return User Info

    alt Valid Credentials
        A->>A: Generate JWT Token
        A->>C: Return Token + User Info
        C->>U: Login Success

        loop Protected Requests
            U->>C: Make Request
            C->>S: Request + Token
            S->>S: Validate Token
            S->>D: Check Permissions
            D->>S: Return Permissions

            alt Authorized
                S->>C: Return Data
                C->>U: Display Data
            else Unauthorized
                S->>C: Access Denied
                C->>U: Show Error
            end
        end

    else Invalid Credentials
        A->>C: Authentication Failed
        C->>U: Login Failed
    end
```

## 14. Project Collaboration and Communication Flow

```mermaid
graph TB
    subgraph "Project Team"
        A[Lead Author]
        B[Co-Authors]
        C[Supervisors]
        D[External Partners]
    end

    subgraph "Communication Channels"
        E[Project Updates]
        F[Status Changes]
        G[Evaluation Results]
        H[Funding Notifications]
        I[Report Submissions]
    end

    subgraph "Notification Methods"
        J[Email Alerts]
        K[Dashboard Notifications]
        L[SMS (Critical)]
        M[System Messages]
    end

    A --> E
    B --> E
    C --> F
    D --> E

    E --> J
    F --> K
    G --> J
    G --> K
    H --> J
    H --> L
    I --> M

    J --> A
    J --> B
    J --> C
    J --> D
    K --> A
    K --> B
    K --> C
    L --> A
    M --> A
    M --> B
    M --> C
```

## 15. Integration and External System Flow

```mermaid
flowchart LR
    subgraph "Kangalos Core"
        A[API Gateway]
        B[Business Logic]
        C[Database]
    end

    subgraph "External Systems"
        D[Email Service]
        E[File Storage]
        F[Payment Gateway]
        G[University Systems]
        H[Government Systems]
    end

    subgraph "Third-party APIs"
        I[Academic Databases]
        J[Research Platforms]
        K[Funding Platforms]
    end

    A --> B
    B --> C

    B --> D
    B --> E
    B --> F
    B --> G
    B --> H

    A --> I
    A --> J
    A --> K

    D --> B
    E --> B
    F --> B
    G --> B
    H --> B

    I --> A
    J --> A
    K --> A
```

## 16. Complete Application Flow - Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant A as Auth Service
    participant P as Project Service
    participant E as Evaluation Service
    participant F as Funding Service
    participant N as Notification Service
    participant D as Database
    participant S as File Storage

    Note over U,S: 1. USER REGISTRATION & AUTHENTICATION
    U->>W: Access Platform
    W->>A: Request Registration
    A->>D: Create User Record
    A->>N: Send Verification Email
    N->>U: Email Verification Link
    U->>A: Verify Email
    A->>D: Activate User Account

    Note over U,S: 2. USER LOGIN & PROFILE SETUP
    U->>W: Login Request
    W->>A: Validate Credentials
    A->>D: Check User & Permissions
    D->>A: Return User Data & Roles
    A->>W: Return JWT Token + Profile
    W->>U: Dashboard Access Granted

    U->>W: Complete Profile
    W->>P: Update User Info
    P->>D: Store Profile Data
    P->>W: Profile Updated
    W->>U: Profile Complete

    Note over U,S: 3. PROJECT CREATION FLOW
    U->>W: Create New Project
    W->>P: Request Project Form
    P->>D: Get Categories & Templates
    D->>P: Return Form Data
    P->>W: Project Form
    W->>U: Display Form

    U->>W: Submit Project Data
    W->>P: Validate Project
    P->>P: Generate SHA256 Hash
    P->>D: Check Duplicates

    alt Project is Duplicate
        D->>P: Duplicate Found
        P->>W: Duplicate Error
        W->>U: Show Duplicate Warning
    else Project is Unique
        D->>P: No Duplicates
        P->>D: Store Project
        P->>W: Project Created
        W->>U: Success Message
    end

    Note over U,S: 4. FILE ATTACHMENT FLOW
    U->>W: Upload Attachments
    W->>S: Store Files
    S->>P: Return File URLs
    P->>D: Link Files to Project
    P->>W: Attachments Saved
    W->>U: Upload Complete

    Note over U,S: 5. PROJECT SUBMISSION & EVALUATION
    U->>W: Submit for Review
    W->>P: Submit Project
    P->>D: Update Status to PENDING
    P->>E: Request Evaluation
    E->>D: Find Available Evaluators
    E->>N: Notify Evaluators
    N->>E: Send Email Notifications

    Note over E: Evaluator Reviews Project
    E->>W: Access Evaluation Portal
    W->>E: Load Project Details
    E->>D: Get Project Data
    D->>E: Return Project Info
    E->>W: Display Project
    W->>E: Evaluation Interface

    E->>W: Submit Evaluation
    W->>E: Process Evaluation
    E->>D: Store Evaluation Results
    E->>P: Update Project Status

    alt Project Approved
        P->>D: Set Status to APPROVED
        P->>N: Notify Success
        N->>U: Approval Email
    else Project Rejected
        P->>D: Set Status to REJECTED
        P->>N: Notify Rejection
        N->>U: Rejection Email with Feedback
    end

    Note over U,S: 6. FUNDING REQUEST FLOW
    alt Project Needs Funding
        U->>W: Request Funding
        W->>F: Create Funding Request
        F->>D: Store Funding Data
        F->>N: Notify Funders
        N->>F: Send Funder Notifications

        Note over F: Funder Reviews Request
        F->>W: Access Funding Portal
        W->>F: Load Funding Request
        F->>D: Get Project & Financial Data
        D->>F: Return Complete Info
        F->>W: Display Funding Details

        F->>W: Make Funding Decision
        W->>F: Process Decision

        alt Funding Approved
            F->>D: Approve Funding
            F->>P: Update Project Status to FUNDED
            F->>N: Notify Approval
            N->>U: Funding Approved Email

            loop Installment Payments
                F->>D: Record Installment
                F->>N: Notify Payment Received
                N->>U: Payment Notification
                U->>W: Submit Usage Report
                W->>F: Store Usage Data
                F->>D: Update Fund Tracking
            end

        else Funding Rejected
            F->>D: Reject Funding
            F->>N: Notify Rejection
            N->>U: Funding Rejected Email
        end
    end

    Note over U,S: 7. PROJECT IMPLEMENTATION & TRACKING
    U->>W: Update Project Progress
    W->>P: Store Progress Data
    P->>D: Update Progress Metrics
    P->>W: Progress Saved
    W->>U: Update Confirmed

    loop Periodic Reporting
        U->>W: Submit Progress Report
        W->>P: Process Report
        P->>D: Store Report Data
        P->>N: Notify Stakeholders
        N->>P: Send Update Notifications
    end

    Note over U,S: 8. PROJECT COMPLETION
    U->>W: Mark Project Complete
    W->>P: Finalize Project
    P->>D: Update Status to COMPLETED
    P->>E: Request Final Evaluation
    E->>D: Store Final Assessment
    E->>P: Complete Evaluation
    P->>D: Archive Project
    P->>N: Notify Completion
    N->>U: Project Completion Email

    Note over U,S: 9. REPORTING & ANALYTICS
    U->>W: Access Reports Dashboard
    W->>P: Get Analytics Data
    P->>D: Query Aggregated Data
    D->>P: Return Statistics
    P->>W: Format Report Data
    W->>U: Display Dashboard

    Note over U,S: 10. SYSTEM ADMINISTRATION
    alt Admin Functions
        U->>W: Admin Actions
        W->>A: Verify Admin Permissions
        A->>D: Check Role Permissions
        D->>A: Confirm Admin Access
        A->>W: Grant Admin Access

        U->>W: Manage Users/Roles
        W->>A: Update User Management
        A->>D: Modify User Data
        A->>N: Notify Changes
        N->>A: Send Admin Notifications
    end
```

## Summary

These diagrams provide a comprehensive view of the Kangalos Project Management Platform, covering:

1. **System Context** - How the platform fits in the broader ecosystem
2. **Use Cases** - What users can do with the system
3. **User Journeys** - Step-by-step user experiences
4. **Data Flow** - How information moves through the system
5. **Process Flows** - Business process automation
6. **State Management** - Project lifecycle states
7. **Organizational Structure** - University hierarchy mapping
8. **Stakeholder Interactions** - Who interacts with whom
9. **Technical Flows** - System-level processes
10. **Integration Patterns** - External system connections

Each diagram serves a specific purpose in explaining the system to different audiences, from executive stakeholders to technical implementers.
