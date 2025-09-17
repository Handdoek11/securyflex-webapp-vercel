# Bedrijf (Security Company) Workflow - Three-Mode Operation System

## 🏢 Overview

Bedrijven (Security Companies) represent the most complex user type in the SecuryFlex platform, operating in **three distinct modes** that can run simultaneously:

1. **🔧 Leverancier (Service Provider)** - Accept external opdrachten from clients
2. **📋 Opdrachtgever (Client Creator)** - Create opdrachten for other companies to fulfill
3. **👥 Werkgever (Internal Employer)** - Manage internal team for direct assignments

This multi-modal approach allows companies to maximize revenue streams while efficiently managing their security workforce.

## 🎭 Three Operational Modes

### Mode 1: Leverancier (Service Provider)
**"We provide security services to external clients"**

Companies browse available external opdrachten and deploy their teams to fulfill client needs.

### Mode 2: Opdrachtgever (Client Creator)
**"We have clients who need security and subcontract to other companies"**

Companies create opdrachten on behalf of their clients, opening them to the marketplace for other security companies or freelancers to fulfill.

### Mode 3: Werkgever (Internal Employer)
**"We assign our team members directly to internal clients"**

Companies manage their own team assignments, creating internal opdrachten specifically for their employees with `targetAudience: EIGEN_TEAM`.

## 🔄 Complete Bedrijf Workflows

### 🔧 Mode 1: Leverancier (Service Provider) Workflow

#### Phase 1: External Opportunity Discovery

**Navigation Path:**
- Desktop: Sidebar → "Opdrachten" → "Solliciteren"
- Mobile: More tab → "Externe Opdrachten"

```mermaid
graph TD
    A[Open Solliciteren Page] --> B[Browse External Opdrachten]
    B --> C[Apply Advanced Filters]
    C --> D{Filter Criteria}
    D -->|Location| E[Geographic Filtering]
    D -->|Category| F[Skill/Type Filtering]
    D -->|Payment| G[Direct Payment Only]
    E --> H[View Available Opdrachten]
    F --> H
    G --> H
    H --> I[Assess Team Capacity]
```

**Smart Matching System:**
```typescript
interface ExternalOpdracht {
  matchScore: number;        // 0-100 AI-calculated match
  directPayment: boolean;    // Finqle integration available
  urgency: "normal" | "urgent" | "critical";
  requiredBeveiligers: number;
  skills: string[];
  hourlyRate: number;
  totalValue: number;
}
```

#### Phase 2: Team Capacity Assessment

**Automated Team Matching:**
```mermaid
graph TD
    A[View Opdracht Details] --> B[Check Required Skills]
    B --> C[Query Available Team Members]
    C --> D{Skill Match Analysis}
    D -->|Perfect Match| E[Green Indicator: Ready to Apply]
    D -->|Partial Match| F[Amber Indicator: Limited Capacity]
    D -->|No Match| G[Red Indicator: No Suitable Team]
    E --> H[Show Recommended Team]
    F --> I[Show Best Available Options]
    G --> J[Suggest Skill Training/Hiring]
```

**Team Availability Logic:**
```typescript
const availableTeamForOpdracht = (opdracht: ExternalOpdracht) => {
  return teamMembers.filter(member => {
    // Base availability check
    if (!member.available) return false;

    // Skill matching
    const hasMatchingSkills = opdracht.skills.some(skill =>
      member.skills.includes(skill)
    );

    // Location proximity check
    const locationMatch = checkProximity(member.location, opdracht.location);

    // Finqle readiness for direct payment
    const finqleReady = !opdracht.directPayment || member.finqleOnboarded;

    return hasMatchingSkills && locationMatch && finqleReady;
  });
};
```

#### Phase 3: Application Submission

**Team Selection Interface:**
```mermaid
graph TD
    A[Click 'Solliciteren'] --> B[Open Team Selection Modal]
    B --> C[View Eligible Team Members]
    C --> D[Select Required Number]
    D --> E{Validation Check}
    E -->|Valid Selection| F[Submit Application]
    E -->|Invalid| G[Show Error Message]
    F --> H[API Call: POST /api/opdrachten/[id]/solliciteer]
    H --> I[Real-time Broadcast Event]
    I --> J[Application Tracking]
```

