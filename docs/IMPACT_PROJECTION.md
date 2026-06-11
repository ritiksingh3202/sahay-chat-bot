# Sahay Impact Projection

## Problem

Hundreds of central and state welfare schemes exist, but eligible citizens—especially rural, women-led, and gig workers—often never apply due to language barriers, complex eligibility, and missing documents.

## Sahay Solution

Multilingual assistant (6 languages) with persona-based matching, eligibility engine, RAG chat with MyScheme.gov.in citations, offline scheme cache, and SMS/WhatsApp checklist sharing.

## Addressable Population (India)

| Segment | Est. eligible population | Sahay focus |
|---------|--------------------------|-------------|
| Small/marginal farmers | ~120M | PM-KISAN, crop insurance |
| Informal/gig workers | ~90M | e-Shram, PMSBY, Ayushman |
| Women HoH (SECC) | ~40M | Ujjwala, PM Awas, NFSA |
| Senior citizens (BPL) | ~25M | Ayushman, pensions |

## 12-Month Projection (Conservative)

Assumptions: CSC + NGO distribution, 2% monthly active growth from 10K seed users.

| Quarter | MAU | Eligibility checks | Successful applications (est.) |
|---------|-----|-------------------|-------------------------------|
| Q1 | 10,000 | 6,000 | 1,200 |
| Q2 | 25,000 | 18,000 | 3,600 |
| Q3 | 60,000 | 45,000 | 9,000 |
| Q4 | 120,000 | 95,000 | 19,000 |

## Economic Impact (Illustrative)

If 19,000 additional successful enrollments in Year 1 across PM-KISAN (₹6K/yr), Ayushman (₹5L cover), and MGNREGA (100 days):

- **Direct transfers**: ₹11–15 crore/year to newly enrolled beneficiaries
- **Healthcare access**: ₹500+ crore notional cover via Ayushman enrollments
- **Administrative savings**: ~40% reduction in CSC repeat visits for document prep

## SDG Alignment

- **SDG 1**: No poverty — income support schemes
- **SDG 3**: Good health — Ayushman Bharat
- **SDG 5**: Gender equality — woman HoH targeting
- **SDG 8**: Decent work — gig worker registration (e-Shram)

## Scale Path

1. **Phase 1**: Web + SMS (current MVP)
2. **Phase 2**: WhatsApp bot + voice IVR (Hindi/Tamil)
3. **Phase 3**: State government partnerships + CSC kiosk mode
4. **Phase 4**: MyScheme API sync + vernacular push notifications

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Hallucinated scheme info | Corpus-only RAG + mandatory citations |
| Low digital literacy | Voice input, pictorial personas, SMS checklists |
| Connectivity | Offline scheme cache in localStorage |
| Trust | MyScheme.gov.in source on every result |

---

*Sahay — Challenge 1.1 impact projection*
