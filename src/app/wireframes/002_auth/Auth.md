# SecuryFlex App - Complete Wireframe Documentation

## 1. AUTHENTICATION FLOW

### 1.1 Login Screen (`/login`)
```
┌─────────────────────────────────────┐
│          SecuryFlex Logo            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Email/Username            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Password                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ ] Onthoud mij                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       INLOGGEN              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ──────── OF ──────────            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Inloggen met Google       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Biometrisch inloggen      │   │
│  └─────────────────────────────┘   │
│                                     │
│  Wachtwoord vergeten? | Registreer │
└─────────────────────────────────────┘
```

### 1.2 User Type Selection (`/register/select-type`)
```
┌─────────────────────────────────────┐
│     Kies uw account type           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         ZZP BEVEILIGER       │   │
│  │  👮 Werk als freelancer      │   │
│  │  • Flexibele planning        │   │
│  │  • Direct solliciteren       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      BEVEILIGINGSBEDRIJF    │   │
│  │  🏢 Vind beveiligers         │   │
│  │  • Post vacatures            │   │
│  │  • Beheer teams              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │          KLANT              │   │
│  │  🔒 Boek beveiligingsdiensten│   │
│  │  • Vraag offertes aan       │   │
│  │  • Direct contact            │   │
│  └─────────────────────────────┘   │
│                                     │
│         [Terug naar login]         │
└─────────────────────────────────────┘
```

### 1.3 Progressive Registration (`/register/progressive`)
```
┌─────────────────────────────────────┐
│    Stap 1/4: Basis Informatie      │
│    [====     ]                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Voornaam                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Achternaam                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Email                      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Telefoonnummer             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Wachtwoord                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Vorige]           [Volgende →]   │
└─────────────────────────────────────┘
```

