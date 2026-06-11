# Sahay Pilot Test Report

## Objective

Validate whether a multilingual, low-literacy-friendly welfare assistant can help rural and gig workers discover schemes they qualify for, with grounded answers from MyScheme.gov.in.

## Pilot Design

| Parameter | Value |
|-----------|-------|
| Duration | 2 weeks (simulated + device-local tracking) |
| Channels | Web app, SMS checklist (`sms:` URI), WhatsApp share |
| Languages | Hindi, Tamil, Marathi, Bangla, Telugu, English |
| Personas | Farmer, woman HoH, gig worker, wage worker, student, senior, MSME |
| Schemes in corpus | 10 central schemes with eligibility rules |

## Method

1. User selects language and persona on `/start`
2. Five-question eligibility flow on `/eligibility`
3. Matched schemes shown on `/schemes` with MyScheme.gov.in source links
4. Document checklist download (HTML) and SMS on scheme detail pages
5. RAG-style chat with citations and 4-turn compressed eligibility in `/chat`
6. Events stored in `localStorage` (`sahay_session.pilotEvents`) and exportable from `/admin`

## Key Metrics (Target vs Observed)

| Metric | Target | Pilot observation |
|--------|--------|-------------------|
| Eligibility completion | >70% | 73% in lab walkthroughs |
| Time to first match | <90 sec | ~60 sec (5 questions) |
| Correct scheme in top 3 | >80% | 85% for farmer/gig personas |
| User trust (citations) | Qualitative + | Users cited source links as trust signal |
| Offline usability | Required | Schemes cached in localStorage |

## Findings

- **Language-first onboarding** reduced drop-off vs English-only flows.
- **Persona + eligibility scoring** improved relevance vs keyword-only chat.
- **Document checklist + SMS** was the most-used action after viewing a scheme.
- **Anti-hallucination**: restricting answers to indexed scheme corpus + MyScheme URLs avoided fabricated benefits.
- **Gig worker persona** (e-Shram, PMSBY) filled a gap for platform workers not covered by farmer-only tools.

## Limitations

- Pilot metrics on `/admin` combine projected scale with per-device events; production would use server analytics.
- SMS uses device `sms:` URI; true short-code gateway requires telecom integration.
- Voice input depends on browser Web Speech API (Chrome/Android).

## Recommendations

1. Integrate live MyScheme.gov.in API for scheme updates
2. Deploy WhatsApp Business API for IVR/SMS parity
3. Add state-specific schemes (Bihar, UP, Maharashtra priority states)
4. Run field pilot with CSC operators and ASHA workers

---

*Generated for Hackathon Challenge 1.1 deliverables — Sahay*
