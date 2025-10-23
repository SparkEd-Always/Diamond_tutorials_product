/**
 * Student Ledger TypeScript Types
 *
 * These types match the backend API responses for the student financial ledger system.
 * The ledger is the single source of truth for all student financial transactions.
 */

/**
 * Ledger Entry Types (Transaction Types)
 */
export type LedgerEntryType =
  // CHARGES (Debits - Money Owed by Student)
  | 'fee_assignment'      // Regular fee structure assignment
  | 'adhoc_fee'           // One-time fees (lost items, etc.)
  | 'late_fee'            // Overdue penalties
  | 'fine'                // Disciplinary fines
  | 'adjustment_debit'    // Manual increase in balance

  // PAYMENTS (Credits - Money Received from Student)
  | 'payment_online'      // Online payments (UPI, cards, etc.)
  | 'payment_cash'        // Cash at school office
  | 'payment_cheque'      // Cheque payment
  | 'payment_dd'          // Demand draft
  | 'payment_bank_transfer' // NEFT/RTGS/IMPS
  | 'payment_upi'         // UPI payments

  // ADJUSTMENTS (Credits - Reductions in Amount Due)
  | 'discount'            // Discounts applied
  | 'waiver'              // Fee waivers
  | 'scholarship'         // Scholarship credits
  | 'refund'              // Refund to student
  | 'adjustment_credit'   // Manual decrease in balance

  // CORRECTIONS
  | 'reversal';           // Reverse a previous transaction

/**
 * Payment Method Types
 */
export type PaymentMethod =
  | 'cash'
  | 'upi'
  | 'card'
  | 'cheque'
  | 'bank_transfer'
  | 'dd'
  | 'online';

/**
 * Base Ledger Transaction
 * Represents a single financial transaction in the student ledger
 */
export interface LedgerTransaction {
  id: number;
  transaction_number: string;          // TXN/2024-25/000001
  transaction_date: string;             // ISO date string
  student_id: number;
  academic_year_id: number;
  entry_type: LedgerEntryType;
  debit_amount: number;                 // Amount charged (fees)
  credit_amount: number;                // Amount paid/reduced
  balance: number;                      // Balance after this transaction
  description: string;
  remarks?: string;
  transaction_metadata?: Record<string, any>;

  // Payment details (for payment entries)
  payment_method?: PaymentMethod;
  payment_reference?: string;           // Transaction ID, cheque number, etc.

  // References to source records
  reference_type?: string;              // 'fee_session', 'adhoc_fee', 'payment', etc.
  reference_id?: number;
  fee_session_id?: number;
  adhoc_fee_id?: number;
  payment_id?: number;
  invoice_id?: number;

  // Reversal support
  is_reversed: boolean;
  reversed_by?: number;
  reversed_at?: string;
  reversal_transaction_id?: number;
  reverses_transaction_id?: number;

  // Audit trail
  created_by?: number;
  created_at: string;
  is_locked: boolean;
}

/**
 * Ledger Timeline Item (Simplified for Timeline View)
 */
export interface LedgerTimelineItem {
  id: number;
  transaction_number: string;
  transaction_date: string;
  entry_type: LedgerEntryType;
  description: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  payment_method?: PaymentMethod;
  is_reversed: boolean;
  created_at: string;
}

/**
 * Ledger Summary (Balance Overview)
 */
export interface LedgerSummary {
  total_debits: number;      // Total fees assigned
  total_credits: number;     // Total payments received
  current_balance: number;   // Outstanding amount (debits - credits)
  transaction_count: number; // Number of transactions
}

/**
 * Student Ledger Detail (Full Ledger with Timeline)
 */
export interface StudentLedgerDetail {
  student_id: number;
  student_name: string;
  admission_number: string;
  roll_number?: string;
  summary: LedgerSummary;
  timeline: LedgerTimelineItem[];
  total_transactions: number;
  page_size: number;
  page_number: number;
}

/**
 * Manual Ledger Entry Creation (Admin creates manual entry)
 */
export interface ManualLedgerEntryCreate {
  student_id: number;
  academic_year_id: number;
  entry_type: LedgerEntryType;
  amount: number;
  description: string;
  transaction_date?: string;      // Defaults to now if not provided
  payment_method?: PaymentMethod;
  payment_reference?: string;
}

