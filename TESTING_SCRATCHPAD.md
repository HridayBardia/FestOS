# FestOS Interactive Testing Scratchpad & QA Verification Guide
**IIM Indore Operations Control Portal**

This testing scratchpad is engineered for festival organizers, lead developers, and hackathon judges to verify and stress-test every interactive, realtime, and visual capability that cannot be fully validated through headless CI unit tests.

---

## 🚀 Step 0: Starting the Application
```bash
# Ensure dependencies are installed (already validated)
npm install

# Start the Next.js development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📋 Section 1: Realtime Cross-Tab Broadcast Synchronization
> *FestOS implements a dual-mode broadcast bus (`festos_aarohan_luxury_sync` via browser `BroadcastChannel` with fallback to Supabase PostgreSQL WebSockets).*

- [ ] **1.1 Two-Window Realtime Mirroring**
  - Open `http://localhost:3000` in **Window A**.
  - Open `http://localhost:3000` side-by-side in **Window B** (or in an incognito window/different tab).
- [ ] **1.2 Realtime Check-In Propagation**
  - In **Window A**, go to `Contingents & Rosters` tab.
  - Find any unchecked delegate (e.g., *Kabir Singhania*) and click `Check In`.
  - **Verify in Window B**:
    - The top header delegate count immediately increments (e.g. `1,420` &rarr; `1,421`).
    - The status badge for that participant flips to `Checked In` in Window B without a manual page reload.
- [ ] **1.3 Realtime Disruption Alert Banner**
  - In **Window A**, go to `Disruption Testing` & click `Inject Test Live` on **Scenario 1** (*Hostel Closure: IPM-H1 Pipeline Rupture*).
  - **Verify in Window B**:
    - A warm amber alert banner immediately drops down from the header: `"SIMULATION DISRUPTION ACTIVE: 1 simulated anomaly..."`.
    - The sidebar badge updates with an active pulse indicator.
    - IPM Residence 1 is strikethrough-marked as `CLOSED`.

---

## 🏨 Section 2: Accommodation Constraint Engine & Override Audit
> *Enforces hard rules: Gender segregation, Ground floor/Elevator accessibility priority, and Non-double-booking protection.*

- [ ] **2.1 Double-Booking Prevention (Bug Fix Verified)**
  - Navigate to `Accommodation Grid`.
  - Select `IPM Residence 2` (Male hostel).
  - Bed `101-A` is already occupied by *Aarav Sharma*.
  - Try assigning an unallocated delegate directly to `Room 101` (Bed `A`).
  - **Verify**: The system blocks the assignment with an explicit error: `"Bed Conflict: Bed A in Room 101 is already occupied by Aarav Sharma."`
- [ ] **2.2 Gender Segregation Violation & Mandatory Override**
  - In `Accommodation Grid`, select `IPM Residence 1` (Female only).
  - Click on an available bed slot (e.g. `Room G01`, Bed `A`).
  - In the unallocated drawer, click on a **male delegate** (e.g., *Siddharth Mukherjee*).
  - **Verify**:
    - The `Constraint Violation Flagged` modal opens with policy warning: `GENDER SEGREGATION CONSTRAINT: IPM Residence 1 is designated as FEMALE ONLY...`.
    - Try submitting with empty justification: Form rejects (min 10 characters required).
    - Enter operational justification: `"Special contingent lead clearance authorized by Directorate"` and select approving authority.
    - Click `Authorize & Log to Supabase`.
    - The bed renders with an orange `Override` badge and a new audit record is appended to `overrides_audit_log`.
- [ ] **2.3 Wheelchair / Accessibility Priority Rule**
  - Select `PGP Block Alpha` (No elevator, 3 floors).
  - Attempt to allocate *Rohit Verma* (or any delegate with `accessibility_needs: true`) to upper floor `Room 201`.
  - **Verify**: The system flags `Accessibility Constraint: Participant requires ground floor or elevator access.` and blocks normal assignment.
- [ ] **2.4 Smart Auto-Allocation Engine**
  - Click `Auto-Allocate Engine` on the top right.
  - **Verify**:
    - Unallocated delegates are automatically distributed across operational hostels respecting gender and accessibility constraints.
    - Summary alert confirms exact count of successful allocations and violations flagged.
    - Hostels with elevator access receive wheelchair delegates on ground floors (`G01-G14`).

---

## ⚡ Section 3: Schedule Matrix & Clash Resolution Engine
> *Cross-references event timings, room bookings, and participant overlapping registrations.*

- [ ] **3.1 Inspect Active Clashes**
  - Navigate to `Schedule & Clashes` tab.
  - **Verify initial flagged clashes**:
    1. *Venue Conflict: Chanakya Hall* (Overlap between `Boardroom Blitz` 14:00-17:30 and `Executive Leadership Keynote` 16:30-18:00).
    2. *Participant Overlap: Rohit Verma* (Registered concurrently for `Boardroom Blitz` and `BeatTheStreet Algo Trading`).
