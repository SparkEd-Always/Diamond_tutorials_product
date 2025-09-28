# Vendor Payments Requirements

## User Story
As a finance/admin officer, I want to manage vendor contracts, approve invoices, and process timely payments, so that vendors are paid correctly, resources are delivered on time, and the school avoids disputes or service disruptions.

## Actors
- **Finance/Admin Staff** → Handles procurement, verifies invoices, processes vendor payments, maintains vendor relationships
- **Vendors/Suppliers** → Deliver goods/services (books, uniforms, canteen, IT, transport), submit quotations and invoices
- **Principal/Management** → Approves large purchases, vendor contracts, high-value transactions
- **Department Heads** → Raise purchase requests, verify delivery quality, approve specifications
- **ERP/Procurement System** → Tracks contracts, manages workflows, generates reports, maintains vendor database
- **Bank/Payment Gateway** → Executes vendor payments, provides transaction confirmations

## Journey (Steps)

### 1. Purchase Request & Vendor Selection
- Department head raises purchase request in system → specifies items, quantity, urgency, budget approval
- Admin requests quotations from multiple vendors → system tracks quotation responses and comparisons
- Vendors submit quotations via portal → admin compares pricing, terms, delivery schedules
- Management approves vendor selection for high-value purchases → digital approval workflow with justification

### 2. Purchase Order Generation & Confirmation
- Admin issues Purchase Order (PO) to selected vendor → system generates PO with terms, delivery dates, specifications
- PO sent to vendor via email/portal → vendor acknowledges receipt and confirms delivery timeline
- Contract terms and payment schedules finalized → stored in vendor management system
- Delivery tracking initiated → system monitors expected delivery dates and sends alerts

### 3. Goods Receipt & Quality Verification
- Vendor delivers goods/services → department head verifies quality, quantity against PO specifications
- Goods Received Note (GRN) generated → system updates inventory and marks delivery complete
- Quality issues flagged immediately → vendor notified for replacement/rectification
- Acceptance confirmation recorded → triggers invoice processing workflow

### 4. Invoice Processing & Three-way Matching
- Vendor submits invoice via system/email → finance team receives and validates against PO and delivery
- System performs three-way matching → PO vs GRN vs Invoice for amount, quantity, terms verification
- Discrepancies flagged for resolution → vendor contacted for clarification or correction
- Approved invoices moved to payment queue → payment scheduling based on terms and cash flow

### 5. Payment Processing & Reconciliation
- Finance team processes approved invoices → payment released via bank API/transfer
- Bank confirms payment execution → system updates vendor ledger and payment status
- Vendor payment confirmation sent → transaction records maintained for audit
- System reconciles payments with vendor statements → outstanding amounts tracked automatically

## Pain Points
- **Manual Processing**: Paper-based PO creation and approval workflows
- **Invoice Discrepancies**: Mismatches between POs, receipts, and invoices
- **Payment Delays**: Lengthy approval processes causing vendor dissatisfaction
- **Vendor Communication**: Poor communication leading to supply disruptions
- **Document Management**: Lost invoices and supporting documents
- **Budget Control**: Overspending due to lack of real-time budget tracking
- **Compliance Issues**: GST and tax compliance complexities
- **Duplicate Payments**: Risk of paying same invoice multiple times

## Opportunities
- **Digital Workflows**: Electronic PO generation and approval workflows
- **Vendor Portal**: Self-service portal for vendors to track orders and payments
- **Automated Matching**: AI-powered three-way matching of documents
- **Early Payment Discounts**: Optimized payment scheduling for discounts
- **Spend Analytics**: Data-driven insights for better procurement decisions
- **Mobile Approvals**: Mobile app for purchase approvals on-the-go
- **Integration**: Real-time integration with inventory and budget systems

## Inputs
- **Vendor Information**: Company details, tax registrations, bank accounts, contacts
- **Purchase Requisitions**: Department needs, specifications, quantities, budgets
- **Quotations**: Vendor quotes, price comparisons, technical evaluations
- **Purchase Orders**: Approved orders with terms, delivery dates, specifications
- **Goods Receipts**: Delivery confirmations, quality checks, acceptance notes
- **Invoices**: Vendor bills with tax details, payment terms, supporting documents
- **Payment Terms**: Credit periods, discount structures, penalty clauses