**Application API Structure:**
```typescript
// Bedrijf application API
POST /api/opdrachten/{id}/solliciteer
{
  applicationType: "BEDRIJF",
  bedrijfId: string,
  selectedTeamMembers: string[],
  proposedRate?: number,     // Optional counter-offer
  coverLetter?: string,      // Company introduction
  directPaymentRequested: boolean
}

// Response with credit check
{
  success: true,
  data: {
    sollicitatieId: string,
    creditPreApproved: boolean,
    estimatedPayment: number,
    teamMembersConfirmed: string[]
  }
}
```

#### Phase 4: Assignment Acceptance & Deployment

**Acceptance Workflow:**
```mermaid
graph TD
    A[Application Accepted] --> B[Real-time Notification]
    B --> C[Navigate to Active Opdrachten]
    C --> D[Review Assignment Details]
    D --> E[Finalize Team Assignments]
    E --> F[Brief Team Members]
    F --> G[Deploy to Location]
    G --> H[Monitor Performance]
    H --> I[Submit Timesheets]
    I --> J[Process Payment]
```

**Assignment Management API:**
```typescript
// Accept external opdracht
POST /api/opdrachten/{id}/accept
{
  bedrijfId: string,
  finalTeamMembers: string[],
  startDate: Date,
  specialInstructions?: string
}

// Assignment tracking
GET /api/bedrijf/assignments/active
{
  success: true,
  data: {
    activeAssignments: [{
      opdrachtId: string,
      client: string,
      location: string,
      assignedTeam: TeamMember[],
      status: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED",
      finqlePaymentStatus: "PENDING" | "APPROVED" | "PAID"
    }]
  }
}
```

### 📋 Mode 2: Opdrachtgever (Client Creator) Workflow

#### Phase 1: Client Requirement Analysis

**Client Onboarding Process:**
```mermaid
graph TD
    A[Client Contact] --> B[Security Needs Assessment]
    B --> C[Site Survey & Risk Analysis]
    C --> D[Service Proposal Creation]
    D --> E[Client Approval]
    E --> F[Finqle Credit Check]
    F --> G[Contract Signing]
    G --> H[Opdracht Creation]
```

#### Phase 2: Opdracht Creation

**Navigation Path:**
- Desktop: Sidebar → "Opdrachten" → "Plaatsen"
- Mobile: More tab → "Nieuwe Opdracht"

**Comprehensive Opdracht Builder:**
```typescript
interface OpdrachtCreationForm {
  // Basic Information
  title: string;
  description: string;
  category: "evenement" | "object" | "receptie" | "surveillance" | "vip";
  location: string;
  hourlyRate: number;

  // Shift Configuration
  shifts: [{
    date: Date;
    startTime: string;
    endTime: string;
    beveiligers: number;
  }];

  // Requirements
  requiredSkills: string[];
  additionalRequirements: string;

  // Targeting
  targetAudience: "ALLEEN_BEDRIJVEN" | "ALLEEN_ZZP" | "BEIDEN";
  directZZPAllowed: boolean;

  // Payment Settings
  enableDirectPayment: boolean;
  autoAccept: boolean;
  maxApplications?: number;
}
```

**Smart Pricing Calculator:**
```mermaid
graph TD
    A[Enter Base Rate] --> B[Calculate Shift Totals]
    B --> C[Apply Market Multipliers]
    C --> D{Rate Validation}
    D -->|Below Market| E[Warning: Low Rate Alert]
    D -->|Above Market| F[Warning: High Rate Alert]
    D -->|Market Rate| G[Confirmed: Competitive Rate]
    E --> H[Suggest Market Rate]
    F --> I[Confirm Premium Positioning]
    G --> J[Proceed to Publish]
```

#### Phase 3: Application Management

