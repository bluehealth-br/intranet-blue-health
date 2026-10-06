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
      submissions: {
        Row: {
          id: string;
          title: string;
          description: string;
          submitter_name: string;
          submitter_email: string;
          submitter_department: string;
          ai_tool: string;
          project_type: "website" | "app" | "dashboard" | "automacao" | "chatbot";
          project_url: string | null;
          urgency: "critica" | "alta" | "media" | "baixa";
          status: "novo" | "triagem" | "em_analise" | "aprovado" | "concluido" | "recusado";
          complexity: "simples" | "moderada" | "complexa" | null;
          webhook_secret: string | null;
          mirror_repo_url: string | null;
          last_synced_at: string | null;
          pending_commits: number;
          need: string;
          desire: string;
          triage_notes: string | null;
          approach: string | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          submitter_name: string;
          submitter_email: string;
          submitter_department: string;
          ai_tool: string;
          project_type: "website" | "app" | "dashboard" | "automacao" | "chatbot";
          project_url?: string | null;
          urgency?: "critica" | "alta" | "media" | "baixa";
          status?: "novo" | "triagem" | "em_analise" | "aprovado" | "concluido" | "recusado";
          complexity?: "simples" | "moderada" | "complexa" | null;
          webhook_secret?: string | null;
          mirror_repo_url?: string | null;
          last_synced_at?: string | null;
          pending_commits?: number;
          need?: string;
          desire?: string;
          triage_notes?: string | null;
          approach?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          submitter_name?: string;
          submitter_email?: string;
          submitter_department?: string;
          ai_tool?: string;
          project_type?: "website" | "app" | "dashboard" | "automacao" | "chatbot";
          project_url?: string | null;
          urgency?: "critica" | "alta" | "media" | "baixa";
          status?: "novo" | "triagem" | "em_analise" | "aprovado" | "concluido" | "recusado";
          complexity?: "simples" | "moderada" | "complexa" | null;
          webhook_secret?: string | null;
          mirror_repo_url?: string | null;
          last_synced_at?: string | null;
          pending_commits?: number;
          need?: string;
          desire?: string;
          triage_notes?: string | null;
          approach?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "";
            columns: [];
            isOneToOne: false;
            referencedRelation: "";
            referencedColumns: [];
          },
        ];
      };
      submission_files: {
        Row: {
          id: string;
          submission_id: string;
          name: string;
          size: number;
          type: string;
          path: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          name: string;
          size?: number;
          type?: string;
          path: string;
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          name?: string;
          size?: number;
          type?: string;
          path?: string;
          url?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submission_files_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      submission_updates: {
        Row: {
          id: string;
          submission_id: string;
          author_name: string;
          author_role: "solicitante" | "time" | "ia" | "github";
          message: string;
          files: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          author_name: string;
          author_role?: "solicitante" | "time" | "ia" | "github";
          message: string;
          files?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          author_name?: string;
          author_role?: "solicitante" | "time" | "ia" | "github";
          message?: string;
          files?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submission_updates_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      submission_urgency: "critica" | "alta" | "media" | "baixa";
      submission_status: "novo" | "triagem" | "em_analise" | "aprovado" | "concluido" | "recusado";
      project_type: "website" | "app" | "dashboard" | "automacao" | "chatbot";
      submission_complexity: "simples" | "moderada" | "complexa";
    };
    CompositeTypes: Record<string, never>;
  };
}