## Outputs
- **Purchase Orders**: Official purchase documents with legal terms
- **Payment Vouchers**: Approved payment instructions with supporting documents
- **Vendor Statements**: Account statements and payment history
- **Aging Reports**: Outstanding payables categorized by aging buckets
- **Spend Analysis**: Category-wise, vendor-wise, and time-based spend reports
- **Compliance Reports**: GST returns, TDS certificates, vendor assessments
- **Budget Reports**: Department-wise budget utilization and variance analysis

## Acceptance Criteria
- [ ] Purchase order generation completes within 30 minutes of vendor selection approval
- [ ] Three-way matching (PO-GRN-Invoice) identifies discrepancies with 95%+ accuracy automatically
- [ ] Payment processing workflow completes within 48 hours for approved invoices
- [ ] Vendor portal provides real-time status updates on PO status, delivery schedules, payment status
- [ ] System prevents duplicate payments through automated PO and invoice matching controls
- [ ] GST compliance reports generate automatically with vendor-wise tax breakdowns
- [ ] Budget alerts trigger when department spending exceeds 80% of allocated budget
- [ ] Vendor performance tracking captures on-time delivery %, quality ratings, cost trends
- [ ] Payment scheduling optimizes cash flow while capturing early payment discounts when available
- [ ] Audit trail maintains complete vendor transaction history for 7+ years with document storage

## System Interactions
- **Budget Management**: Check budget availability and update spend against allocations
- **Inventory Management**: Update stock levels upon goods receipt
- **Accounting System**: Post purchase entries and payment vouchers to general ledger
- **Tax Management**: Calculate and track GST, TDS, and other tax obligations
- **Banking System**: Generate payment files and reconcile bank transactions
- **Document Management**: Store and retrieve POs, invoices, and supporting documents
- **Workflow Engine**: Route approvals based on amount, category, and hierarchy
- **Notification Service**: Send alerts for approvals, payments, and overdue items
- **Vendor Portal**: Provide external access for vendors to track their transactions

## Edge Cases
- **Emergency Purchases**: Urgent requirement (broken AC in summer) → fast-track approval via WhatsApp/call → emergency PO generated → vendor delivers same day → invoice processed within 24 hours
- **Partial Deliveries**: Vendor delivers 50 of 100 books ordered → system creates partial GRN → partial payment released → remaining quantity tracked for future delivery
- **Invoice Discrepancies**: Vendor bills ₹50,000 but PO was ₹45,000 → system flags discrepancy → admin contacts vendor for clarification → revised invoice or PO amendment processed
- **Quality Issues**: Books delivered with wrong syllabus → department rejects delivery → vendor notified for replacement → payment held until correct delivery
- **Vendor Payment Delays**: Cash flow issue delays payment beyond terms → vendor complains → system tracks overdue amounts → priority payment processing → vendor relationship maintained
- **Duplicate Invoices**: Vendor sends same invoice twice → system detects duplicate based on PO/amount matching → alerts admin → duplicate marked and ignored
- **Contract Renewals**: Annual transport contract expires → system alerts 30 days before → new quotations sought → contract renewed with updated rates → historical data preserved
- **Vendor Bankruptcy**: Key vendor closes business → outstanding POs cancelled → alternative vendors identified → supply continuity maintained
- **GST Rate Changes**: Tax rates change mid-year → system updates automatically → existing contracts adjusted → vendor compliance verified
- **Multi-year Contracts**: IT maintenance contract for 3 years → system tracks milestone payments → annual rate escalations applied → renewal alerts sent before expiry

## Priority/Frequency
- **Priority**: High (Critical for school operations)
- **Frequency**:
  - Purchase orders: Daily during academic year
  - Invoice processing: Daily to weekly depending on vendor
  - Payment processing: Weekly or bi-weekly payment runs
  - Vendor reconciliation: Monthly
  - Spend analysis: Monthly for management review
- **Peak Usage**: Beginning of academic year (books, uniforms), exam periods (stationery)
- **Critical Periods**: Annual budget planning, academic year start, audit periods

---
*Document created for EdTech ERP + SIS + LMS system development*
*Module: Financial Management - Vendor Payments*
*Last updated: September 27, 2025*