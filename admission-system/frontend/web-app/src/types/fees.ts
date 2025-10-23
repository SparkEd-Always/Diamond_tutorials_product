// ============================================================================
// Fee Management Types
// ============================================================================

export interface FeeType {
  id: number;
  type_name: string;
  code: string;
  description?: string;
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'half_yearly' | 'annual' | 'custom';
  is_mandatory: boolean;
  is_taxable: boolean;
  tax_rate: number;
  is_refundable: boolean;
  is_active: boolean;
  display_order?: number;
  created_at: string;
  updated_at?: string;
}

export interface FeeStructure {
  id: number;
  academic_year_id: number;
  class_id: number;
  fee_type_id: number;
  amount: number;
  installments: number;
  due_day_of_month?: number;
  due_date_fixed?: string;
  late_fee_applicable: boolean;
  late_fee_percentage: number;
  late_fee_amount: number;
  grace_period_days: number;
  early_payment_discount_percentage?: number;
  early_payment_discount_days?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;

  // Related entity names for display (populated by backend)
  fee_type_name?: string;
  class_name?: string;
  academic_year_name?: string;
}

export interface StudentFeeAssignment {
  id: number;
  student_id: number;
  fee_structure_id: number;
  custom_amount?: number;
  discount_percentage: number;
  discount_amount?: number;
  discount_reason?: string;
  custom_due_date?: string;
  is_waived: boolean;
  waiver_percentage: number;
  waiver_reason?: string;
  waived_by?: number;
  waived_at?: string;
  is_active: boolean;
  assigned_by?: number;
  assigned_at: string;
  remarks?: string;
  final_amount?: number;
}

export interface StudentFeeLedger {
  id: number;
  student_id: number;
  academic_year_id: number;

  // Student details
  first_name?: string;
  last_name?: string;

  // Financial summary
  total_fees_assigned: number;
  total_invoiced: number;
  total_paid: number;
  total_outstanding: number;
  total_refunded: number;
  total_waived: number;
  total_discounts: number;
  overdue_0_30_days: number;
  overdue_30_60_days: number;
  overdue_60_90_days: number;
  overdue_90_plus_days: number;
  total_late_fees: number;
  late_fees_paid: number;
  late_fees_outstanding: number;
  last_payment_date?: string;
  last_payment_amount?: number;
  payment_count: number;
  invoice_count: number;
  pending_invoice_count: number;
  paid_invoice_count: number;
  overdue_invoice_count: number;
  has_outstanding: boolean;
  has_overdue: boolean;
  is_defaulter: boolean;
  last_updated_at: string;
  created_at: string;
  remarks?: string;
}

// Form data types for creating/updating
export interface FeeTypeFormData extends Omit<FeeType, 'id' | 'created_at' | 'updated_at'> {}

export interface FeeStructureFormData extends Omit<FeeStructure, 'id' | 'created_at' | 'updated_at'> {}

export interface StudentFeeAssignmentFormData extends Omit<StudentFeeAssignment, 'id' | 'assigned_at' | 'waived_by' | 'waived_at' | 'assigned_by' | 'final_amount'> {}

// Fee Session Types
export type FeeSessionStatus = 'draft' | 'active' | 'closed' | 'archived';

export interface FeeSession {
  id: number;
  session_name: string;
  session_description?: string;
  academic_year_id: number;
  fee_structure_id: number;
  start_date: string;
  due_date: string;
  status: FeeSessionStatus;
  total_students: number;
  total_amount: number;
  collected_amount: number;
  outstanding_amount: number;
  students_paid: number;
  students_pending: number;
  collection_percentage: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  closed_by?: number;
  remarks?: string;
}

export interface FeeSessionDetail extends FeeSession {
  student_assignments: StudentAssignmentDetail[];
  fee_structure_name?: string;
  academic_year_name?: string;
}

export interface StudentAssignmentDetail {
  student_id: number;
  student_name: string;
  admission_number: string;
  roll_number?: string;
  class_name: string;
  section?: string;
  expected_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  payment_status: string;
  is_paid: boolean;
}

export interface FilteredStudent {
  id: number;
  full_name: string;
  admission_number: string;
  roll_number?: string;
  class_id: number;
  class_name: string;
  section?: string;
  is_selected: boolean;
}

export interface StudentFilterCriteria {
  class_id?: number;
  section?: string;
  academic_year_id?: number;
  search_query?: string;
}

export interface FeeSessionFormData {
  session_name: string;
  session_description?: string;
  academic_year_id: number;
  fee_structure_id: number;
  start_date: string;
  due_date: string;
  student_ids: number[];
  remarks?: string;
}

