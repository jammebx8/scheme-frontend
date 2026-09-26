const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://scheme-backend-ten.vercel.app";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("govassist_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errData = await response.json();
      errorMessage = errData.detail || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// ─── Auth ──────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  state?: string;
  district?: string;
  annual_income?: number;
  caste_category?: string;
  is_student?: boolean;
  is_farmer?: boolean;
  occupation?: string;
  disability_status?: boolean;
  profile_complete?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export const auth = {
  signup: (data: { email: string; password: string; full_name: string; phone?: string }) =>
    request<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  me: () => request<UserProfile>("/auth/me"),
};

// ─── Users ─────────────────────────────────────────────
export const users = {
  getProfile: () => request<UserProfile>("/users/me"),

  updateProfile: (data: Partial<UserProfile>) =>
    request<UserProfile>("/users/me", { method: "PATCH", body: JSON.stringify(data) }),

  getDocuments: () => request<UserDocument[]>("/documents/"),
};

// ─── Documents ─────────────────────────────────────────
export interface UserDocument {
  id: string;
  user_id: string;
  doc_type: string;
  file_url?: string;
  digilocker_uri?: string;
  extracted_data?: Record<string, unknown>;
  verified: boolean;
  uploaded_at?: string;
}

export const documents = {
  upload: (docType: string, file: File) => {
    const formData = new FormData();
    formData.append("doc_type", docType);
    formData.append("file", file);
    return request<UserDocument>("/documents/upload", { method: "POST", body: formData });
  },

  list: () => request<UserDocument[]>("/documents/"),

  delete: (docId: string) =>
    request<{ deleted: boolean }>(`/documents/${docId}`, { method: "DELETE" }),
};

// ─── Schemes ───────────────────────────────────────────
export interface Scheme {
  id: string;
  scheme_name: string;
  slug: string;
  details: string;
  benefits: string;
  eligibility: string;
  application?: string;
  documents?: string;
  level: string;
  scheme_category: string;
  tags?: string[];
  eligible?: boolean;
  eligibility_reason?: string;
  // AI-simplified fields (populated on scheme detail page)
  summary?: string;
  benefits_simple?: string;
  eligibility_simple?: string;
  documents_simple?: string;
  // Profile match score 0–100 (populated by /recommend endpoint)
  match_score?: number;
}

export interface SchemesListResponse {
  schemes: Scheme[];
  page: number;
  page_size: number;
}

export interface VectorSearchResponse {
  schemes: Scheme[];
  query: string;
  total: number;
  search_type: "vector";
}

export interface RecommendResponse {
  schemes: Scheme[];
  total: number;
  recommendation_type: "vector_similarity" | "popular";
}

export const schemes = {
  /** Browse schemes with optional category/level filter + cursor pagination */
  list: (params?: { category?: string; level?: string; query?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.level) qs.set("level", params.level);
    if (params?.query) qs.set("query", params.query);
    if (params?.page) qs.set("page", String(params.page));
    return request<SchemesListResponse>(`/schemes/?${qs}`);
  },

  /**
   * Semantic (vector) search — embeds `q` server-side with BAAI/bge-small-en-v1.5
   * and runs pgvector cosine similarity against stored scheme embeddings.
   */
  vectorSearch: (params: { q: any; limit: any; category?: string; level?: string; }) => {
    const qs = new URLSearchParams({ q: params.q });
  
    if (params.limit) qs.set("limit", String(Math.min(params.limit, 50)));
    if (params.category) qs.set("category", params.category);
    if (params.level) qs.set("level", params.level);
  
    return request<VectorSearchResponse>(`/schemes/search?${qs}`);
  },

  /**
   * Personalised recommendations: embeds the current user's profile and
   * returns the nearest scheme embeddings by cosine similarity.
   */
  recommend: (params?: { limit?: number; category?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit)    qs.set("limit",    String(params.limit));
    if (params?.category) qs.set("category", params.category);
    return request<RecommendResponse>(`/schemes/recommend?${qs}`);
  },

  getEligible: () => request<{ schemes: Scheme[]; total: number }>("/schemes/eligible"),

  refreshEligibility: () =>
    request<{ message: string }>("/schemes/eligible/refresh", { method: "POST" }),

  getBySlug: (slug: string) => request<Scheme>(`/schemes/${slug}`),

  getSummary: (slug: string) =>
    request<{ scheme_id: string; summary: string; benefits_simple: string; eligibility_simple: string; documents_simple: string }>(
      `/schemes/${slug}/summary`
    ),

  getCategories: () => request<{ categories: string[] }>("/schemes/categories"),
};

// ─── Applications ──────────────────────────────────────
export interface AgentStep {
  step: number;
  action_type: string;
  description: string;
  selector?: string;
  value?: string;
  screenshot_url?: string;
  success: boolean;
  error?: string;
  timestamp?: string;
}

export interface ApplicationJob {
  id: string;
  user_id: string;
  scheme_id: string;
  status: "queued" | "running" | "completed" | "failed" | "needs_review";
  agent_log?: AgentStep[];
  screenshot_urls?: string[];
  application_ref_id?: string;
  error_details?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  government_schemes?: { scheme_name: string; slug: string; scheme_category: string };
}

export const applications = {
  apply: (schemeId: string) =>
    request<{ job_id: string; status: string; scheme_name: string; message: string }>(
      `/applications/apply/${schemeId}`,
      { method: "POST" }
    ),

  getJob: (jobId: string) => request<ApplicationJob>(`/applications/jobs/${jobId}`),

  getMyApplications: () =>
    request<{ applications: ApplicationJob[] }>("/applications/my"),

  cancelJob: (jobId: string) =>
    request<{ cancelled: boolean }>(`/applications/jobs/${jobId}/cancel`, { method: "DELETE" }),

  streamJob: (jobId: string): EventSource => {
    const token = getToken();
    return new EventSource(
      `${API_BASE}/api/v1/applications/jobs/${jobId}/stream?token=${token}`
    );
  },
};
