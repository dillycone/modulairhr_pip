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
          employeeName: string;
          employeeId: string;
          managerName: string;
          managerId: string;
          title: string;
          startDate: string;
          endDate: string;
          status: string;
          progress: number;
          nextDueDate?: string;
          warningLevel: string;
          accountabilityStatus: string;
          accountabilityEndDate?: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          employeeName: string;
          employeeId: string;
          managerName: string;
          managerId: string;
          title: string;
          startDate: string;
          endDate: string;
          status: string;
          progress: number;
          nextDueDate?: string;
          warningLevel: string;
          accountabilityStatus: string;
          accountabilityEndDate?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          employeeName?: string;
          employeeId?: string;
          managerName?: string;
          managerId?: string;
          title?: string;
          startDate?: string;
          endDate?: string;
          status?: string;
          progress?: number;
          nextDueDate?: string;
          warningLevel?: string;
          accountabilityStatus?: string;
          accountabilityEndDate?: string;
          created_by?: string;
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