# FestOS: IIM Indore Epinoia 2026 Operations Command Portal

**FestOS** is an internal festival control center engineered for **IIM Indore's Epinoia 2026**. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL & Realtime WebSockets)**.

---

## ⚡ Key Highlights & Core Modules

1. **Supabase Realtime Synchronization**:
   - Subscribed to PostgreSQL table changes (`hostels`, `accommodation_allocations`, `events`, `registrations`, `overrides_audit_log`, `venues`).
   - Any disruption or change automatically streams across all connected screens in real-time.
   - Dual-mode architecture: seamlessly queries remote Supabase when configured in `.env.local`, with an instant fallback local broadcast bus for zero-dependency hackathon testing.

2. **Command Dashboard (Overview)**:
   - High-level telemetry: Real-time bed occupancy rate (Campus hostels vs External overflow stays), checked-in delegate counts, active schedule clashes, vendor compliance warnings.
   - Walkie-Talkie channel dispatch monitor (Channel 1 Gold, Channel 2 Ops Command, etc.).
   - Instant 1-click Clash Auto-Mitigation.

3. **Accommodation Allocation Engine**:
   - Visual grid of campus hostels (`data/hostels.csv`) and external overflow stays (`data/external_stays.csv`).
   - Enforces hard constraints:
     - **Gender Segregation**: Separates male and female hostel blocks.
     - **Accessibility Priority**: Ensures wheelchair/reduced-mobility delegates receive ground floor rooms or elevator-accessible suites.
     - **Contingent Cohesion**: Visually color-codes rooms to group delegates from the same college together.
   - **Mandatory Override Modal**: Any violation blocks standard assignment and prompts the organizer for an operational reason and approving authority, committed immediately to `overrides_audit_log`.
   - **Smart Auto-Allocation Engine**: Automatically allocates unassigned delegates based on constraint priority.

4. **Participant & Contingent Manager**:
   - Comprehensive searchable roster across all participating colleges (IIM Ahmedabad, IIM Bangalore, IIM Calcutta, XLRI, FMS, SPJIMR, IIT Bombay, NMIMS).
   - Fast NFC/biometric check-in simulation with instant timestamping.
   - Dietary restrictions tracker (Pure Veg, Jain, Vegan, Halal).
   - Export delegate roster to CSV.

5. **Event Schedule & Clash Detector Matrix**:
   - Cross-references event timings, assigned venues, and participant registrations.
   - Flags three distinct clash classes:
     - **Venue Overlap**: Two events booked in the same venue at the same time.
     - **Participant Overlap**: A student registered for two concurrent events.
     - **Capacity Breaches**: Event registrations exceeding venue seating limit.
   - 1-click Venue Shift and Timing Adjustment with automatic recalculation.

6. **Live Disruption Injector & Audit Log (Judge Testing Harness)**:
   - Built specifically for hackathon judges and festival directors to inject live chaos:
     - *Scenario 1: Main Girls Hostel Pipeline Burst* (Closes IPM-H1, flags 74 displaced delegates, activates Crescent Spa overflow).
     - *Scenario 2: Unseasonal Torrential Downpour at Amphitheatre* (Shifts Ritviz Live Pro-Night to Central Audi).
     - *Scenario 3: Red Contingent Flight Delayed* (Locks FMS Delhi reservations for midnight check-in).
     - *Scenario 4: Food Safety Inspection Breach* (Halts non-compliant vendor service).
   - Custom Disruption Constructor with mandatory justification.
   - Full PostgreSQL `overrides_audit_log` explorer with CSV export.

7. **Vendor & Logistics Portal**:
   - Tracks hygiene star ratings (0-5.0), sanitary certificate expiration dates, and operating hours.
   - Logistics inventory for 500kVA silent DG gensets, JBL VRX concert line arrays, barricades, and VIP seating.
   - Merch stock distribution tracker (varsity hoodies, smart bands).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (dark command center theme)
- **Database & Realtime**: Supabase (`@supabase/supabase-js`)
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-anon-key-here
```
*(Note: If left blank, FestOS will automatically boot into high-resilience simulated mode with all sample data preloaded!)*

### 3. Setup Supabase Database (if using remote Supabase)
Execute the SQL script in `supabase/schema.sql` inside the Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏛️ Epinoia 2026 Festival Operations Team
*Indian Institute of Management Indore*  
*Prabandh Shikhar, Rau-Pithampur Road, Indore, Madhya Pradesh 453556*

