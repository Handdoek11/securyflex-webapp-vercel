# SecuryFlex Workflow Diagrams - Visual Journey Maps

## 🎯 Overview

This document contains comprehensive Mermaid diagrams illustrating all user workflows in the SecuryFlex platform. These visual representations make complex multi-step processes easier to understand and optimize.

## 🔧 ZZP (Freelancer) Workflows

### ZZP Complete Journey Flow

```mermaid
graph TD
    A[ZZP Login] --> B[Browse Available Jobs]
    B --> C{Filter & Search}
    C --> D[View Job Details]
    D --> E{Interested?}
    E -->|No| B
    E -->|Yes| F[Check Requirements Match]
    F --> G{Qualifications Met?}
    G -->|No| H[View Similar Jobs]
    G -->|Yes| I[Submit Application]
    H --> B
    I --> J[Wait for Response]
    J --> K{Application Status}
    K -->|Accepted| L[Assignment Confirmed]
    K -->|Rejected| M[Continue Job Search]
    K -->|Pending| N[Follow Up]
    L --> O[Prepare for Assignment]
    O --> P[Travel to Location]
    P --> Q[GPS Check-in]
    Q --> R[Perform Security Work]
    R --> S[Take Breaks/Log Notes]
    S --> T[GPS Check-out]
    T --> U[Submit Hours & Report]
    U --> V{Hours Approved?}
    V -->|Yes| W[Payment Processing]
    V -->|No| X[Clarification Required]
    X --> Y[Resubmit Hours]
    Y --> V
    W --> Z[Payment Received]
    Z --> AA[Rate Client Experience]
    AA --> AB[Available for New Jobs]
    AB --> B
    M --> B
    N --> K
```

### ZZP Job Application Workflow

```mermaid
flowchart TD
    A[Find Interesting Job] --> B[Read Full Description]
    B --> C[Check Required Skills]
    C --> D{Skills Match?}
    D -->|Partial| E[Apply with Note]
    D -->|Full| F[Standard Application]
    D -->|No| G[Look for Training Options]
    E --> H[API: POST /api/jobs/\{id\}/apply]
    F --> H
    G --> I[Skip This Job]
    H --> J[Real-time Broadcast Event]
    J --> K[Employer Notification]
    K --> L[Application Tracking]
    L --> M{Response Received}
    M -->|Accepted| N[Assignment Details]
    M -->|Interview Request| O[Schedule Interview]
    M -->|Rejected| P[Feedback Review]
    N --> Q[Confirm Availability]
    O --> R[Attend Interview]
    P --> S[Improve Profile]
    Q --> T[Assignment Active]
    R --> U{Interview Result}
    U -->|Success| Q
    U -->|Rejected| P
    S --> I
```

### ZZP Hour Tracking & Payment

```mermaid
sequenceDiagram
    participant ZZP as ZZP Guard
    participant App as Mobile App
    participant API as SecuryFlex API
    participant GPS as GPS Service
    participant Client as Client
    participant Finqle as Finqle Payment

    ZZP->>App: Arrive at Location
    App->>GPS: Get Current Location
    GPS-->>App: Location Data
    App->>API: POST /api/hours/checkin
    API-->>App: Check-in Confirmed

    Note over ZZP,API: Work Period
    ZZP->>App: Log Break Start
    App->>API: POST /api/hours/break
    ZZP->>App: Log Break End
    App->>API: PUT /api/hours/break/end

    ZZP->>App: End Shift
    App->>GPS: Verify Location
    GPS-->>App: Location Confirmed
    App->>API: POST /api/hours/checkout
    API-->>App: Checkout Confirmed

    ZZP->>App: Submit Timesheet
    App->>API: POST /api/hours/submit
    API-->>Client: Hours for Approval
    Client-->>API: Approve Hours
    API->>Finqle: Process Payment
    Finqle-->>API: Payment Confirmation
    API-->>ZZP: Payment Notification
```

## 🏢 Bedrijf (Security Company) Workflows

### Bedrijf Multi-Mode Operations

