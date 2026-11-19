# CHANGELOG - christopher drosos pottfolio

> **EL:** Αυτό το αρχείο καταγράφει αλλαγές που έγιναν απευθείας στον server/site, εκτός Cursor, από τον βοηθό 'App/Website Builder'. Οι νεότερες εγγραφές είναι πρώτες.
>
> **EN:** This file logs changes made directly on the server/site, outside Cursor, by the assistant 'App/Website Builder'. Newest entries first.

---

## 2026-11-19 18:46 (Europe/Athens) — Cursor

**What/why:** Αφαίρεση των portfolio sites `wizard-of-alpha.com` και `memecoins-alpha.com` από κώδικα, seed SQL, βάση InsForge και production deploy. Η κατηγορία «Crypto» δεν εμφανίζεται πλέον στο UI (δυναμικά φίλτρα + Ping page).

**Files:**
- PC: `src/data/fallback-websites.ts`, `insforge/seed-portfolio-sites.sql`, `src/pages/PingPage.tsx`, `CHANGELOG.md`
- Live: https://christopher-drosos-portfolio.insforge.site/ (InsForge deployment `99f65cab-0c6c-4e73-84e4-9ce252536d75`)

**DB:** `DELETE` από `portfolio_sites` όπου `name IN ('wizard-of-alpha.com', 'memecoins-alpha.com')` (2 γραμμές). Export γραμμών πριν τη διαγραφή.

**Backups:** Υπάρχον backup `C:\Users\Exoskeletor\Projects\_backups-portfolio-20261119\` (zip + git patch). Νέο export: `portfolio_sites-removed-wizard-memecoins.json`.

**Rollback:** Επαναφορά γραμμών από `portfolio_sites-removed-wizard-memecoins.json` (INSERT), revert commit, redeploy προηγούμενου deployment, ή `git restore` των αρχείων seed/fallback.

**Verification:** `npm run build` OK· `dist/` χωρίς `wizard-of-alpha` / `memecoins-alpha`· deploy status `READY`· live HTML/JS χωρίς τα δύο domains.

---
