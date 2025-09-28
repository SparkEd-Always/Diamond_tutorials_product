# Payroll & Staff Salaries Requirements

## User Story
As a finance/admin officer, I want to calculate and disburse staff salaries accurately and on time, so that teachers and staff are paid fairly, records are compliant, and management can track salary expenses easily.

## Actors
- **Finance/Admin Staff** → Manages payroll calculations, tax deductions, salary disbursement
- **Teachers & Non-teaching Staff** → Receive salaries, access payslips, submit leave/attendance data
- **Principal/Management** → Approves payroll budget changes, final payroll runs
- **HR Department** → Provides attendance, leave, and contract details for payroll processing
- **Bank/Payment Gateway** → Processes salary disbursement and transfers
- **ERP/IT System** → Integrates payroll rules, generates payslips, maintains compliance

## Journey (Steps)

### 1. Employee Record Setup & Configuration
- HR/Admin sets up employee records in ERP → salary structure, allowances, deductions, tax rules configured
- Bank account details and tax declarations entered → system validates and stores for processing
- Pay scales and increment policies defined → automatic calculation rules established
- Statutory compliance rules configured (PF, ESI, TDS) → system applies current rates automatically

### 2. Data Collection & Integration
- Attendance & leave data collected from ERP/biometric system → automatically synced to payroll module
- Working days calculated → system accounts for holidays, weekends, leave without pay
- Overtime and special duty hours imported → additional compensation calculated automatically
- Performance ratings and bonus eligibility data integrated → variable pay components added

### 3. Payroll Calculation & Processing
- Payroll module calculates gross salary → applies all configured allowances and benefits
- System applies deductions automatically → tax, loans, PF, insurance, professional tax calculated
- Net salary computed → detailed breakup generated with all components itemized
- Proration handled for mid-month joiners/leavers → accurate calculation for partial months

### 4. Review & Approval Workflow
- Finance admin reviews payroll draft → verifies calculations and handles exceptions
- System generates payroll summary for management → department-wise cost breakdown provided
- Management approves payroll run → digital approval with audit trail maintained
- Final payroll locked for processing → no further changes allowed without proper authorization

### 5. Disbursement & Documentation
- Bank API triggered for salary transfer → bulk payment file generated and processed
- Salary credited to staff accounts → confirmation received from banking partner
- Payslips generated automatically → digital copies emailed and available in employee portal
- Records stored for audit compliance → historical data maintained for statutory requirements

## Pain Points
- **Manual Calculations**: Error-prone manual calculation of complex salary components
- **Attendance Integration**: Difficulty syncing attendance data with payroll calculations
- **Statutory Compliance**: Complex tax and statutory deduction calculations
- **Leave Management**: Manual tracking of various leave types affecting salary
- **Bank Integration**: Time-consuming manual bank transfer processes
- **Report Generation**: Multiple reports for different stakeholders and compliance
- **Salary Revisions**: Complex handling of mid-month salary changes and arrears
- **Year-end Processing**: Complicated tax calculations and form generation

## Opportunities
- **Automated Calculations**: Rule-based salary computation with minimal manual intervention
- **Real-time Integration**: Live sync with attendance, leave, and performance systems
- **Self-Service Portal**: Employee access to salary slips, tax statements, and declarations
- **Bank API Integration**: Direct salary transfer processing and reconciliation
- **Compliance Automation**: Auto-generation of statutory returns and forms
- **Analytics Dashboard**: Payroll cost analysis and budgeting insights
- **Mobile Access**: Mobile app for salary slip viewing and tax planning

## Inputs
- **Employee Master Data**: Personal details, bank accounts, tax information, joining dates
- **Salary Structure**: Basic salary, allowances, benefits, deduction rules
- **Attendance Data**: Working days, absences, overtime, late arrivals from attendance system
- **Leave Records**: Leave taken, leave without pay, compensatory offs
- **Performance Data**: Ratings, bonuses, incentives, penalties
- **Statutory Rates**: Current PF, ESI, tax slabs, professional tax rates
- **Bank Details**: Account numbers, IFSC codes, salary transfer instructions