**Application Review Dashboard:**
```mermaid
graph TD
    A[Receive Applications] --> B[View Applicant Profiles]
    B --> C[Compare Team Qualifications]
    C --> D[Check References & Ratings]
    D --> E[Interview/Contact Process]
    E --> F{Selection Decision}
    F -->|Accept| G[Assign Opdracht]
    F -->|Reject| H[Send Feedback]
    G --> I[Coordinate Deployment]
    H --> J[Update Application Status]
```

**Application Management APIs:**
```typescript
// View applications for created opdracht
GET /api/bedrijf/opdrachten/{id}/sollicitaties
{
  success: true,
  data: {
    applications: [{
      id: string,
      applicantType: "BEDRIJF" | "ZZP",
      applicantProfile: BedrijfProfile | ZZPProfile,
      proposedTeam: TeamMember[],
      coverLetter: string,
      applicationDate: Date,
      status: "PENDING" | "ACCEPTED" | "REJECTED"
    }]
  }
}

// Accept/reject applications
POST /api/opdrachten/{id}/applications/{applicationId}/respond
{
  decision: "ACCEPT" | "REJECT",
  feedback?: string,
  counterOffer?: {
    rate: number,
    conditions: string
  }
}
```

### 👥 Mode 3: Werkgever (Internal Employer) Workflow

#### Phase 1: Team Management

**Navigation Path:**
- Desktop: Sidebar → "Team" → "Management"
- Mobile: More tab → "Team Beheer"

**Comprehensive Team Dashboard:**
```typescript
interface TeamMember {
  // Personal Information
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;

  // Professional Details
  role: "Beveiliger" | "Senior Beveiliger" | "Teamleider" | "Supervisor";
  status: "actief" | "inactief" | "verlof";
  employmentType: "VAST" | "FREELANCE" | "TIJDELIJK";

  // Finqle Integration
  finqleStatus: "onboarded" | "pending" | "not_started";
  finqleMerchantId?: string;

  // Compliance & Documentation
  documents: [{
    type: "VOG" | "Diploma Beveiliging" | "EHBO" | "BHV" | "Leidinggevende";
    status: "geldig" | "verloopt" | "verlopen";
    expiryDate?: Date;
    documentUrl?: string;
  }];

  // Skills & Performance
  skills: string[];
  certifications: string[];
  performance: {
    rating: number;           // 1-5 star rating
    completedShifts: number;
    hoursWorked: number;
    lastShift?: Date;
    clientFeedback: number;   // Average client satisfaction
  };

  // Availability
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  preferredShifts: "DAG" | "AVOND" | "NACHT" | "FLEXIBEL";
}
```

#### Phase 2: Internal Assignment Creation

**Direct Team Assignment Process:**
```mermaid
graph TD
    A[Identify Staffing Need] --> B[Create Internal Opdracht]
    B --> C[Set targetAudience: EIGEN_TEAM]
    C --> D[Select Specific Team Members]
    D --> E[Define Assignment Details]
    E --> F[Brief Selected Team]
    F --> G[Deploy Team]
    G --> H[Monitor Performance]
    H --> I[Process Internal Payroll]
```

**Internal Assignment API:**
```typescript
// Create internal team assignment
POST /api/bedrijf/opdrachten/internal
{
  title: string,
  description: string,
  client: string,            // Internal client reference
  location: string,
  shifts: ShiftRequirement[],
  assignedTeamMembers: string[],
  specialInstructions?: string,
  internalRate: number,      // Different from market rate
  targetAudience: "EIGEN_TEAM",
  creatorType: "BEDRIJF",
  creatorBedrijfId: string
}
```

#### Phase 3: Performance & Payroll Management

**Team Performance Dashboard:**
```mermaid
graph TD
    A[Track Team Performance] --> B[Monitor KPIs]
    B --> C{Performance Analysis}
    C -->|Excellent| D[Recognition & Bonuses]
    C -->|Good| E[Continue Monitoring]
    C -->|Needs Improvement| F[Training Plans]
    C -->|Poor| G[Performance Improvement Plan]
    D --> H[Update Performance Records]
    E --> H
    F --> I[Skill Development Programs]
    G --> J[Formal Review Process]
    I --> H
    J --> K{Improvement Shown?}
    K -->|Yes| H
    K -->|No| L[Consider Employment Actions]
```