```mermaid
graph TB
    A[Bedrijf Dashboard] --> B{Operational Mode}

    B -->|Mode 1| C[🔧 Leverancier<br/>Service Provider]
    B -->|Mode 2| D[📋 Opdrachtgever<br/>Client Creator]
    B -->|Mode 3| E[👥 Werkgever<br/>Internal Employer]

    C --> F[Browse External Opdrachten]
    F --> G[Assess Team Capacity]
    G --> H[Submit Team Proposal]
    H --> I{Proposal Accepted?}
    I -->|Yes| J[Deploy Team]
    I -->|No| K[Seek Other Opportunities]
    J --> L[Monitor Team Performance]
    L --> M[Submit Team Hours]
    M --> N[Receive Payment]
    K --> F

    D --> O[Create Opdracht for Market]
    O --> P[Set Requirements & Budget]
    P --> Q[Publish to Platform]
    Q --> R[Review Applications]
    R --> S[Select Service Provider]
    S --> T[Coordinate Service Delivery]
    T --> U[Monitor Service Quality]
    U --> V[Process Payment to Provider]
    V --> W[Invoice End Client]

    E --> X[Identify Internal Need]
    X --> Y[Create Internal Assignment]
    Y --> Z[Assign Specific Team Members]
    Z --> AA[Brief Team Directly]
    AA --> BB[Direct Team Management]
    BB --> CC[Internal Payroll Processing]
```

### Bedrijf Team Assignment Algorithm

```mermaid
flowchart TD
    A[New Opdracht Received] --> B[Analyze Requirements]
    B --> C[Query Available Team Members]
    C --> D{Team Matching Analysis}
    D --> E[Skill Compatibility Check]
    D --> F[Location Proximity Check]
    D --> G[Availability Verification]
    D --> H[Performance History Review]

    E --> I{Skills Match?}
    F --> J{Within Range?}
    G --> K{Available?}
    H --> L{Good Performance?}

    I -->|Yes| M[+2 Points]
    I -->|Partial| N[+1 Point]
    I -->|No| O[-1 Point]

    J -->|<30km| P[+2 Points]
    J -->|<50km| Q[+1 Point]
    J -->|>50km| R[-1 Point]

    K -->|Available| S[+2 Points]
    K -->|Partially| T[+1 Point]
    K -->|Busy| U[-2 Points]

    L -->|>4.5 Rating| V[+2 Points]
    L -->|>4.0 Rating| W[+1 Point]
    L -->|<4.0 Rating| X[-1 Point]

    M --> Y[Calculate Total Score]
    N --> Y
    O --> Y
    P --> Y
    Q --> Y
    R --> Y
    S --> Y
    T --> Y
    U --> Y
    V --> Y
    W --> Y
    X --> Y

    Y --> Z{Score > 5?}
    Z -->|Yes| AA[Highly Recommended]
    Z -->|3-5| BB[Recommended]
    Z -->|1-2| CC[Consider]
    Z -->|<1| DD[Not Suitable]
```

### Bedrijf Financial Multi-Stream

```mermaid
sankey
    External Clients,Mode 1 Revenue,15000
    Mode 1 Revenue,Team Costs,8000
    Mode 1 Revenue,Platform Fees,2000
    Mode 1 Revenue,Net Profit 1,5000

    Subcontract Clients,Mode 2 Revenue,25000
    Mode 2 Revenue,Service Provider Costs,18000
    Mode 2 Revenue,Platform Fees,2500
    Mode 2 Revenue,Net Profit 2,4500

    Internal Clients,Mode 3 Revenue,12000
    Mode 3 Revenue,Team Payroll,8000
    Mode 3 Revenue,Internal Costs,1000
    Mode 3 Revenue,Net Profit 3,3000

    Net Profit 1,Total Net,5000
    Net Profit 2,Total Net,4500
    Net Profit 3,Total Net,3000
```

## 👔 Opdrachtgever (Client) Workflows

### Opdrachtgever Complete Shift Creation

```mermaid
journey
    title Client Shift Creation Journey
    section Need Recognition
      Security Incident      : 1: Client
      Plan Prevention       : 3: Client
      Budget Approval       : 4: Client
    section Platform Access
      Login to Platform     : 5: Client
      Navigate to Create    : 5: Client
    section Step 1: Basics
      Select Security Type  : 4: Client
      Enter Location       : 4: Client
      Set Risk Profile     : 3: Client
      Add Instructions     : 4: Client
    section Step 2: Planning
      Choose Shift Type    : 4: Client
      Set Date & Time      : 5: Client
      Define Team Size     : 4: Client
    section Step 3: Requirements
      Select Documents     : 3: Client
      Choose Skills        : 4: Client
      Set Experience       : 3: Client
    section Step 4: Budget
      Review Market Rate   : 5: Client
      Set Hourly Rate      : 4: Client
      Configure Allowances : 3: Client
      Review Total Cost    : 5: Client
    section Step 5: Review
      Validate All Details : 4: Client
      Check Estimated Matches: 5: Client
      Publish Shift        : 5: Client
    section Post-Publication
      Receive Applications : 5: Client
      Review Candidates    : 4: Client
      Make Selection       : 5: Client
```

### Opdrachtgever Payment Processing

