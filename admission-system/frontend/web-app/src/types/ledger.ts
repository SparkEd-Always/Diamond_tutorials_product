/**
 * Ledger Type Definitions
 *
 * TypeScript types for student fee ledger and transactions
 */

// ============================================================================
// Ledger Transaction Types
// ============================================================================

export type LedgerEntryType =
  // Fee Assignments (Debits)
  | 'fee_assignment'
  | 'adhoc_fee'
  | 'late_fee'
  | 'penalty'
  // Payments (Credits)
  | 'payment_online'
  | 'payment_cash'
  | 'payment_cheque'
  | 'payment_dd'
  | 'payment_bank_transfer'
  // Adjustments (Credits)
  | 'discount'
  | 'waiver'
  | 'refund'
  | 'late_fee_reversal'
  | 'write_off'
  // Corrections
  | 'reversal';

export interface LedgerTransaction {
  id: number;
  transaction_number: string;
  transaction_date: string;
  student_id: number;
  academic_year_id: number;
  entry_type: LedgerEntryType | string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  reference_type?: string;
  reference_id?: number;
  fee_session_id?: number;
  adhoc_fee_id?: number;
  payment_id?: number;
  invoice_id?: number;
  description: string;
  remarks?: string;
  metadata?: Record<string, any>;
  created_by?: number;
  created_at: string;
  is_reversed: boolean;
  reversed_by?: number;
  reversed_at?: string;
  reversal_transaction_id?: number;

  // Populated from relationships (optional)
  student_name?: string;
  academic_year_name?: string;
  created_by_name?: string;
}

export interface LedgerTimelineItem {
  id: number;
  transaction_number: string;
  transaction_date: string;
  entry_type: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  description: string;
  remarks?: string;
  is_reversed: boolean;
  created_at: string;
  payment_method?: string;
}

// ============================================================================
// Ledger Summary Types
// ============================================================================

export interface LedgerSummary {
  student_id: number;
  academic_year_id: number;
  total_debits: number;
  total_credits: number;
  current_balance: number;
  transaction_count: number;
  first_transaction_date?: string;
  last_transaction_date?: string;

  // Additional calculated fields
  total_fees_assigned?: number;
  total_paid?: number;
  total_adjustments?: number;
}

export interface StudentFeeLedger {
  id: number;
  student_id: number;
  academic_year_id: number;
  total_fees_assigned: number;
  total_paid: number;
  total_outstanding: number;
  total_discount: number;
  total_late_fee: number;
  has_outstanding: boolean;
  has_overdue: boolean;
  is_defaulter: boolean;
  last_payment_date?: string;
  last_payment_amount?: number;
  updated_at: string;

  // Optional populated fields
  student_name?: string;
  first_name?: string;
  last_name?: string;
  academic_year_name?: string;
}