## 🔗 API Architecture for Multi-Mode Operations

### Unified Bedrijf Dashboard API

```typescript
// Get comprehensive bedrijf dashboard data
GET /api/bedrijf/dashboard
{
  success: true,
  data: {
    // Mode 1: Leverancier metrics
    serviceProvider: {
      activeExternalOpdrachten: number,
      pendingApplications: number,
      monthlyRevenue: number,
      teamUtilization: number,
      averageRating: number
    },

    // Mode 2: Opdrachtgever metrics
    clientServices: {
      activeCreatedOpdrachten: number,
      pendingApplicationsReceived: number,
      clientSatisfaction: number,
      markupRevenue: number
    },

    // Mode 3: Werkgever metrics
    teamManagement: {
      totalTeamMembers: number,
      activeMembers: number,
      documentsExpiring: number,
      finqleOnboardingPending: number,
      averageTeamRating: number
    },

    // Unified metrics
    financials: {
      totalMonthlyRevenue: number,
      pendingPayments: number,
      finqleCreditAvailable: number,
      profitMargin: number
    }
  }
}
```

### Mode-Specific API Patterns

```typescript
// Mode 1: Service Provider APIs
GET    /api/bedrijf/opdrachten/external           // Browse external opportunities
POST   /api/bedrijf/opdrachten/{id}/apply         // Apply with team
GET    /api/bedrijf/assignments/active            // Active external assignments

// Mode 2: Client Creator APIs
POST   /api/bedrijf/opdrachten/create             // Create opdracht for others
GET    /api/bedrijf/opdrachten/created            // Manage created opdrachten
GET    /api/bedrijf/opdrachten/{id}/applications  // Review applications

// Mode 3: Internal Employer APIs
GET    /api/bedrijf/team                          // Team management
POST   /api/bedrijf/team/assign                   // Direct team assignments
GET    /api/bedrijf/payroll                       // Internal payroll management
POST   /api/bedrijf/team/performance              // Performance tracking

// Cross-mode APIs
GET    /api/bedrijf/finqle/status                 // Payment processing status
POST   /api/bedrijf/finqle/onboard                // Finqle integration setup
GET    /api/bedrijf/analytics                     // Cross-mode analytics
```

## 💳 Finqle Payment Integration

### Multi-Mode Payment Flows

**Mode 1 (Leverancier): Receiving Payments**
```mermaid
graph TD
    A[Complete External Assignment] --> B[Submit Team Hours]
    B --> C[Client Approves Hours]
    C --> D[Finqle Processes Payment]
    D --> E{Direct Payment?}
    E -->|Yes| F[24-hour Payment]
    E -->|No| G[Weekly Batch Payment]
    F --> H[Distribute to Team Members]
    G --> H
    H --> I[Platform Fee Deduction]
    I --> J[Net Revenue to Company]
```

**Mode 2 (Opdrachtgever): Making Payments**
```mermaid
graph TD
    A[Opdracht Completed] --> B[Review Submitted Hours]
    B --> C[Approve Hours]
    C --> D[Check Finqle Credit]
    D --> E{Sufficient Credit?}
    E -->|Yes| F[Process Payment]
    E -->|No| G[Request Credit Increase]
    G --> F
    F --> H[Payment to Service Provider]
    H --> I[Invoice Client]
    I --> J[Markup Revenue Collection]
```

**Mode 3 (Werkgever): Internal Payroll**
```mermaid
graph TD
    A[Team Hours Submitted] --> B[Internal Approval Process]
    B --> C[Finqle Payroll Integration]
    C --> D[Direct Payment to Team]
    D --> E[Tax & Compliance Processing]
    E --> F[Payroll Records Update]
```

### Payment Status Tracking

```typescript
// Unified payment dashboard
GET /api/bedrijf/payments/dashboard
{
  success: true,
  data: {
    incoming: {
      pendingFromClients: number,
      processingPayments: number,
      expectedThisWeek: number
    },
    outgoing: {
      owedToTeam: number,
      owedToProviders: number,
      payrollScheduled: number
    },
    finqleStatus: {
      creditAvailable: number,
      creditLimit: number,
      directPaymentEnabled: boolean,
      pendingKYC: string[]
    }
  }
}
```

