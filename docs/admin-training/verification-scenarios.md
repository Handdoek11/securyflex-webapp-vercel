# Document Verificatie Scenario's en Voorbeelden

## Praktische Cases voor Beheerders

---

## Inhoudsopgave

1. [Scenario's: Goedkeuring](#goedkeuring-scenarios)
2. [Scenario's: Afwijzing](#afwijzing-scenarios)
3. [Scenario's: Aanvullende Info](#aanvullende-info-scenarios)
4. [Veelvoorkomende Situaties](#veelvoorkomende-situaties)
5. [Problematische Cases](#problematische-cases)
6. [Communicatie Voorbeelden](#communicatie-voorbeelden)

---

## 1. Scenario's: Goedkeuring {#goedkeuring-scenarios}

### Scenario A1: Perfecte Nieuwe Beveiliger ✅

**Situatie:**
- Naam: Jan de Vries
- Leeftijd: 28 jaar
- Documenten: Nederlandse ID, ND-nummer certificaat, VOG-P, SVPB diploma

**Verificatie Resultaat:**
- ✅ ID geldig tot 2029
- ✅ ND-nummer: ND0123456 (actief in database)
- ✅ VOG-P: Geldig tot 2027
- ✅ SVPB diploma: Behaald 2023

**Admin Notitie:**
```
✅ GOEDGEKEURD
- Nederlandse ID geldig tot 15-06-2029
- ND-nummer ND0123456 geverifieerd via Bureau Beveiliging (status: actief)
- VOG-P geldig tot 22-09-2027
- SVPB Diploma Beveiliger behaald 15-03-2023, geverifieerd via SVPB database
- Alle documenten consistent, foto's matchen
- Voldoet aan alle WPBR vereisten
- Verificatie door Stef op 18-12-2024
```

---

### Scenario A2: EU Beveiliger met Specialisatie ✅

**Situatie:**
- Naam: Klaus Müller
- Nationaliteit: Duits
- Documenten: Duits paspoort, Nederlandse verblijfsvergunning, ND-nummer, BOA certificaat

**Verificatie Resultaat:**
- ✅ Duits paspoort geldig
- ✅ Nederlandse verblijfsvergunning (werk toegestaan)
- ✅ ND-nummer actief
- ✅ BOA certificaat domein openbare ruimte

**Admin Notitie:**
```
✅ GOEDGEKEURD
- Duits paspoort geldig tot 12-08-2028
- Nederlandse verblijfsvergunning met werk-toestemming geldig tot 10-05-2026
- ND-nummer ND0789123 geverifieerd (actief)
- BOA certificaat domein openbare ruimte, geldig tot 30-11-2025
- EU nationaliteit + werkvergunning = toegestaan
- Alle verificatiepunten voldaan
- Verificatie door Robert op 18-12-2024
```

---

## 2. Scenario's: Afwijzing {#afwijzing-scenarios}

### Scenario B1: Verlopen VOG-P ❌

**Situatie:**
- Naam: Maria Santos
- Documenten: Nederlandse ID (geldig), ND-nummer (actief), VOG-P (verlopen), SVPB diploma

**Verificatie Resultaat:**
- ✅ ID geldig
- ✅ ND-nummer actief
- ❌ VOG-P verlopen sinds 6 maanden
- ✅ SVPB diploma geldig

**Admin Notitie:**
```
❌ AFGEWEZEN
- Reden: VOG-P verlopen per 15-06-2024
- Details: VOG-P is verplicht en moet geldig zijn voor werkzaamheden in de beveiliging
- Actie vereist: Nieuwe VOG-P aanvragen bij Justis/gemeente
- Overige documenten zijn wel in orde
- Herregistratie mogelijk na upload geldige VOG-P
- Verificatie door Stef op 18-12-2024
```

**E-mail naar gebruiker:** Automatisch verzonden met instructies voor nieuwe VOG-P aanvraag.

---

### Scenario B2: Onduidelijke Documentkwaliteit ❌

**Situatie:**
- Naam: Ahmed El-Hassan
- Probleem: Documenten slecht gescand, tekst onleesbaar
- Documenten: ID (onduidelijk), ND-nummer (wazig), certificaten (afgesneden)

**Admin Notitie:**
```
❌ AFGEWEZEN
- Reden: Documenten zijn onduidelijk en onleesbaar
- Details:
  * ID-kaart: Tekst wazig, geen cijfers/letters te lezen
  * ND-nummer: Scan te donker, nummer niet zichtbaar
  * Certificaten: Documenten afgesneden, incomplete informatie
- Actie vereist: Upload nieuwe, heldere scans van alle documenten
- Tips: Gebruik goede verlichting, scan volledig document, controleer leesbaarheid
- Verificatie door Robert op 18-12-2024
```

---

### Scenario B3: Verdacht van Vervalsing ❌

**Situatie:**
- Naam: "John Smith"
- Probleem: Document vertoont tekenen van bewerking
- Issues: Verschillende lettertypen, kleurverschillen, pixelation

**Admin Notitie:**
```
❌ AFGEWEZEN
- Reden: Document vertoont tekenen van bewerking of vervalsing
- Details:
  * Inconsistente lettertypen binnen document
  * Kleurverschillen suggeren copy-paste bewerking
  * Pixels rond tekstgedeelten wijzen op digitale bewerking
- Actie vereist: Upload origineel, onbewerkt document
- NB: Alleen originele documenten worden geaccepteerd
- Bij herhaling zelfde probleem: Account wordt gemarkeerd voor review
- Verificatie door Stef op 18-12-2024
```

**Escalatie:** Dit geval wordt ook doorgegeven aan het juridische team voor mogelijke fraudeonderzoek.

---

## 3. Scenario's: Aanvullende Info {#aanvullende-info-scenarios}

### Scenario C1: Borderline Vervaldatum ⚠️

**Situatie:**
- Naam: Lisa van den Berg
- Issue: VOG-P verloopt over 2 weken
- Andere documenten: Allemaal in orde

**Admin Notitie:**
```
⚠️ AANVULLENDE INFO NODIG
- Issue: VOG-P verloopt over 14 dagen (31-12-2024)
- Gewenst: Bevestiging of nieuwe VOG-P al is aangevraagd
- Details:
  * Huidige VOG-P nog geldig maar verloopt binnenkort
  * Aanvraag nieuwe VOG-P duurt 4-6 weken
  * Werkzaamheden mogelijk beperkt na vervaldatum
- Deadline: Reactie binnen 3 werkdagen gewenst
- Opties: Upload bevestiging aanvraag nieuwe VOG-P of upload nieuwe VOG-P
- Verificatie door Robert op 18-12-2024
```

---

### Scenario C2: Externe Verificatie Tijdelijk Niet Beschikbaar ⚠️

**Situatie:**
- Naam: Tom Janssen
- Issue: Bureau Beveiliging website tijdelijk offline
- Documenten: Lijken correct maar ND-nummer kan niet geverifieerd worden

**Admin Notitie:**
```
⚠️ AANVULLENDE INFO NODIG
- Issue: ND-nummer verificatie tijdelijk niet mogelijk
- Gewenst: 24-48 uur wachten voor externe verificatie
- Details:
  * ND-nummer ND0456789 format klopt
  * Bureau Beveiliging website tijdelijk niet bereikbaar
  * Overige documenten zijn goedgekeurd
  * Verificatie wordt hervat zodra website beschikbaar is
- Actie: Geen actie van gebruiker vereist
- Status wordt automatisch bijgewerkt na externe verificatie
- Verificatie door Stef op 18-12-2024
```

---

## 4. Veelvoorkomende Situaties {#veelvoorkomende-situaties}

### Situatie 1: Rijbewijs als Identiteitsbewijs

**Scenario:**
Gebruiker uploadt rijbewijs in plaats van ID-kaart of paspoort.

**Aanpak:**
```
⚠️ AANVULLENDE INFO NODIG
- Issue: Rijbewijs geüpload als identiteitsbewijs
- Gewenst: Nederlandse ID-kaart of paspoort
- Details: Rijbewijs is geldig identiteitsdocument maar voor volledigheid
  hebben wij voorkeur voor ID-kaart of paspoort
- Opties:
  * Upload Nederlandse ID-kaart of paspoort, OF
  * Bevestig dat rijbewijs enige beschikbare ID is
- Rijbewijs wordt geaccepteerd als geen andere ID beschikbaar
```

### Situatie 2: Meerdere SVPB Certificaten

**Scenario:**
Beveiliger heeft meerdere specialisaties (Event Security + Winkelsurveillance).

**Aanpak:**
- Verifieer alle certificaten individueel
- Noteer alle specialisaties in admin notities
- Goedkeuring als alle certificaten geldig zijn

**Admin Notitie Voorbeeld:**
```
✅ GOEDGEKEURD
- SVPB Event Security certificaat: EV2023-4567, geldig
- SVPB Winkelsurveillance certificaat: WS2023-8901, geldig
- Beide certificaten geverifieerd via SVPB database
- Meerdere specialisaties: breed inzetbaar
```

### Situatie 3: Naam Wijzigingen (Huwelijk/Scheiding)

**Scenario:**
Identiteitsdocument heeft andere naam dan certificaten.

**Aanpak:**
```
⚠️ AANVULLENDE INFO NODIG
- Issue: Naam op ID verschilt van naam op certificaten
- ID: "Maria Jansen-Peters", Certificaten: "Maria Peters"
- Gewenst: Bewijs naamwijziging (huwelijksakte, uittreksel GBA)
- Details: Voor verificatie hebben wij bevestiging nodig dat het dezelfde persoon betreft
```

---

## 5. Problematische Cases {#problematische-cases}

### Case 1: Systematische Fraude

**Signalen:**
- Meerdere accounts met vergelijkbare vervalsingen
- Zelfde IP-adres, verschillende namen
- Identieke bewerkingspatronen

**Actie:**
1. Document afwijzen
2. Account markeren voor onderzoek
3. Escaleren naar juridisch team
4. Documenteren alle bevindingen

### Case 2: Buitenlandse Documenten (Niet-EU)

**Scenario:**
Amerikaanse beveiliger met buitenlandse certificaten.

**Aanpak:**
```
❌ AFGEWEZEN
- Reden: Nederlandse WPBR vereisten niet voldaan
- Details: Amerikaanse beveiligingscertificaten niet erkend in Nederland
- Actie vereist:
  * Nederlandse ND-nummer verkrijgen
  * SVPB opleiding volgen
  * Nederlandse VOG-P aanvragen
- Werkvergunning alleen niet voldoende voor beveiligingswerk
```

### Case 3: Onduidelijke Wetgeving

**Scenario:**
Nieuwe certificaten of onduidelijke regelgeving.

**Escalatie Procedure:**
1. Document op "IN_REVIEW" zetten
2. Juridisch team consulteren
3. Officiële bronnen raadplegen
4. Beslissing documenteren voor toekomstige cases

---

## 6. Communicatie Voorbeelden {#communicatie-voorbeelden}

### Professionele Afwijzing

**Template:**
```
Beste [Naam],

Bedankt voor het uploaden van uw documenten voor verificatie.

Na zorgvuldige beoordeling moeten wij uw [documenttype] helaas afwijzen om de volgende reden:

[Specifieke reden]

Om uw registratie te voltooien, verzoeken wij u:
[Specifieke acties]

Voor vragen over dit besluit of hulp bij het uploaden van nieuwe documenten,
kunt u contact opnemen via support@securyflex.com.

Met vriendelijke groet,
SecuryFlex Verificatie Team
```

### Vriendelijke Follow-up

**Template voor aanvullende info:**
```
Beste [Naam],

Wij hebben uw documenten ontvangen en zijn bezig met de verificatie.

Voor een snelle afhandeling hebben wij nog de volgende informatie nodig:
[Specifieke vraag/actie]

U kunt dit uploaden via uw dashboard onder "Mijn Documenten".

Wij verwachten uw reactie binnen [tijdsframe] zodat we uw verificatie
kunnen voltooien.

Bij vragen staan wij klaar om te helpen.

Met vriendelijke groet,
SecuryFlex Verificatie Team
```

### Positieve Goedkeuring

**Template:**
```
Beste [Naam],

Goed nieuws! Uw documenten zijn succesvol geverifieerd en goedgekeurd.

U kunt nu volledig gebruik maken van alle SecuryFlex functies en
solliciteren op beschikbare beveiligingsopdrachten.

Welkom bij SecuryFlex!

Met vriendelijke groet,
SecuryFlex Verificatie Team
```

---

## Dagelijkse Workflow Tips

### Efficiency Tips:
1. **Batch Verwerking**: Verwerk vergelijkbare documenttypes samen
2. **Externe Verificatie**: Begin hiermee als eerste (kan tijd kosten)
3. **Template Notities**: Gebruik standaard templates, pas aan waar nodig
4. **Snelle Beslissingen**: Obvious goedkeuringen/afwijzingen snel verwerken
5. **Complexe Cases**: Bewaar voor later op de dag wanneer je meer tijd hebt

### Kwaliteitscontrole:
- Dubbel-check externe verificaties
- Review admin notities voor typos
- Zorg voor consistente communicatie-toon
- Log alle afwijkingen van standaard proces

### Time Management:
- **Ochtend**: Urgente/prioritaire cases
- **Middag**: Routine verificaties
- **Eind dag**: Follow-ups en administratie

---

**Voor vragen over specifieke scenario's: Overleg altijd met collega-admin of escaleer naar juridisch team.**

*Versie 1.0 - December 2024*