export interface FeeSessionSummary {
  total_sessions: number;
  active_sessions: number;
  total_expected_amount: number;
  total_collected_amount: number;
  total_outstanding_amount: number;
  overall_collection_percentage: number;
}

// Grouped structure type for display (groups fee types by class and academic year)
export interface GroupedFeeStructure {
  id: string; // Unique identifier for the group (classId-academicYearId)
  name: string; // Display name (e.g., "Class 10 - 2024-25")
  classId: number;
  className: string;
  academicYearId: number;
  academicYearName: string;
  totalAmount: number;
  feeTypeCount: number;
  structures: FeeStructure[]; // All fee types in this group
}

// Pagination response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// Adhoc Fee Assignment Types
// ============================================================================

export type AdhocFeePaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface AdhocFeeAssignment {
  id: number;
  fee_name: string;
  description?: string;
  amount: number;
  assigned_date: string;
  due_date: string;
  student_id: number;
  paid_amount: number;
  outstanding_amount: number;
  payment_status: AdhocFeePaymentStatus;
  is_paid: boolean;
  paid_at?: string;
  assigned_by: number;
  assigned_at: string;
  remarks?: string;
  is_active: boolean;

  // Populated from relationships (optional)
  student_name?: string;
  student_admission_number?: string;
  student_roll_number?: string;
  student_class?: string;
  assigned_by_name?: string;
}

export interface AdhocFeeFormData {
  fee_name: string;
  description?: string;
  amount: number;
  assigned_date: string;
  due_date: string;
  student_ids: number[];
  remarks?: string;
}

export interface AdhocFeeListItem {
  id: number;
  fee_name: string;
  amount: number;
  assigned_date: string;
  due_date: string;
  student_id: number;
  student_name: string;
  student_admission_number: string;
  paid_amount: number;
  outstanding_amount: number;
  payment_status: AdhocFeePaymentStatus;
  is_paid: boolean;
  assigned_at: string;
}

export interface AdhocFeeSummary {
  total_adhoc_fees: number;
  total_amount_assigned: number;
  total_amount_paid: number;
  total_outstanding: number;
  pending_count: number;
  paid_count: number;
  overdue_count: number;
  collection_percentage: number;
}

// ============================================================================
// Payment Types
// ============================================================================

export type PaymentMethod =
  | 'cash'
  | 'upi'
  | 'credit_card'
  | 'debit_card'
  | 'net_banking'
  | 'wallet'
  | 'cheque'
  | 'demand_draft'
  | 'bank_transfer'
  | 'other';

export type PaymentStatus =
  | 'initiated'
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'refund_initiated'
  | 'refunded'
  | 'disputed';

export interface PaymentAllocation {
  fee_session_id?: number;
  adhoc_fee_id?: number;
  amount: number;
  fee_description?: string;
}

export interface Payment {
  id: number;
  payment_number: string;
  payment_date: string;
  student_id: number;
  student_name?: string;
  academic_year_id: number;
  academic_year_name?: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;

  // Ledger integration
  ledger_transaction_id?: number;
  ledger_balance_after?: number;

  // Allocations
  allocations?: PaymentAllocation[];

  // Offline payment details
  cheque_number?: string;
  cheque_date?: string;
  bank_name?: string;
  branch_name?: string;
  transaction_id?: string;
  bank_reference?: string;

  // Online payment details
  gateway_name?: string;
  gateway_order_id?: string;
  gateway_payment_id?: string;

  // Status tracking
  is_verified: boolean;
  verified_by?: number;
  verified_at?: string;
  is_reconciled: boolean;
  reconciled_at?: string;
  reconciled_by?: number;

  // Receipt
  receipt_number?: string;

  // Metadata
  remarks?: string;
  recorded_by?: number;
  created_at: string;
  updated_at?: string;
}

export interface OfflinePaymentFormData {
  student_id: number;
  academic_year_id: number;
  amount: number;
  payment_method: PaymentMethod;
  payment_date?: string;
  cheque_number?: string;
  cheque_date?: string;
  bank_name?: string;
  branch_name?: string;
  transaction_id?: string;
  bank_reference?: string;
  remarks?: string;
  allocate_to?: PaymentAllocation[];
}

export interface PaymentStatistics {
  total_payments_count: number;
  total_amount_received: number;
  payments_today: number;
  amount_today: number;
  pending_verification_count: number;
  payments_by_method: Record<string, { count: number; amount: number }>;
}

// Student's outstanding fees for payment allocation
export interface OutstandingFeeItem {
  id: number;
  fee_type: 'fee_session' | 'adhoc_fee';
  description: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  due_date: string;
  is_overdue: boolean;
}