## 📊 Performance Analytics & Optimization

### Cross-Mode KPI Dashboard

**Operational Metrics:**
- **Capacity Utilization**: Team member hours vs available hours
- **Revenue per Mode**: Income breakdown by operational mode
- **Client Satisfaction**: Average ratings across all service types
- **Market Position**: Competitive analysis for rates and win rates

**Financial Performance:**
- **Profit Margin per Mode**: Understanding most profitable operations
- **Cash Flow Analysis**: Payment timing and credit utilization
- **Team ROI**: Revenue generated per team member
- **Growth Trends**: Month-over-month growth by operational mode

### Smart Recommendations Engine

```typescript
interface BedrijfRecommendations {
  capacity: {
    underutilizedTeam: TeamMember[],
    hiringRecommendations: {
      skills: string[],
      urgency: "high" | "medium" | "low",
      marketDemand: number
    }
  },

  market: {
    pricingOptimization: {
      currentRate: number,
      suggestedRate: number,
      confidence: number
    },
    opportunityAlerts: ExternalOpdracht[]
  },

  financial: {
    cashFlowOptimization: string[],
    creditUtilizationAdvice: string,
    profitabilityImprovements: string[]
  }
}
```

## 🚀 Advanced Features & Optimizations

### Smart Team Assignment Algorithm

**AI-Powered Matching:**
```typescript
interface TeamAssignmentAI {
  skillMatching: {
    score: number,
    reasoning: string[],
    alternatives: TeamMember[]
  },

  locationOptimization: {
    travelTime: number,
    travelCost: number,
    carbonFootprint: number
  },

  performancePrediction: {
    expectedRating: number,
    riskFactors: string[],
    successProbability: number
  },

  financialOptimization: {
    profitMargin: number,
    competitivenessScore: number,
    recommendedBid: number
  }
}
```

### Automated Workflow Triggers

**Smart Automation Rules:**
- **Auto-Accept Conditions**: Automatically accept high-match external opdrachten
- **Team Auto-Assignment**: Assign optimal team members based on availability and skills
- **Payment Optimization**: Choose between direct payment and batch processing
- **Document Expiry Alerts**: Automated reminders for team compliance
- **Performance Threshold Alerts**: Notifications for team member performance changes

### Cross-Mode Workflow Integration

**Scenario: Client Needs Exceed Internal Capacity**
```mermaid
graph TD
    A[Large Client Request] --> B[Assess Internal Capacity]
    B --> C{Sufficient Team?}
    C -->|Yes| D[Mode 3: Direct Assignment]
    C -->|Partial| E[Mode 2 + 3: Hybrid Approach]
    C -->|No| F[Mode 2: Full Subcontract]
    E --> G[Assign Available Team]
    E --> H[Create External Opdracht]
    G --> I[Monitor Hybrid Delivery]
    H --> I
    F --> J[Create & Manage External Opdracht]
    D --> K[Direct Team Management]
    I --> L[Unified Client Reporting]
    J --> L
    K --> L
```

## 🔮 Future Enhancements

### Short-term (1-3 months)
- **Mobile Team Management**: Full team management capabilities on mobile
- **Advanced Analytics**: Predictive analytics for demand forecasting
- **Integration APIs**: Connect with existing HR and payroll systems

### Medium-term (3-6 months)
- **AI-Powered Pricing**: Dynamic pricing based on market conditions
- **Advanced Scheduling**: Intelligent team scheduling with conflict resolution
- **Client Portal**: Dedicated client interface for Mode 2 operations

### Long-term (6+ months)
- **Marketplace Expansion**: Additional service categories beyond security
- **International Operations**: Multi-country team and client management
- **Blockchain Integration**: Immutable performance and compliance records

---

*This comprehensive workflow analysis demonstrates the sophisticated multi-modal operation system that enables Bedrijven to maximize their business potential on the SecuryFlex platform, efficiently managing service provision, client relationships, and internal team operations simultaneously.*