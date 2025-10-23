/**
 * Student Ledger API Service
 *
 * Handles all API calls related to student financial ledger.
 * The ledger is the single source of truth for student finances.
 */

import api from './api';
import type {
  LedgerTransaction,
  LedgerSummary,
  StudentLedgerDetail,
  ManualLedgerEntryCreate,
  ReversalRequest,
  LedgerStatistics,
  SearchTransactionsResponse,
  LedgerQueryParams,
  SearchQueryParams,
} from '../types/ledger';

const LEDGER_BASE_URL = '/api/v1/fees/ledgers';

/**
 * Ledger API Methods
 */
export const ledgerApi = {
  /**
   * Get student's complete ledger timeline with transactions
   * @param studentId - Student ID
   * @param params - Query parameters (filters, pagination)
   * @returns Student ledger with timeline and summary
   */
  getStudentLedger: async (
    studentId: number,
    params?: LedgerQueryParams
  ): Promise<StudentLedgerDetail> => {
    const response = await api.get(`${LEDGER_BASE_URL}/student/${studentId}`, { params });
    return response.data;
  },

  /**
   * Get student's ledger summary (balance overview)
   * Lightweight endpoint for dashboard display
   * @param studentId - Student ID
   * @param academicYearId - Optional academic year filter
   * @returns Ledger summary with balances
   */
  getLedgerSummary: async (
    studentId: number,
    academicYearId?: number
  ): Promise<LedgerSummary> => {
    const params = academicYearId ? { academic_year_id: academicYearId } : {};
    const response = await api.get(`${LEDGER_BASE_URL}/student/${studentId}/summary`, { params });
    return response.data;
  },

  /**
   * Create manual ledger entry (admin only)
   * Used for offline payments, adjustments, etc.
   * @param data - Manual entry data
   * @returns Created ledger transaction
   */
  createManualEntry: async (
    data: ManualLedgerEntryCreate
  ): Promise<LedgerTransaction> => {
    const response = await api.post(`${LEDGER_BASE_URL}/manual-entry`, data);
    return response.data;
  },

  /**
   * Reverse a transaction (admin only)
   * Creates opposite entry to correct mistakes
   * @param transactionId - Transaction ID to reverse
   * @param reason - Reason for reversal
   * @returns Reversal transaction
   */
  reverseTransaction: async (
    transactionId: number,
    reason: string
  ): Promise<LedgerTransaction> => {
    const data: ReversalRequest = { transaction_id: transactionId, reason };
    const response = await api.post(`${LEDGER_BASE_URL}/reversal`, data);
    return response.data;
  },

  /**
   * Get detailed information about a specific transaction
   * @param transactionId - Transaction ID
   * @returns Transaction details
   */
  getTransactionDetails: async (
    transactionId: number
  ): Promise<LedgerTransaction> => {
    const response = await api.get(`${LEDGER_BASE_URL}/transaction/${transactionId}`);
    return response.data;
  },

  /**
   * Get overall ledger statistics (admin dashboard)
   * @param academicYearId - Optional academic year filter
   * @returns System-wide ledger statistics
   */
  getOverallStats: async (
    academicYearId?: number
  ): Promise<LedgerStatistics> => {
    const params = academicYearId ? { academic_year_id: academicYearId } : {};
    const response = await api.get(`${LEDGER_BASE_URL}/stats`, { params });
    return response.data;
  },

  /**
   * Search transactions across all students
   * @param query - Search query (transaction number, description, student name)
   * @param params - Additional filters
   * @returns Search results
   */
  searchTransactions: async (
    query: string,
    params?: Omit<SearchQueryParams, 'query'>
  ): Promise<SearchTransactionsResponse> => {
    const response = await api.get(`${LEDGER_BASE_URL}/search`, {
      params: { query, ...params },
    });
    return response.data;
  },

  /**
   * Export student ledger as PDF
   * @param studentId - Student ID
   * @param academicYearId - Optional academic year filter
   * @returns PDF blob
   */
  exportLedgerPDF: async (
    studentId: number,
    academicYearId?: number
  ): Promise<Blob> => {
    const params = academicYearId ? { academic_year_id: academicYearId, format: 'pdf' } : { format: 'pdf' };
    const response = await api.get(`${LEDGER_BASE_URL}/export/${studentId}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Export student ledger as Excel
   * @param studentId - Student ID
   * @param academicYearId - Optional academic year filter
   * @returns Excel blob
   */
  exportLedgerExcel: async (
    studentId: number,
    academicYearId?: number
  ): Promise<Blob> => {
    const params = academicYearId ? { academic_year_id: academicYearId, format: 'excel' } : { format: 'excel' };
    const response = await api.get(`${LEDGER_BASE_URL}/export/${studentId}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Export student ledger as CSV
   * @param studentId - Student ID
   * @param academicYearId - Optional academic year filter
   * @returns CSV blob
   */
  exportLedgerCSV: async (
    studentId: number,
    academicYearId?: number
  ): Promise<Blob> => {
    const params = academicYearId ? { academic_year_id: academicYearId, format: 'csv' } : { format: 'csv' };
    const response = await api.get(`${LEDGER_BASE_URL}/export/${studentId}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default ledgerApi;