- [ ] **3.2 1-Click Clash Auto-Mitigation**
  - In the clash banner for *Venue Conflict: Chanakya Hall*, click `Shift Venue / Reallocate`.
  - Choose destination venue `Central Auditorium` (Capacity: 1200 pax).
  - Enter justification: `"Shifted to Central Audi due to stage conflict"` and authorize.
  - Click `Reassign Venue & Commit Audit`.
  - **Verify**:
    - Clash counter decrements from `2` &rarr; `1`.
    - The event shifts venue cleanly.
    - An immutable audit trail entry is registered under action `venue_shift`.

---

## 🧪 Section 4: Live Disruption Injector (Jury Chaos Scenarios)
> *Designed specifically for hackathon evaluation drills.*

- [ ] **Scenario 1: IPM-H1 Plumbing Catastrophe**
  - Click `Inject Test Live` under Scenario 1.
  - **Verify**:
    - IPM Residence 1 marked `CLOSED`.
    - Any attempt to allocate beds in IPM-H1 triggers emergency closure constraint modal.
    - Audit log records `hostel_closure`.
- [ ] **Scenario 2: Unseasonal Torrential Downpour at Amphitheatre**
  - Click `Inject Test Live` under Scenario 2.
  - **Verify**:
    - `Ahilya Pro-Night: Ritviz Live` shifts from Amphitheatre to Central Auditorium.
    - Venue capacity gauges adjust in real time.
- [ ] **Scenario 3: Contingent Flight Delayed**
  - Click `Inject Test Live` under Scenario 3.
  - **Verify**:
    - `FMS Delhi` contingent status transitions from `expected` &rarr; `delayed`.
    - Header indicator updates delayed contingent count.
- [ ] **Scenario 4: Food Safety Inspection Breach**
  - Click `Inject Test Live` under Scenario 4.
  - **Verify**:
    - Caterer status flips to `breached` with red highlight in `Logistics & Vendors` tab.
    - Header vendor notice counter displays `1 Breached`.
- [ ] **Master Reset Drill**
  - Click `Reset & Restore All Facilities`.
  - **Verify**: All closed hostels return to `operational`, active disruption banner dismisses cleanly.

---

## 🎨 Section 5: Design Taste, Aesthetics & UI/UX Audit
> *Ensures the editorial Ivy League / IIM luxury aesthetic renders consistently.*

- [ ] **5.1 Editorial Warm Palette Fidelity**
  - Background is soft alabaster (`#FAF8F5`), not stark clinical white (`#FFFFFF`) or dark mode.
  - Primary accents utilize burnished ochre/imperial gold (`#A3703F` / `#8C6D36`).
  - Text selection in browser renders in ivory gold (`#F6EFE6` with `#8C6D36` text).
- [ ] **5.2 Typography Pairing**
  - Masthead, card titles, and modal headers render in Georgia/Cambria Serif.
  - Telemetry badges, room codes, timestamps, and delegate counts render in Monospace (`ui-monospace`).
  - Body copy and controls render in clean modern System Sans.
- [ ] **5.3 Responsive Viewport Verification**
  - Open DevTools Device Toolbar (`Ctrl+Shift+M` or `Cmd+Shift+M`):
    - **Mobile (390px - iPhone 14)**: Verify sidebar collapses or main layout stacks vertically; cards don't overflow horizontally.
    - **Tablet (768px - iPad)**: Verify metrics grid displays 2x2.
    - **Desktop (1440px+)**: Verify 4-column metric cards and split room matrix render with adequate negative space.

---

## 💾 Section 6: Data Export & CSV Verification
- [ ] **6.1 Export Delegate Roster CSV**
  - In `Contingents & Rosters`, click `Export Page CSV`.
  - Open the downloaded CSV file in Excel / Google Sheets / Notepad.
  - **Verify**:
    - All columns (`ID`, `Name`, `Email`, `Phone`, `Gender`, `Contingent`, `Role`, `Dietary`, `Accessibility`, `Allocated Room`, `Checked In`) are properly escaped with quotes.
- [ ] **6.2 Export Audit Log CSV**
  - In `Disruption Testing` or `Audit Trail Modal`, click `Export Audit CSV`.
  - **Verify**:
    - Contains all state transitions with timestamps, authorizing officers, and mandatory justifications.

---

## ☁️ Section 7: Remote Supabase Live Cloud Setup (Optional)
If you wish to hook up live cloud PostgreSQL rather than local simulation:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and paste the contents of `supabase/schema.sql`.
3. Click **Run** to provision all 13 tables, RLS policies, and Realtime publications.
4. In FestOS, click the connection pill on the sidebar (`Supabase Client` &rarr; `Config`).
5. Paste your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_KEY` (anon public key).
6. Click `Save & Connect`.
7. **Verify**: Status indicator switches to green `● CONNECTED TO CLOUD`.