### 1.4 Terms Acceptance (`/terms-acceptance`)
```
┌─────────────────────────────────────┐
│      Algemene Voorwaarden          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                               │   │
│  │   [Scrollbare tekst met      │   │
│  │    algemene voorwaarden]     │   │
│  │                               │   │
│  │                               │   │
│  │                               │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ ] Ik accepteer de voorwaarden   │
│  [ ] Ik ga akkoord met privacy     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      ACCEPTEREN & DOORGAAN   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 1.5 Progressive Registration Stap 2/4 - Verificatie (`/register/verification`)
```
┌─────────────────────────────────────┐
│    Stap 2/4: Verificatie           │
│    [========     ]                  │
│                                     │
│  📧 Email verificatie               │
│  ┌─────────────────────────────┐   │
│  │   Voer 6-cijferige code in  │   │
│  │   [□][□][□][□][□][□]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Code niet ontvangen?              │
│  Opnieuw verzenden (00:47)         │
│                                     │
│  📱 Telefoonnummer verificatie     │
│  ┌─────────────────────────────┐   │
│  │   SMS code: [□][□][□][□]    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [← Vorige]         [Volgende →]   │
└─────────────────────────────────────┘
```

### 1.6 Progressive Registration Stap 3/4 - Rol Specifiek (`/register/role-specific`)

#### Voor ZZP Beveiligers:
```
┌─────────────────────────────────────┐
│    Stap 3/4: Beveiligingsgegevens  │
│    [============ ]                  │
│                                     │
│  🛡️ WPBR Registratie               │
│  ┌─────────────────────────────┐   │
│  │   WPBR Nummer               │   │
│  └─────────────────────────────┘   │
│                                     │
│  📋 Certificaten                   │
│  ┌─────────────────────────────┐   │
│  │ ☑ VCA Certificaat           │   │
│  │   Vervaldatum: [dd/mm/yyyy] │   │
│  │   [📎 Upload bestand]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ☑ EHBO Certificaat          │   │
│  │   Vervaldatum: [dd/mm/yyyy] │   │
│  │   [📎 Upload bestand]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  📍 Werkgebied                     │
│  ┌─────────────────────────────┐   │
│  │ ☑ Noord-Holland             │   │
│  │ ☐ Zuid-Holland              │   │
│  │ ☐ Utrecht                   │   │
│  │ ☐ Landelijk                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  [← Vorige]         [Volgende →]   │
└─────────────────────────────────────┘
```

#### Voor Beveiligingsbedrijven:
```
┌─────────────────────────────────────┐
│    Stap 3/4: Bedrijfsgegevens      │
│    [============ ]                  │
│                                     │
│  🏢 Bedrijfsinformatie             │
│  ┌─────────────────────────────┐   │
│  │   Bedrijfsnaam              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   KVK Nummer                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   BTW Nummer                │   │
│  └─────────────────────────────┘   │
│                                     │
│  🛡️ WPBR Bedrijfsregistratie       │
│  ┌─────────────────────────────┐   │
│  │   WPBR Bedrijfsnummer       │   │
│  └─────────────────────────────┘   │
│                                     │
│  📍 Vestigingsadres                │
│  ┌─────────────────────────────┐   │
│  │   Straat + huisnummer       │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │   Postcode                  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │   Plaats                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [← Vorige]         [Volgende →]   │
└─────────────────────────────────────┘
```

#### Voor Klanten:
```
┌─────────────────────────────────────┐
│    Stap 3/4: Organisatiegegevens   │
│    [============ ]                  │
│                                     │
│  🏢 Organisatie Type               │
│  ◉ Bedrijf                         │
│  ○ Overheidsinstantie             │
│  ○ Zorginstelling                 │
│  ○ Onderwijsinstelling            │
│  ○ Evenementenorganisatie          │
│  ○ Particulier                     │
│                                     │
│  📋 Bedrijfsgegevens              │
│  ┌─────────────────────────────┐   │
│  │   Organisatienaam           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   KVK/RSIN Nummer (optie)   │   │
│  └─────────────────────────────┘   │
│                                     │
│  📍 Locaties waar beveiliging      │
│      nodig kan zijn                │
│  ┌─────────────────────────────┐   │
│  │   Hoofdlocatie              │   │
│  │   Straat + nummer           │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │   Postcode + plaats         │   │
│  └─────────────────────────────┘   │
│                                     │
│  [+ Voeg locatie toe]              │
│                                     │
│  [← Vorige]         [Volgende →]   │
└─────────────────────────────────────┘
```

### 1.7 Progressive Registration Stap 4/4 - Finalisatie (`/register/finalize`)
```
┌─────────────────────────────────────┐
│    Stap 4/4: Account Finalisatie   │
│    [================]               │
│                                     │
│  📊 Samenvatting van je gegevens   │
│  ┌─────────────────────────────┐   │
│  │ 👤 Jan van der Berg         │   │
│  │ 📧 jan@example.com          │   │
│  │ 📱 +31 6 12345678           │   │
│  │ 👮 ZZP Beveiliger           │   │
│  │ 🛡️ WPBR: 123456789         │   │
│  │ ✅ VCA Geldig tot 15/06/25  │   │
│  │ ✅ EHBO Geldig tot 22/03/26 │   │
│  └─────────────────────────────┘   │
│                                     │
│  🔔 Notificatie-voorkeuren         │
│  ┌─────────────────────────────┐   │
│  │ ☑ Nieuwe shifts via email   │   │
│  │ ☑ Push notificaties app     │   │
│  │ ☑ SMS bij urgente shifts    │   │
│  │ ☐ Marketing communicatie    │   │
│  └─────────────────────────────┘   │
│                                     │
│  🔐 Beveiliging                   │
│  ┌─────────────────────────────┐   │
│  │ ☑ Biometrisch inloggen      │   │
│  │   activeren (aanbevolen)     │   │
│  └─────────────────────────────┘   │
│                                     │
│  [← Vorige]    [ACCOUNT AANMAKEN]  │
└─────────────────────────────────────┘
```

### 1.8 Organization Selection (Multi-tenant) (`/organization-select`)
```
┌─────────────────────────────────────┐
│    Selecteer uw organisatie         │
│                                     │
│  Je hebt toegang tot meerdere      │
│  organisaties. Kies er één:        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏢 Securitas Nederland      │   │
│  │    Beveiligingsbedrijf      │   │
│  │    Amsterdam                │   │
│  │         [SELECTEER →]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏢 G4S Nederland           │   │
│  │    Beveiligingsbedrijf      │   │
│  │    Rotterdam                │   │
│  │         [SELECTEER →]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ➕ Nieuwe organisatie       │   │
│  │    aanmaken                 │   │
│  │         [AANMAKEN →]        │   │
│  └─────────────────────────────┘   │
│                                     │
│         [← Terug naar login]       │
└─────────────────────────────────────┘
```

---

## 2. MOBILE WIREFRAMES (375px)

### 2.1 Mobile Login Screen
```
┌─────────────────────┐
│  [☰]    SecuryFlex  │
├─────────────────────┤
│                     │
│   🛡️ SecuryFlex     │
│   Veilige toegang   │
│                     │
│ ┌─────────────────┐ │
│ │ Email/Username  │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Wachtwoord      │ │
│ └─────────────────┘ │
│                     │
│ [ ] Onthoud mij     │
│                     │
│ ┌─────────────────┐ │
│ │    INLOGGEN     │ │
│ └─────────────────┘ │
│                     │
│ ───── OF ─────     │
│                     │
│ ┌─────────────────┐ │
│ │ 🔵 Google Login │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 🔒 Biometrisch  │ │
│ └─────────────────┘ │
│                     │
│ Wachtwoord vergeten?│
│     REGISTREER      │
└─────────────────────┘
```

### 2.2 Mobile User Type Selection
```
┌─────────────────────┐
│     Account Type    │
├─────────────────────┤
│                     │
│ ┌─────────────────┐ │
│ │      👮         │ │
│ │ ZZP BEVEILIGER  │ │
│ │                 │ │
│ │ • Flexibel werk │ │
│ │ • Snelle betaling│ │
│ │ • GPS check-in  │ │
│ │                 │ │
│ │   [KIES →]      │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │      🏢         │ │
│ │  BEVEILIG.BEDR. │ │
│ │                 │ │
│ │ • Vind talent  │ │
│ │ • Team beheer   │ │
│ │ • Live tracking │ │
│ │                 │ │
│ │   [KIES →]      │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │      🔒         │ │
│ │     KLANT       │ │
│ │                 │ │
│ │ • Boek service  │ │
│ │ • Live monitoring│ │
│ │ • Direct contact│ │
│ │                 │ │
│ │   [KIES →]      │ │
│ └─────────────────┘ │
│                     │
│    [← Terug]        │
└─────────────────────┘
```

### 2.3 Mobile Progressive Registration (Voorbeeld Stap 1)
```
┌─────────────────────┐
│ Stap 1/4: Basis     │
│ [████    ] 25%      │
├─────────────────────┤
│                     │
│ ┌─────────────────┐ │
│ │ Voornaam        │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Achternaam      │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Email           │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ +31 Telefoon    │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Wachtwoord      │ │
│ │ [👁]            │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Bevestig ww     │ │
│ │ [👁]            │ │
│ └─────────────────┘ │
│                     │
│ [← Vorige] [Verder]│
└─────────────────────┘
```

### 2.4 Mobile Biometric Authentication Flow
```
┌─────────────────────┐
│  Biometrische       │
│  Authenticatie      │
├─────────────────────┤
│                     │
│       🔒            │
│    TouchID /        │
│     FaceID          │
│                     │
│  Plaats je vinger   │
│  op de sensor of    │
│  kijk in de camera  │
│                     │
│ ┌─────────────────┐ │
│ │                 │ │
│ │     [👆]        │ │
│ │   Scanning...   │ │
│ │                 │ │
│ └─────────────────┘ │
│                     │
│ Problemen?          │
│ Gebruik wachtwoord  │
│                     │
│    [ANNULEREN]      │
└─────────────────────┘
```

---

## 3. ERROR HANDLING & FEEDBACK

### 3.1 Login Error States
```
┌─────────────────────────────────────┐
│          SecuryFlex Logo            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Email/Username            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Password                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  🔴 Verkeerde email of wachtwoord  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       INLOGGEN              │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Wachtwoord vergeten?]            │
└─────────────────────────────────────┘
```

### 3.2 Registration Validation Errors
```
┌─────────────────────────────────────┐
│    Stap 1/4: Basis Informatie      │
│    [====     ]                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Voornaam                   │   │
│  └─────────────────────────────┘   │
│  ✅ Geldig                         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   jan@                      │   │
│  └─────────────────────────────┘   │
│  🔴 Voer een geldig emailadres in  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   ••••••                    │   │
│  └─────────────────────────────┘   │
│  🔴 Wachtwoord moet minimaal 8     │
│     tekens bevatten                │
│                                     │
│  [Vorige]           [Volgende →]   │
└─────────────────────────────────────┘
```

### 3.3 WPBR Verification Error
```
┌─────────────────────────────────────┐
│    WPBR Verificatie Fout           │
│                                     │
│  🔴 WPBR nummer niet gevonden       │
│                                     │
│  Het ingevoerde WPBR nummer        │
│  (123456789) is niet geldig        │
│  of niet actief.                   │
│                                     │
│  Controleer het nummer en          │
│  probeer opnieuw, of neem          │
│  contact op met de helpdesk.       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   WPBR Nummer               │   │
│  └─────────────────────────────┘   │
│                                     │
│  [OPNIEUW PROBEREN]                │
│  [HELPDESK CONTACT]                │
└─────────────────────────────────────┘
```

---

## 4. LOADING STATES & PROGRESS

### 4.1 Registration Progress Indicator
```
┌─────────────────────────────────────┐
│  Account wordt aangemaakt...        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✅ Basis gegevens           │   │
│  │ ✅ Email verificatie        │   │
│  │ ✅ WPBR controle           │   │
│  │ 🔄 Account activatie...     │   │
│  │ ⏳ Welkom email             │   │
│  └─────────────────────────────┘   │
│                                     │
│          ⏳ Bezig...               │
│                                     │
│  Dit kan even duren...             │
└─────────────────────────────────────┘
```

### 4.2 Biometric Setup Loading
```
┌─────────────────────────────────────┐
│   Biometrische toegang instellen   │
│                                     │
│         🔄 Configureren...          │
│                                     │
│  Je biometrische gegevens worden   │
│  veilig geconfigureerd.            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ████████████████████   85%  │   │
│  └─────────────────────────────┘   │
│                                     │
│  • TouchID sensor getest ✅        │
│  • Encryptie toegepast ✅          │
│  • Veiligheid gecontroleerd ✅     │
│  • Finaliseren...                  │
└─────────────────────────────────────┘
```

---

## 5. DUTCH COMPLIANCE & SECURITY FEATURES

### 5.1 AVG/GDPR Compliance Screen
```
┌─────────────────────────────────────┐
│      Privacy & Gegevensbescherming │
│                                     │
│  🛡️ Jouw privacy is belangrijk      │
│                                     │
│  SecuryFlex respecteert je privacy │
│  en volgt de AVG wetgeving.        │
│                                     │
│  📋 Wij verzamelen:                │
│  • Naam en contactgegevens         │
│  • WPBR en certificatie info       │
│  • GPS locatie tijdens diensten    │
│  • Communicatie met klanten        │
│                                     │
│  📋 Wij delen NOOIT:               │
│  • Persoonlijke gegevens           │
│  • Locatie buiten diensten         │
│  • Privé communicatie              │
│                                     │
│  [ ] Ik ga akkoord met privacy     │
│      voorwaarden                   │
│  [ ] Ik ga akkoord met AVG         │
│      verwerking                    │
│                                     │
│  [PRIVACY BELEID LEZEN]            │
│  [ACCEPTEREN & DOORGAAN]           │
└─────────────────────────────────────┘
```

### 5.2 WPBR Compliance Verification
```
┌─────────────────────────────────────┐
│      WPBR Compliance Check         │
│                                     │
│  🔍 Verificatie in uitvoering...    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ WPBR Status: ✅ ACTIEF      │   │
│  │ Nummer: 987654321           │   │
│  │ Geldig tot: 15/08/2025      │   │
│  │ Type: Beveiligingsbeambte   │   │
│  │ Specialisaties:             │   │
│  │ • Objectbeveiliging         │   │
│  │ • Evenementenbeveiliging    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ✅ WPBR verificatie geslaagd      │
│                                     │
│  Je bent gecertificeerd als        │
│  beveiligingsprofessional volgens  │
│  Nederlandse wetgeving.            │
│                                     │
│        [DOORGAAN →]                │
└─────────────────────────────────────┘
```

### 5.3 Certificate Upload & Validation
```
┌─────────────────────────────────────┐
│      Certificaten Uploaden         │
│                                     │
│  📋 VCA Certificaat                │
│  ┌─────────────────────────────┐   │
│  │ 📎 vca-certificaat.pdf      │   │
│  │    Upload: ✅ Voltooid      │   │
│  │    Status: 🔄 Valideren...  │   │
│  └─────────────────────────────┘   │
│                                     │
│  📋 EHBO Certificaat               │
│  ┌─────────────────────────────┐   │
│  │ [📤 Sleep bestand hier]     │   │
│  │     of klik om te uploaden  │   │
│  │                             │   │
│  │ Toegestaan: PDF, JPG, PNG   │   │
│  │ Max: 5MB                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ℹ️ Certificaten worden automatisch│
│     gevalideerd met officiële      │
│     databases.                     │
│                                     │
│  [← Vorige]         [Volgende →]   │
└─────────────────────────────────────┘
```

---

## 6. SUCCESS STATES & COMPLETION

### 6.1 Registration Success
```
┌─────────────────────────────────────┐
│          🎉 Welkom bij SecuryFlex!  │
│                                     │
│  ✅ Je account is succesvol         │
│     aangemaakt                      │
│                                     │
│  📧 Bevestigingsmail verzonden     │
│     naar jan@example.com           │
│                                     │
│  🛡️ WPBR verificatie voltooid      │
│                                     │
│  🎯 Je kunt nu:                     │
│  • Solliciteren op beschikbare     │
│    beveiligingsopdrachten          │
│  • Je profiel verder aanvullen     │
│  • GPS check-in instellen          │
│  • Betalingsgegevens toevoegen     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    START MET SECURYFLEX     │   │
│  └─────────────────────────────┘   │
│                                     │
│         [Later inloggen]           │
└─────────────────────────────────────┘
```

### 6.2 Login Success Redirect Loading
```
┌─────────────────────────────────────┐
│           Inloggen geslaagd         │
│                                     │
│  👋 Welkom terug, Jan!             │
│                                     │
│         🔄 Dashboard laden...       │
│                                     │
│  ✅ Authenticatie voltooid         │
│  ✅ Sessie gestart                 │
│  🔄 Gebruikersdata laden...        │
│  ⏳ Dashboard voorbereiden...       │
│                                     │
│  Je wordt doorgestuurd naar je     │
│  persoonlijke dashboard...         │
│                                     │
│          ⏳ Bezig...               │
└─────────────────────────────────────┘
```

---

## 7. TECHNICAL SPECIFICATIONS

### 7.1 Performance Requirements
- **Login completion**: < 2 seconds
- **Registration flow**: < 30 seconds total
- **Biometric authentication**: < 1 second
- **WPBR verification**: < 10 seconds
- **Organization switching**: < 1 second
- **File upload (certificates)**: < 5 seconds

### 7.2 Security Features
- **Password requirements**: Minimum 8 characters, mix of letters/numbers/symbols
- **Session timeout**: 24 hours inactive, 7 days remember me
- **Failed login attempts**: 5 attempts → 15 minute lockout
- **Two-factor authentication**: SMS and app-based TOTP
- **Biometric storage**: Local device only, encrypted
- **WPBR data encryption**: AES-256 for all certificate data

### 7.3 Dutch Legal Compliance
- **AVG/GDPR compliance**: Full consent management
- **WPBR verification**: Real-time API check with government database
- **Data retention**: 7 years for financial records, 2 years for activity logs
- **Right to be forgotten**: Complete data deletion within 30 days
- **Data portability**: Full export in machine-readable format

### 7.4 Mobile PWA Features
- **Offline capability**: Complete registration form local storage
- **Install prompt**: Custom PWA installation banner
- **Push notifications**: Shift updates, payment confirmations, urgent alerts
- **Background sync**: Upload certificates when connection restored
- **Touch targets**: Minimum 44px for all interactive elements
- **Viewport**: 375px baseline, responsive up to 1920px

### 7.5 Integration Points
- **Clerk Authentication**: Custom user metadata, organization management
- **Supabase Database**: User profiles, organizations, certificates
- **Google Maps API**: Address validation and geocoding
- **WPBR Government API**: Real-time certificate verification
- **Finqle Payment**: Account linking during registration
- **Email Service**: Verification emails, password reset, notifications

### 7.6 Error Handling
- **Network failures**: Graceful degradation, retry mechanisms
- **Validation errors**: Real-time feedback, clear error messages
- **Server errors**: User-friendly error pages, automatic retry
- **File upload errors**: Progressive enhancement, fallback options
- **Certificate validation failures**: Clear next steps, support contact

### 7.7 Analytics & Monitoring
- **Conversion tracking**: Registration completion rates by user type
- **Performance monitoring**: Page load times, API response times
- **Error tracking**: Failed registrations, validation errors
- **User behavior**: Drop-off points, completion patterns
- **A/B testing**: CTA buttons, form layouts, messaging

This comprehensive authentication wireframe now provides production-ready specifications for the Dutch security market with complete mobile support, WPBR compliance, and all necessary features for SecuryFlex's three user types.