export interface StudentLedgerDetail {
  student_id: number;
  student_name: string;
  admission_number: string;
  roll_number?: string;
  academic_year_id: number;
  academic_year_name: string;
  summary: LedgerSummary;
  timeline: LedgerTimelineItem[];
  total_transactions: number;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface LedgerTransactionListResponse {
  transactions: LedgerTransaction[];
  total_count: number;
  page_number: number;
  page_size: number;
  total_pages: number;
  current_balance: number;
  total_debits: number;
  total_credits: number;
}

export interface LedgerTransactionFilters {
  student_id: number;
  academic_year_id?: number;
  entry_type?: string;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}

export interface ManualEntryCreate {
  student_id: number;
  academic_year_id: number;
  entry_type: LedgerEntryType | string;
  amount: number;
  description: string;
  transaction_date?: string;
  remarks?: string;
}

export interface ManualLedgerEntryCreate extends ManualEntryCreate {}

export interface LedgerQueryParams {
  skip?: number;
  limit?: number;
  entry_type?: string;
  start_date?: string;
  end_date?: string;
  academic_year_id?: number;
}

export interface SearchQueryParams {
  query: string;
  skip?: number;
  limit?: number;
  entry_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface LedgerStatistics {
  total_students: number;
  total_transactions: number;
  total_debits: number;
  total_credits: number;
  total_outstanding: number;
  students_with_outstanding: number;
  students_with_credit_balance: number;
  average_balance: number;
  median_balance: number;
  total_defaulters?: number;
}

export interface SearchTransactionsResponse {
  transactions: LedgerTransaction[];
  total_count: number;
  page_number: number;
  page_size: number;
  total_pages: number;
}

export interface ReversalRequest {
  transaction_id: number;
  reason: string;
}

// ============================================================================
// Payment Allocation Types
// ============================================================================

export interface PaymentAllocation {
  payment_id: number;
  student_id: number;
  fee_type: 'fee_session' | 'adhoc_fee';
  fee_session_id?: number;
  adhoc_fee_id?: number;
  allocated_amount: number;
  fee_description: string;
  allocated_by?: number;
  allocated_at?: string;
}

export interface PaymentAllocationRequest {
  fee_session_id?: number;
  adhoc_fee_id?: number;
  amount: number;
}

export interface PaymentAllocationResponse {
  fee_session_id?: number;
  adhoc_fee_id?: number;
  fee_description: string;
  allocated_amount: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getEntryTypeLabel(entryType: string): string {
  const labels: Record<string, string> = {
    'fee_assignment': 'Fee Assignment',
    'adhoc_fee': 'Adhoc Fee',
    'late_fee': 'Late Fee',
    'penalty': 'Penalty',
    'payment_online': 'Online Payment',
    'payment_cash': 'Cash Payment',
    'payment_cheque': 'Cheque Payment',
    'payment_dd': 'Demand Draft',
    'payment_bank_transfer': 'Bank Transfer',
    'discount': 'Discount',
    'waiver': 'Waiver',
    'refund': 'Refund',
    'late_fee_reversal': 'Late Fee Reversal',
    'write_off': 'Write Off',
    'reversal': 'Reversal',
  };
  return labels[entryType] || entryType;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getBalanceColor(balance: number): 'error' | 'success' | 'default' {
  if (balance > 0) return 'error'; // Outstanding (student owes money)
  if (balance < 0) return 'success'; // Credit (school owes money)
  return 'default'; // Zero balance
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Entry type configuration for UI display
export interface EntryTypeConfig {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  isDebit: boolean;
}

export const LEDGER_ENTRY_TYPES: Record<string, EntryTypeConfig> = {
  'fee_assignment': { label: 'Fee Assignment', color: 'error', isDebit: true },
  'adhoc_fee': { label: 'Adhoc Fee', color: 'warning', isDebit: true },
  'late_fee': { label: 'Late Fee', color: 'error', isDebit: true },
  'penalty': { label: 'Penalty', color: 'error', isDebit: true },
  'payment_online': { label: 'Online Payment', color: 'success', isDebit: false },
  'payment_cash': { label: 'Cash Payment', color: 'success', isDebit: false },
  'payment_cheque': { label: 'Cheque Payment', color: 'success', isDebit: false },
  'payment_dd': { label: 'Demand Draft', color: 'success', isDebit: false },
  'payment_bank_transfer': { label: 'Bank Transfer', color: 'success', isDebit: false },
  'discount': { label: 'Discount', color: 'info', isDebit: false },
  'waiver': { label: 'Waiver', color: 'info', isDebit: false },
  'refund': { label: 'Refund', color: 'primary', isDebit: false },
  'late_fee_reversal': { label: 'Late Fee Reversal', color: 'info', isDebit: false },
  'write_off': { label: 'Write Off', color: 'warning', isDebit: false },
  'reversal': { label: 'Reversal', color: 'secondary', isDebit: false },
};

export function getEntryTypeConfig(entryType: string): EntryTypeConfig | undefined {
  return LEDGER_ENTRY_TYPES[entryType];
}
