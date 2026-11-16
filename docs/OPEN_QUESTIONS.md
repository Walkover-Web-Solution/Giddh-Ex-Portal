# Open Questions

Product and ownership decisions not answered in the repository. Resolve in review; then update `docs/VISION.md` and remove or close items here.

| ID | Question | Why it matters |
|----|----------|----------------|
| OQ-001 | What is the official product name: **Giddh Portal**, **Giddh Ex Portal** (repo name), or something else for customers? | Naming affects marketing copy, titles (`TitleUpdater`), and vision checks. |
| OQ-002 | Is the primary user always a **vendor** (Giddh account party), or should docs say **customer** / **buyer** for some deployments? | Code uses `vendorContactUniqueName` and `fetchVendorsList`; UX copy is generic. |
| OQ-003 | Are **auditors** or read-only collaborators in scope for the portal, or only paying vendor contacts? | No role model documented; affects future permissions work. |
| OQ-004 | What **success metrics** define a healthy portal (adoption, pay-through rate, session errors, etc.)? | Required for “Strategic Priorities & Success Measures” once approved. |
| OQ-005 | Is the ARCHITECTURE **Future Improvements** list (dark mode, i18n, PWA, WebSockets, etc.) an approved roadmap or informal ideas? | Agents must not treat proposals as committed direction. |
| OQ-006 | `docs/WHITELABEL_CONFIG.md` describes `disableWhiteLabel`; **current code** always fetches `/white-label` except on magic routes. Which behavior is intended long term? | Docs and implementation diverge; affects performance and offline behavior. |
| OQ-007 | Should agents treat **`docs/API.md` interceptor example** (localStorage `token`) as canonical, or the cookie + company session flow in ARCHITECTURE? | Risk of wrong auth guidance for new utilities. |
| OQ-008 | Is there (or will there be) a root **`README.md` or `AGENTS.md`** entry point for humans and agents? | Neither exists today at repository root. |
| OQ-009 | What is the policy for **UK (`country=uk`)** vs default India paths beyond `GIDDH_API_URL_UK`—product requirement or technical workaround only? | Affects regional feature parity statements. |
| OQ-010 | Who **owns approval** of this vision draft and ongoing updates (team name or role)? | Gate for merging `docs/VISION.md` into protected branches. |