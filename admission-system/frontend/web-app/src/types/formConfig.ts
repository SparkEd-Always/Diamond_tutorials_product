/**
 * TypeScript types for Form Configuration
 */

export interface FormFieldMaster {
  id: number;
  field_code: string;
  field_label: string;
  field_type: string;
  category: string;
  default_step: number;
  is_required_by_default: boolean;
  validation_rules?: Record<string, any>;
  help_text?: string;
  placeholder?: string;
  options?: string[];
  file_config?: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface FormConfiguration {
  id: number;
  school_id: number;
  form_name: string;
  form_description?: string;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  updated_at?: string;
  field_count: number;
}

export interface FormConfigurationCreate {
  form_name: string;
  form_description?: string;
  is_active?: boolean;
  template_id?: number;
}

export interface FormConfigurationUpdate {
  form_name?: string;
  form_description?: string;
  is_active?: boolean;
}

export interface FormConfigurationDetail extends FormConfiguration {
  field_configurations: SchoolFormConfig[];
}

export interface SchoolFormConfig {
  id: number;
  form_config_id: number;
  school_id: number;
  field_id: number;
  is_enabled: boolean;
  is_required?: boolean;
  step_number: number;
  display_order: number;
  conditional_logic?: Record<string, any>;
  custom_label?: string;
  custom_help_text?: string;
  created_at: string;
  field: FormFieldMaster;
}

export interface FormTemplate {
  id: number;
  template_name: string;
  template_code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface FormTemplateField {
  id: number;
  template_id: number;
  field_id: number;
  is_enabled: boolean;
  is_required?: boolean;
  step_number: number;
  display_order: number;
  field: FormFieldMaster;
}

export interface FormTemplateDetail extends FormTemplate {
  template_fields: FormTemplateField[];
}

export interface SchoolFormConfigSummary {
  total_fields: number;
  enabled_fields: number;
  required_fields: number;
  fields_by_step: Record<number, number>;
  fields_by_category: Record<string, number>;
}

export interface FieldCategory {
  category: string;
  field_count: number;
}

export interface SchoolFormConfigCreate {
  field_id: number;
  is_enabled?: boolean;
  is_required?: boolean;
  step_number: number;
  display_order: number;
  conditional_logic?: Record<string, any>;
  custom_label?: string;
  custom_help_text?: string;
}

export interface SchoolFormConfigUpdate {
  is_enabled?: boolean;
  is_required?: boolean;
  step_number?: number;
  display_order?: number;
  conditional_logic?: Record<string, any>;
  custom_label?: string;
  custom_help_text?: string;
}

export interface ApplyTemplateRequest {
  template_id: number;
}

export interface BulkFieldUpdate {
  field_configs: SchoolFormConfigCreate[];
}
