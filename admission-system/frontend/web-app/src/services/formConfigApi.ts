/**
 * Form Configuration API Service
 */
import api from './api';
import type {
  FormFieldMaster,
  SchoolFormConfig,
  FormConfiguration,
  FormConfigurationCreate,
  FormConfigurationUpdate,
  FormConfigurationDetail,
  FormTemplate,
  FormTemplateDetail,
  SchoolFormConfigSummary,
  FieldCategory,
  SchoolFormConfigCreate,
  SchoolFormConfigUpdate,
  ApplyTemplateRequest,
  BulkFieldUpdate,
} from '../types/formConfig';

// ============= Form Configuration Management =============

export const getAllForms = async (isActive?: boolean): Promise<FormConfiguration[]> => {
  const params: any = {};
  if (isActive !== undefined) params.is_active = isActive;

  const response = await api.get<FormConfiguration[]>('/form-config/forms', { params });
  return response.data;
};

export const getFormById = async (formId: number): Promise<FormConfigurationDetail> => {
  const response = await api.get<FormConfigurationDetail>(`/form-config/forms/${formId}`);
  return response.data;
};

export const createForm = async (
  formData: FormConfigurationCreate
): Promise<FormConfiguration> => {
  const response = await api.post<FormConfiguration>('/form-config/forms', formData);
  return response.data;
};

export const updateForm = async (
  formId: number,
  formData: FormConfigurationUpdate
): Promise<FormConfiguration> => {
  const response = await api.put<FormConfiguration>(
    `/form-config/forms/${formId}`,
    formData
  );
  return response.data;
};

export const deleteForm = async (formId: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/form-config/forms/${formId}`);
  return response.data;
};

// ============= Master Fields =============

export const getMasterFields = async (
  category?: string,
  isActive: boolean = true
): Promise<FormFieldMaster[]> => {
  const params: any = { is_active: isActive };
  if (category) params.category = category;

  const response = await api.get<FormFieldMaster[]>('/form-config/fields/master', { params });
  return response.data;
};

export const getFieldCategories = async (): Promise<FieldCategory[]> => {
  const response = await api.get<FieldCategory[]>('/form-config/fields/categories');
  return response.data;
};

// ============= School Configuration =============

export const getSchoolFormConfig = async (
  formConfigId?: number,
  stepNumber?: number,
  category?: string
): Promise<SchoolFormConfig[]> => {
  const params: any = {};
  if (formConfigId) params.form_config_id = formConfigId;
  if (stepNumber) params.step_number = stepNumber;
  if (category) params.category = category;

  const response = await api.get<SchoolFormConfig[]>('/form-config/school/config', { params });
  return response.data;
};

export const getSchoolConfigSummary = async (): Promise<SchoolFormConfigSummary> => {
  const response = await api.get<SchoolFormConfigSummary>('/form-config/school/config/summary');
  return response.data;
};

export const createFieldConfig = async (
  config: SchoolFormConfigCreate
): Promise<SchoolFormConfig> => {
  const response = await api.post<SchoolFormConfig>('/form-config/school/config', config);
  return response.data;
};

export const updateFieldConfig = async (
  configId: number,
  update: SchoolFormConfigUpdate
): Promise<SchoolFormConfig> => {
  const response = await api.put<SchoolFormConfig>(
    `/form-config/school/config/${configId}`,
    update
  );
  return response.data;
};

export const deleteFieldConfig = async (configId: number): Promise<void> => {
  await api.delete(`/form-config/school/config/${configId}`);
};

export const bulkUpdateConfig = async (bulkUpdate: BulkFieldUpdate): Promise<any> => {
  const response = await api.post('/form-config/school/config/bulk', bulkUpdate);
  return response.data;
};

// ============= Templates =============

export const getTemplates = async (isActive: boolean = true): Promise<FormTemplate[]> => {
  const response = await api.get<FormTemplate[]>('/form-config/templates', {
    params: { is_active: isActive },
  });
  return response.data;
};

export const getTemplateDetail = async (templateId: number): Promise<FormTemplateDetail> => {
  const response = await api.get<FormTemplateDetail>(`/form-config/templates/${templateId}`);
  return response.data;
};

export const applyTemplate = async (request: ApplyTemplateRequest): Promise<any> => {
  const response = await api.post('/form-config/templates/apply', request);
  return response.data;
};

// ============= Export as object =============

const formConfigApi = {
  // Form Management
  getAllForms,
  getFormById,
  createForm,
  updateForm,
  deleteForm,
  // Master Fields
  getMasterFields,
  getFieldCategories,
  // School Configuration
  getSchoolFormConfig,
  getSchoolConfigSummary,
  createFieldConfig,
  updateFieldConfig,
  deleteFieldConfig,
  bulkUpdateConfig,
  // Templates
  getTemplates,
  getTemplateDetail,
  applyTemplate,
};

export default formConfigApi;