/**
 * Reversal Request (Reverse a transaction)
 */
export interface ReversalRequest {
  transaction_id: number;
  reason: string;
}

/**
 * Ledger Statistics (Overall System Stats)
 */
export interface LedgerStatistics {
  total_transactions: number;
  total_debits: number;
  total_credits: number;
  net_outstanding: number;
  breakdown_by_type: {
    entry_type: string;
    count: number;
    debit_total: number;
    credit_total: number;
  }[];
}

/**
 * Search Transaction Result
 */
export interface TransactionSearchResult {
  id: number;
  transaction_number: string;
  transaction_date: string;
  student_id: number;
  student_name: string;
  admission_number: string;
  entry_type: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  payment_method?: string;
  is_reversed: boolean;
}

/**
 * Search Transactions Response
 */
export interface SearchTransactionsResponse {
  total_count: number;
  page_size: number;
  page_number: number;
  transactions: TransactionSearchResult[];
}

/**
 * Ledger Query Parameters (Filtering and Pagination)
 */
export interface LedgerQueryParams {
  academic_year_id?: number;
  entry_type?: LedgerEntryType;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}

/**
 * Search Query Parameters
 */
export interface SearchQueryParams extends LedgerQueryParams {
  query: string;
  min_amount?: number;
  max_amount?: number;
}

/**
 * Entry Type Display Config (For UI rendering)
 */
export interface EntryTypeConfig {
  value: LedgerEntryType;
  label: string;
  color: 'error' | 'success' | 'info' | 'warning';
  icon: string;
  isDebit: boolean;
}

/**
 * Entry Type Configurations for UI
 */
export const LEDGER_ENTRY_TYPES: EntryTypeConfig[] = [
  // Debits (Charges)
  { value: 'fee_assignment', label: 'Fee Assignment', color: 'error', icon: '📚', isDebit: true },
  { value: 'adhoc_fee', label: 'Adhoc Fee', color: 'error', icon: '💰', isDebit: true },
  { value: 'late_fee', label: 'Late Fee', color: 'error', icon: '⏰', isDebit: true },
  { value: 'fine', label: 'Fine', color: 'error', icon: '⚠️', isDebit: true },
  { value: 'adjustment_debit', label: 'Adjustment (Debit)', color: 'error', icon: '📝', isDebit: true },

  // Credits (Payments)
  { value: 'payment_online', label: 'Online Payment', color: 'success', icon: '💳', isDebit: false },
  { value: 'payment_cash', label: 'Cash Payment', color: 'success', icon: '💵', isDebit: false },
  { value: 'payment_cheque', label: 'Cheque Payment', color: 'success', icon: '📄', isDebit: false },
  { value: 'payment_dd', label: 'Demand Draft', color: 'success', icon: '🏦', isDebit: false },
  { value: 'payment_bank_transfer', label: 'Bank Transfer', color: 'success', icon: '🏧', isDebit: false },
  { value: 'payment_upi', label: 'UPI Payment', color: 'success', icon: '📱', isDebit: false },

  // Adjustments (Credits)
  { value: 'discount', label: 'Discount', color: 'info', icon: '🎫', isDebit: false },
  { value: 'waiver', label: 'Waiver', color: 'info', icon: '🎓', isDebit: false },
  { value: 'scholarship', label: 'Scholarship', color: 'info', icon: '🏆', isDebit: false },
  { value: 'refund', label: 'Refund', color: 'info', icon: '↩️', isDebit: false },
  { value: 'adjustment_credit', label: 'Adjustment (Credit)', color: 'info', icon: '📝', isDebit: false },

  // Corrections
  { value: 'reversal', label: 'Reversal', color: 'warning', icon: '🔄', isDebit: false },
];

/**
 * Get entry type configuration
 */
export const getEntryTypeConfig = (entryType: LedgerEntryType): EntryTypeConfig | undefined => {
  return LEDGER_ENTRY_TYPES.find(type => type.value === entryType);
};

/**
 * Format currency (Indian Rupees)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