```mermaid
graph TD
    A[Shift Completed] --> B[Hours Submitted by Guard]
    B --> C[Client Review Dashboard]
    C --> D{Review Hours}
    D -->|Approve All| E[Bulk Approval]
    D -->|Approve Partial| F[Selective Approval]
    D -->|Dispute| G[Raise Dispute]

    E --> H[Calculate Total Amount]
    F --> H
    G --> I[Dispute Resolution Process]
    I --> J[Revised Hours Submission]
    J --> D

    H --> K[Finqle Credit Check]
    K --> L{Sufficient Credit?}
    L -->|Yes| M[Payment Processing Options]
    L -->|No| N[Credit Limit Request]
    N --> O[Credit Approval Process]
    O --> P{Credit Approved?}
    P -->|Yes| M
    P -->|No| Q[Alternative Payment Method]
    Q --> R[Manual Bank Transfer]

    M --> S{Payment Method}
    S -->|Direct Payment| T[24-Hour Payment]
    S -->|Scheduled| U[Future Date Payment]
    S -->|Batch| V[Weekly Batch Payment]

    T --> W[Payment to Guard/Company]
    U --> W
    V --> W
    W --> X[Payment Confirmation]
    X --> Y[Invoice Generation]
    Y --> Z[Client Notification]
    Z --> AA[Guard Notification]
    R --> W
```

### Opdrachtgever Service Monitoring

```mermaid
stateDiagram-v2
    [*] --> ShiftScheduled
    ShiftScheduled --> GuardAssigned : Application Accepted
    GuardAssigned --> PreShiftBriefing : Assignment Confirmed
    PreShiftBriefing --> GuardEnRoute : Guard Notified
    GuardEnRoute --> GuardOnSite : GPS Check-in
    GuardOnSite --> ShiftActive : Work Begins

    ShiftActive --> OnBreak : Break Started
    OnBreak --> ShiftActive : Break Ended
    ShiftActive --> IncidentReported : Issue Occurs
    IncidentReported --> IncidentInvestigating : Review Started
    IncidentInvestigating --> IncidentResolved : Issue Fixed
    IncidentResolved --> ShiftActive : Resume Normal
    IncidentInvestigating --> ShiftTerminated : Critical Issue

    ShiftActive --> ShiftCompleted : Work Finished
    ShiftCompleted --> HoursSubmitted : Guard Submits Time
    HoursSubmitted --> HoursUnderReview : Client Reviews
    HoursUnderReview --> HoursApproved : Client Approves
    HoursUnderReview --> HoursDisputed : Client Disputes
    HoursDisputed --> HoursResubmitted : Clarification
    HoursResubmitted --> HoursUnderReview : Re-review
    HoursApproved --> PaymentProcessed : Finqle Payment
    PaymentProcessed --> [*]
    ShiftTerminated --> [*]
```

## 💳 Cross-Platform Payment Flows

### Finqle Integration Architecture

```mermaid
C4Context
    title Finqle Payment Integration Context

    Person(client, "Opdrachtgever", "Needs security services")
    Person(guard, "ZZP/Bedrijf", "Provides security services")

    System_Boundary(securyflex, "SecuryFlex Platform") {
        System(web, "Web Application", "React/Next.js")
        System(mobile, "Mobile App", "React Native")
        System(api, "API Backend", "Node.js/Express")
        System(db, "Database", "PostgreSQL")
        System(broadcast, "Real-time", "Supabase")
    }

    System_Ext(finqle, "Finqle", "Payment Processing")
    System_Ext(banks, "Banking System", "SEPA/iDEAL")

    Rel(client, web, "Creates shifts, approves payments")
    Rel(guard, mobile, "Submits hours, tracks payments")
    Rel(web, api, "HTTPS/REST")
    Rel(mobile, api, "HTTPS/REST")
    Rel(api, db, "SQL queries")
    Rel(api, broadcast, "WebSocket events")
    Rel(api, finqle, "Payment API calls")
    Rel(finqle, banks, "Bank transfers")
```

### Finqle Payment State Machine

```mermaid
stateDiagram-v2
    [*] --> HoursSubmitted
    HoursSubmitted --> PendingApproval : Client Reviews
    PendingApproval --> HoursApproved : Client Approves
    PendingApproval --> HoursRejected : Client Rejects
    HoursRejected --> [*]

    HoursApproved --> CreditCheck : Finqle Verification
    CreditCheck --> CreditApproved : Sufficient Credit
    CreditCheck --> CreditDenied : Insufficient Credit
    CreditDenied --> CreditIncrease : Request More Credit
    CreditIncrease --> CreditCheck : Retry Verification

    CreditApproved --> PaymentInitiated : Create Payment
    PaymentInitiated --> DirectPayment : Immediate Processing
    PaymentInitiated --> BatchPayment : Scheduled Processing

    DirectPayment --> PaymentProcessing : 24h Processing
    BatchPayment --> PaymentProcessing : Weekly Batch
    PaymentProcessing --> PaymentCompleted : Success
    PaymentProcessing --> PaymentFailed : Bank Error

    PaymentFailed --> PaymentRetry : Automatic Retry
    PaymentRetry --> PaymentProcessing : Retry Processing
    PaymentRetry --> PaymentManualReview : Max Retries
    PaymentManualReview --> PaymentCompleted : Manual Fix

    PaymentCompleted --> [*]
```