## Outputs
- **Salary Slips**: Individual employee salary statements with detailed breakup
- **Payroll Register**: Monthly salary summary for all employees
- **Bank Transfer Files**: NEFT/RTGS files for salary disbursement
- **Statutory Reports**: PF, ESI, TDS returns and challans
- **Cost Center Reports**: Department-wise salary cost analysis
- **Tax Documents**: Form 16, TDS certificates, annual tax statements
- **Management Reports**: Payroll cost trends, budget variance analysis

## Acceptance Criteria
- [ ] Payroll auto-calculates gross, deductions, net salary based on pre-set rules with 99.9% accuracy
- [ ] Attendance/leave data automatically syncs into payroll without manual intervention
- [ ] One-click salary transfer via bank API or downloadable transfer file processes within 2 hours
- [ ] Payslips generated instantly and accessible via employee portal + email delivery
- [ ] System tracks and reports statutory deductions (PF, ESI, tax) with automatic compliance filing
- [ ] Payroll reports exportable in multiple formats (Excel, CSV, PDF) within 30 seconds
- [ ] Audit trail maintained for every payroll change with user attribution and timestamps
- [ ] Mid-month joiners/leavers handled with accurate pro-rated salary calculations
- [ ] Salary advances and loan deductions tracked automatically with balance management
- [ ] Employee self-service portal provides 3+ years of payslip history and tax documents

## System Interactions
- **ERP Finance Module** ↔ Payroll calculations, accounting entries, budget tracking, expense allocation
- **HR Module** ↔ Employee records, contracts, salary structures, performance ratings
- **Attendance/Leave System** ↔ Daily attendance data, leave records, overtime tracking for payroll inputs
- **Bank API/Payment Gateway** ↔ Salary disbursement, bulk transfers, transaction confirmations
- **Employee Portal/App** ↔ Payslip download, tax forms, salary queries, bank detail updates
- **Tax Management System** ↔ TDS calculations, compliance filings, certificate generation
- **Document Management** ↔ Payroll records, tax documents, compliance certificates storage
- **Notification Service** ↔ Salary credit alerts, payslip availability, compliance reminders

## Edge Cases
- **Mid-month Joining**: Employee joins on 15th → system calculates pro-rated salary for remaining days → adjusted payslip generated
- **Wrong Bank Details**: Salary transfer fails → system flags failed transaction → employee notified to update bank details → retry mechanism activated
- **Salary Advances/Loans**: Employee takes advance → system sets up monthly deduction schedule → balance tracked automatically → completion notification sent
- **Salary Disputes**: Employee queries deduction → system provides detailed breakup → manual adjustment workflow if required → revised payslip generated
- **Contract/Part-time Staff**: Different calculation rules applied → hourly rates or contract amounts used → separate payroll processing category
- **Statutory Rate Changes**: PF/ESI rates change mid-year → system updates automatically → historical data recalculated if required → compliance reports adjusted
- **Leave Without Pay**: Extended unpaid leave → salary deduction calculated → medical/maternity leave handled differently → statutory benefits maintained
- **Bonus/Incentive Processing**: Performance bonus declared → system calculates tax implications → special payroll run for bonus distribution → separate payslip generated
- **Year-end Processing**: Annual tax calculations → Form 16 generation → leave encashment processing → final settlement for resignations
- **Audit Requirements**: Auditor requests historical data → system generates comprehensive payroll reports → transaction trail provided → compliance documentation prepared

## Priority/Frequency
- **Priority**: Critical (Legal and employee satisfaction requirement)
- **Frequency**:
  - Monthly payroll processing: Once per month
  - Salary slip generation: Monthly
  - Statutory compliance: Monthly returns, quarterly filings
  - Bank reconciliation: Daily during salary processing
  - Employee queries: Daily throughout the month
- **Peak Usage**: Month-end processing (25th-5th of next month)
- **Critical Periods**: Annual tax filing season, audit periods, government inspection periods

---
*Document created for EdTech ERP + SIS + LMS system development*
*Module: Financial Management - Payroll & Staff Salaries*
*Last updated: September 27, 2025*