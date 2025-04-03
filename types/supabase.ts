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
      // For example:
      // users: {
      //   Row: {
      //     id: string;
      //     email: string;
      //     // other fields
      //   };
      //   Insert: {
      //     id?: string;
      //     email: string;
      //     // other fields
      //   };
      //   Update: {
      //     id?: string;
      //     email?: string;
      //     // other fields
      //   };
      // };
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