## 🔄 Cross-User Interaction Flows

### Application & Selection Process

```mermaid
sequenceDiagram
    participant OG as Opdrachtgever
    participant SF as SecuryFlex Platform
    participant ZZP as ZZP Guard
    participant B as Bedrijf Company
    participant RT as Real-time System

    OG->>SF: Create Shift
    SF->>RT: Broadcast New Shift
    RT->>ZZP: Notify Matching Guards
    RT->>B: Notify Matching Companies

    ZZP->>SF: Submit Application
    B->>SF: Submit Team Proposal

    SF->>RT: Broadcast New Applications
    RT->>OG: Notify New Applications

    OG->>SF: Review Applications
    OG->>SF: Select ZZP Guard

    SF->>RT: Broadcast Selection
    RT->>ZZP: Assignment Confirmation
    RT->>B: Application Rejected

    ZZP->>SF: Confirm Assignment
    SF->>RT: Broadcast Confirmation
    RT->>OG: Assignment Confirmed

    Note over ZZP,SF: Shift Execution
    ZZP->>SF: Submit Hours
    SF->>RT: Broadcast Hours Submitted
    RT->>OG: Hours for Review

    OG->>SF: Approve & Pay
    SF->>ZZP: Payment Processed
```

### Multi-Party Communication Flow

```mermaid
graph TD
    A[Communication Need] --> B{Urgency Level}
    B -->|Emergency| C[Emergency Protocol]
    B -->|Urgent| D[Direct Communication]
    B -->|Normal| E[Platform Messaging]

    C --> F[Emergency Hotline]
    C --> G[Emergency Services]
    C --> H[All Parties Notified]

    D --> I[Phone Call]
    D --> J[SMS Alert]
    D --> K[Push Notification]

    E --> L[In-App Message]
    E --> M[Email Notification]
    E --> N[Real-time Chat]

    F --> O[Incident Report]
    G --> O
    H --> O
    I --> P[Communication Log]
    J --> P
    K --> P
    L --> Q[Message Thread]
    M --> Q
    N --> Q

    O --> R[Crisis Management]
    P --> S[Follow-up Actions]
    Q --> T[Standard Resolution]
```

## 📊 Analytics & Reporting Flows

### Platform Analytics Dashboard

```mermaid
graph LR
    A[Data Sources] --> B[Data Processing]
    B --> C[Analytics Engine]
    C --> D[Reporting Dashboard]

    A1[User Interactions] --> A
    A2[Payment Transactions] --> A
    A3[Shift Performance] --> A
    A4[Communication Logs] --> A
    A5[GPS Tracking] --> A

    B1[Data Validation] --> B
    B2[Data Aggregation] --> B
    B3[Real-time Processing] --> B

    C1[KPI Calculations] --> C
    C2[Trend Analysis] --> C
    C3[Predictive Modeling] --> C

    D1[Executive Dashboard] --> D
    D2[Operational Metrics] --> D
    D3[Financial Reports] --> D
    D4[Performance Analytics] --> D
```

### Quality Assurance Flow

```mermaid
flowchart TD
    A[Shift Completion] --> B[Automatic Data Collection]
    B --> C[Client Feedback Request]
    B --> D[Guard Self-Assessment]
    B --> E[System Performance Metrics]

    C --> F[Client Rating & Comments]
    D --> G[Guard Report & Photos]
    E --> H[GPS Accuracy & Timing]

    F --> I[Quality Score Calculation]
    G --> I
    H --> I

    I --> J{Quality Threshold}
    J -->|High| K[Positive Feedback Loop]
    J -->|Medium| L[Standard Processing]
    J -->|Low| M[Quality Improvement Plan]

    K --> N[Reward Guard/Company]
    K --> O[Feature in Recommendations]

    L --> P[Regular Monitoring]

    M --> Q[Performance Review]
    M --> R[Additional Training]
    M --> S[Probation Period]

    N --> T[Platform Reputation Update]
    O --> T
    P --> T
    Q --> U[Corrective Actions]
    R --> U
    S --> U
    U --> V[Continuous Improvement]
```

---

*These Mermaid diagrams provide comprehensive visual representations of all major workflows in the SecuryFlex platform, enabling better understanding, optimization, and communication of complex user journeys.*