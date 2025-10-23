import api from './api';
import type {
  FeeType,
  FeeStructure,
  StudentFeeAssignment,
  StudentFeeLedger,
  FeeSession,
  FeeSessionDetail,
  FeeSessionFormData,
  FeeSessionSummary,
  FilteredStudent,
  StudentFilterCriteria,
  PaginatedResponse,
} from '../types/fees';

// ============================================================================
// Fee Types API
// ============================================================================

export const feeTypeApi = {
  list: async (params?: {
    is_active?: boolean;
    frequency?: string;
    skip?: number;
    limit?: number;
  }): Promise<FeeType[]> => {
    const response = await api.get('/fees/types', { params });
    return response.data;
  },

  get: async (id: number): Promise<FeeType> => {
    const response = await api.get(`/fees/types/${id}`);
    return response.data;
  },

  create: async (data: Omit<FeeType, 'id' | 'created_at' | 'updated_at'>): Promise<FeeType> => {
    const response = await api.post('/fees/types', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Omit<FeeType, 'id' | 'created_at' | 'updated_at'>>): Promise<FeeType> => {
    const response = await api.put(`/fees/types/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/fees/types/${id}`);
  },
};

// ============================================================================
// Fee Structures API
// ============================================================================

export const feeStructureApi = {
  list: async (params?: {
    academic_year_id?: number;
    class_id?: number;
    fee_type_id?: number;
    is_active?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<FeeStructure[]> => {
    const response = await api.get('/fees/structures', { params });
    return response.data;
  },

  get: async (id: number): Promise<FeeStructure> => {
    const response = await api.get(`/fees/structures/${id}`);
    return response.data;
  },

  create: async (data: Omit<FeeStructure, 'id' | 'created_at' | 'updated_at'>): Promise<FeeStructure> => {
    const response = await api.post('/fees/structures', data);
    return response.data;
  },

  bulkCreate: async (data: Omit<FeeStructure, 'id' | 'created_at' | 'updated_at'>[]): Promise<FeeStructure[]> => {
    const response = await api.post('/fees/structures/bulk', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Omit<FeeStructure, 'id' | 'created_at' | 'updated_at'>>): Promise<FeeStructure> => {
    const response = await api.put(`/fees/structures/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/fees/structures/${id}`);
  },
};

// ============================================================================
// Student Fee Assignments API
// ============================================================================

export const assignmentApi = {
  list: async (params?: {
    student_id?: number;
    fee_structure_id?: number;
    is_active?: boolean;
    is_waived?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<StudentFeeAssignment[]> => {
    const response = await api.get('/fees/assignments', { params });
    return response.data;
  },

  get: async (id: number): Promise<StudentFeeAssignment> => {
    const response = await api.get(`/fees/assignments/${id}`);
    return response.data;
  },

  create: async (data: Omit<StudentFeeAssignment, 'id' | 'assigned_at' | 'waived_by' | 'waived_at' | 'assigned_by' | 'final_amount'>): Promise<StudentFeeAssignment> => {
    const response = await api.post('/fees/assignments', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Omit<StudentFeeAssignment, 'id' | 'assigned_at' | 'waived_by' | 'waived_at' | 'assigned_by' | 'final_amount'>>): Promise<StudentFeeAssignment> => {
    const response = await api.put(`/fees/assignments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/fees/assignments/${id}`);
  },
};

// ============================================================================
// Student Ledgers API
// ============================================================================

export const ledgerApi = {
  getStudentLedger: async (studentId: number, academicYearId?: number): Promise<StudentFeeLedger> => {
    const params = academicYearId ? { academic_year_id: academicYearId } : {};
    const response = await api.get(`/fees/ledgers/${studentId}`, { params });
    return response.data;
  },

  listSummaries: async (_params?: {
    academic_year_id?: number;
    has_outstanding?: boolean;
    has_overdue?: boolean;
    is_defaulter?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<StudentFeeLedger[]> => {
    // TODO: This endpoint doesn't exist yet - returning empty array
    // Use the new ledgerApi from ledgerApi.ts for the new ledger system
    console.warn('Old ledger API listSummaries() called - endpoint not implemented. Use new ledgerApi instead.');
    return [];
  },

  listDefaulters: async (_params?: {
    academic_year_id?: number;
    skip?: number;
    limit?: number;
  }): Promise<StudentFeeLedger[]> => {
    // TODO: This endpoint doesn't exist yet - returning empty array
    console.warn('Old ledger API listDefaulters() called - endpoint not implemented.');
    return [];
  },
};

// ============================================================================
// Fee Sessions API
// ============================================================================

export const feeSessionApi = {
  list: async (params?: {
    status_filter?: string;
    academic_year_id?: number;
    skip?: number;
    limit?: number;
  }): Promise<FeeSession[]> => {
    const response = await api.get('/fees/sessions', { params });
    return response.data;
  },

  get: async (id: number): Promise<FeeSessionDetail> => {
    const response = await api.get(`/fees/sessions/${id}`);
    return response.data;
  },

  create: async (data: FeeSessionFormData): Promise<FeeSession> => {
    const response = await api.post('/fees/sessions', data);
    return response.data;
  },

  update: async (id: number, data: Partial<FeeSessionFormData>): Promise<FeeSession> => {
    const response = await api.put(`/fees/sessions/${id}`, data);
    return response.data;
  },

  close: async (id: number): Promise<FeeSession> => {
    const response = await api.post(`/fees/sessions/${id}/close`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/fees/sessions/${id}`);
  },

  filterStudents: async (criteria: StudentFilterCriteria): Promise<FilteredStudent[]> => {
    console.log("sending to backend");
    const response = await api.post('/fees/sessions/filter-students', criteria);
    console.log("This is the response from the api", response);
    return response.data;
  },

  getSummary: async (): Promise<FeeSessionSummary> => {
    const response = await api.get('/fees/sessions/stats/summary');
    return response.data;
  },
};

// ============================================================================
// Adhoc Fees API
// ============================================================================

export const adhocFeeApi = {
  list: async (params?: {
    payment_status?: string;
    student_id?: number;
    is_paid?: boolean;
    is_active?: boolean;
    search_query?: string;
    skip?: number;
    limit?: number;
  }): Promise<import('../types/fees').AdhocFeeListItem[]> => {
    const response = await api.get('/fees/adhoc', { params });
    return response.data;
  },

  get: async (id: number): Promise<import('../types/fees').AdhocFeeAssignment> => {
    const response = await api.get(`/fees/adhoc/${id}`);
    return response.data;
  },

  create: async (data: import('../types/fees').AdhocFeeFormData): Promise<import('../types/fees').AdhocFeeAssignment[]> => {
    const response = await api.post('/fees/adhoc', data);
    return response.data;
  },

  update: async (id: number, data: Partial<import('../types/fees').AdhocFeeFormData>): Promise<import('../types/fees').AdhocFeeAssignment> => {
    const response = await api.put(`/fees/adhoc/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/fees/adhoc/${id}`);
  },

  getByStudent: async (studentId: number, isPaid?: boolean): Promise<import('../types/fees').AdhocFeeListItem[]> => {
    const params = isPaid !== undefined ? { is_paid: isPaid } : {};
    const response = await api.get(`/fees/adhoc/student/${studentId}`, { params });
    return response.data;
  },

  getSummary: async (): Promise<import('../types/fees').AdhocFeeSummary> => {
    const response = await api.get('/fees/adhoc/stats/summary');
    return response.data;
  },
};

export default {
  feeTypeApi,
  feeStructureApi,
  assignmentApi,
  ledgerApi,
  feeSessionApi,
  adhocFeeApi,
};
