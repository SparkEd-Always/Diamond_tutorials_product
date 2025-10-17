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

// Pagination response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
