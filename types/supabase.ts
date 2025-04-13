export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Define your tables here if you know them
      employees: {
        Row: {
          id: string;
          // Add other employee fields as needed
        };
        Insert: {
          id?: string;
          // Add other employee fields as needed
        };
        Update: {
          id?: string;
          // Add other employee fields as needed
        };
      };
      pips: {
        Row: {
          id: string;
          employee_name: string;
          position?: string;
          department?: string;
          manager_name?: string;
          start_date: string;
          end_date?: string;
          review_date?: string;
          status: string;
          performance_issues?: string;
          improvement_goals?: string;
          resources_support?: string;
          consequences?: string;
          objectives?: string;
          improvements_needed?: string;
          success_metrics?: string;
          generated_content?: string;
          progress: number;
          next_due_date?: string;
          warning_level?: string;
          accountability_status?: string;
          accountability_end_date?: string;
          transcript_data?: string;
          transcript_summary?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          employee_name: string;
          position?: string;
          department?: string;
          manager_name?: string;
          start_date: string;
          end_date?: string;
          review_date?: string;
          status?: string;
          performance_issues?: string;
          improvement_goals?: string;
          resources_support?: string;
          consequences?: string;
          objectives?: string;
          improvements_needed?: string;
          success_metrics?: string;
          generated_content?: string;
          progress?: number;
          next_due_date?: string;
          warning_level?: string;
          accountability_status?: string;
          accountability_end_date?: string;
          transcript_data?: string;
          transcript_summary?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_name?: string;
          position?: string;
          department?: string;
          manager_name?: string;
          start_date?: string;
          end_date?: string;
          review_date?: string;
          status?: string;
          performance_issues?: string;
          improvement_goals?: string;
          resources_support?: string;
          consequences?: string;
          objectives?: string;
          improvements_needed?: string;
          success_metrics?: string;
          generated_content?: string;
          progress?: number;
          next_due_date?: string;
          warning_level?: string;
          accountability_status?: string;
          accountability_end_date?: string;
          transcript_data?: string;
          transcript_summary?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      transcripts: {
        Row: {
          id: string;
          title: string;
          content: string;
          date: string;
          duration: string;
          speakers: number;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          date: string;
          duration: string;
          speakers: number;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          date?: string;
          duration?: string;
          speakers?: number;
          user_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      // Define your views here
    };
    Functions: {
      // Define your functions here
    };
    Enums: {
      // Define your enums here
    };
  };
}