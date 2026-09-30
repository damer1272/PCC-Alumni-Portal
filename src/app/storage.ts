import { Alumni, Announcement, EmploymentRecord, ALUMNI_LIST, ANNOUNCEMENTS, EMPLOYMENT_HISTORY } from "./data";
import { hashPassword, generateSalt, generateSessionToken, validatePasswordStrength, validateEmail } from "./utils/security";
import { supabase, isSupabaseConfigured } from "./supabase";

export type UserItem = {
  id: number;
  name: string;
  email: string;
  role: "Alumni" | "Admin";
  status: "Active" | "Inactive" | "Pending";
  passwordHash?: string;
  salt?: string;
};

export type UserSession = {
  token: string;
  email: string;
  name: string;
  role: "Alumni" | "Admin";
  createdAt: string;
};

export type ProfileData = {
  name: string;
  studentId: string;
  gender: string;
  birthdate: string;
  email: string;
  phone: string;
  address: string;
  course: string;
  year: number;
  avatar: string;
  coverPhoto?: string;
  position: string;
  company: string;
  location: string;
  saying: string;
  linkedin: string;
  github: string;
  facebook: string;
  instagram: string;
};

export type JourneyPost = {
  id: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  authorCourse?: string;
  authorYear?: number;
  content: string;
  image?: string;
  date: string;
  likes: number;
  likedByMe?: boolean;
};

const INITIAL_JOURNEY_POSTS: JourneyPost[] = [];

export type NotificationItem = {
  id: string;
  senderName: string;
  senderEmail: string;
  senderAvatar: string;
  recipientEmail?: string;
  type: "connection_request" | "connection_accepted" | "endorsement" | "general";
  title: string;
  message: string;
  time: string;
  read: boolean;
  status?: "pending" | "accepted" | "declined";
  alumniId?: number;
};

// Default clean users list (Default system administrator account)
const INITIAL_USERS: UserItem[] = [
  { id: 1, name: "PCC Admin", email: "admin@pcc.edu.ph", role: "Admin", status: "Active" },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

const EMPTY_PROFILE: ProfileData = {
  name: "",
  studentId: "",
  gender: "Not specified",
  birthdate: "",
  email: "",
  phone: "",
  address: "",
  course: "",
  year: new Date().getFullYear(),
  avatar: "AL",
  coverPhoto: "",
  position: "",
  company: "",
  location: "",
  saying: "",
  linkedin: "",
  github: "",
  facebook: "",
  instagram: "",
};

export type BatchGraduateFile = {
  id: string;
  fileName: string;
  batchYear: number;
  uploadDate: string;
  uploadedBy: string;
  fileSize: string;
  totalGraduates: number;
  courseCounts: Record<string, number>;
  description?: string;
};

const INITIAL_BATCH_DOCUMENTS: BatchGraduateFile[] = [];

const KEYS = {
  ALUMNI: "pcc_alumni_list_v5",
  ANNOUNCEMENTS: "pcc_announcements_v5",
  EMPLOYMENT_HISTORY: "pcc_employment_history_v5",
  USERS: "pcc_users_list_v5",
  USER_PROFILE: "pcc_user_profile_v5",
  CURRENT_SESSION: "pcc_current_session_v5",
  NOTIFICATIONS: "pcc_notifications_v5",
  CONNECTIONS: "pcc_connections_v5",
  JOURNEY_POSTS: "pcc_journey_posts_v5",
  BATCH_DOCUMENTS: "pcc_batch_documents_v5",
};

// Initialize localStorage with clean state (removes legacy mock data)
const initStorage = () => {
  if (typeof window === "undefined") return;

  // Clear legacy mock data keys if they exist in user's browser
  const legacyKeys = [
    "pcc_alumni_list", "pcc_announcements", "pcc_employment_history", "pcc_users_list", "pcc_user_profile", "pcc_current_session",
    "pcc_alumni_list_v2", "pcc_announcements_v2", "pcc_employment_history_v2", "pcc_users_list_v2", "pcc_user_profile_v2", "pcc_current_session_v2",
    "pcc_alumni_list_v3", "pcc_announcements_v3", "pcc_employment_history_v3", "pcc_users_list_v3", "pcc_user_profile_v3", "pcc_current_session_v3",
    "pcc_alumni_list_v4", "pcc_announcements_v4", "pcc_employment_history_v4", "pcc_users_list_v4", "pcc_user_profile_v4", "pcc_current_session_v4",
    "pcc_notifications_v4", "pcc_notifications_v3", "pcc_notifications_v2", "pcc_notifications_v1",
    "pcc_connections_v4", "pcc_connections_v1", "pcc_journey_posts_v4", "pcc_journey_posts_v1", "pcc_batch_documents_v4"
  ];
  legacyKeys.forEach((k) => localStorage.removeItem(k));

  if (!localStorage.getItem(KEYS.ALUMNI)) {
    localStorage.setItem(KEYS.ALUMNI, JSON.stringify(ALUMNI_LIST));
  }
  if (!localStorage.getItem(KEYS.ANNOUNCEMENTS)) {
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(ANNOUNCEMENTS));
  }
  if (!localStorage.getItem(KEYS.EMPLOYMENT_HISTORY)) {
    localStorage.setItem(KEYS.EMPLOYMENT_HISTORY, JSON.stringify(EMPLOYMENT_HISTORY));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.USER_PROFILE)) {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(EMPTY_PROFILE));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(KEYS.CONNECTIONS)) {
    localStorage.setItem(KEYS.CONNECTIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.JOURNEY_POSTS)) {
    localStorage.setItem(KEYS.JOURNEY_POSTS, JSON.stringify(INITIAL_JOURNEY_POSTS));
  }
  if (!localStorage.getItem(KEYS.BATCH_DOCUMENTS)) {
    localStorage.setItem(KEYS.BATCH_DOCUMENTS, JSON.stringify(INITIAL_BATCH_DOCUMENTS));
  }
};

initStorage();

export const storageService = {
  // PURGE / RESET ALL MOCK DATA TO ZERO
  purgeAllMockData(): void {
    if (typeof window === "undefined") return;
    localStorage.clear();
    localStorage.setItem(KEYS.ALUMNI, JSON.stringify([]));
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify([]));
    localStorage.setItem(KEYS.EMPLOYMENT_HISTORY, JSON.stringify([]));
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(EMPTY_PROFILE));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.CONNECTIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.JOURNEY_POSTS, JSON.stringify([]));
  },

  // SESSION MANAGEMENT
  getCurrentSession(): UserSession | null {
    const sessionStr = localStorage.getItem(KEYS.CURRENT_SESSION);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  },

  setCurrentSession(session: UserSession | null): void {
    if (session) {
      localStorage.setItem(KEYS.CURRENT_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(KEYS.CURRENT_SESSION);
    }
  },

  logout(): void {
    localStorage.removeItem(KEYS.CURRENT_SESSION);
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(EMPTY_PROFILE));
  },

  // ALUMNI CRUD
  async getAlumni(): Promise<Alumni[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from("alumni_directory").select("*").order("created_at", { ascending: false });
        if (!error && data) {
          const list = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            studentId: d.student_id,
            gender: d.gender,
            birthdate: d.birthdate,
            course: d.course,
            year: d.year,
            email: d.email,
            phone: d.phone,
            address: d.address,
            company: d.company,
            position: d.position,
            location: d.location,
            employmentStatus: d.employment_status,
            status: d.status,
            avatar: d.avatar,
            saying: d.saying,
            linkedin: d.linkedin,
            github: d.github,
            facebook: d.facebook,
            instagram: d.instagram,
          }));
          localStorage.setItem(KEYS.ALUMNI, JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.warn("Supabase getAlumni error, using local fallback:", err);
      }
    }
    const data = localStorage.getItem(KEYS.ALUMNI);
    return data ? JSON.parse(data) : [];
  },

  async addAlumni(alumnus: Omit<Alumni, "id">): Promise<Alumni> {
    const list = await this.getAlumni();
    const newAlumnus: Alumni = {
      ...alumnus,
      id: Date.now(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("alumni_directory").insert({
          id: newAlumnus.id,
          name: newAlumnus.name,
          student_id: newAlumnus.studentId,
          gender: newAlumnus.gender || "Not specified",
          birthdate: newAlumnus.birthdate || "",
          course: newAlumnus.course,
          year: newAlumnus.year,
          email: newAlumnus.email,
          phone: newAlumnus.phone || "",
          address: newAlumnus.address || "",
          company: newAlumnus.company || "",
          position: newAlumnus.position || "",
          location: newAlumnus.location || "",
          employment_status: newAlumnus.employmentStatus || "Employed",
          status: newAlumnus.status || "Active",
          avatar: newAlumnus.avatar || "AL",
          saying: newAlumnus.saying || "",
          linkedin: newAlumnus.linkedin || "",
          github: newAlumnus.github || "",
          facebook: newAlumnus.facebook || "",
          instagram: newAlumnus.instagram || "",
        });
      } catch (err) {
        console.warn("Supabase addAlumni error:", err);
      }
    }

    list.unshift(newAlumnus);
    localStorage.setItem(KEYS.ALUMNI, JSON.stringify(list));
    return newAlumnus;
  },

  async updateAlumni(id: number, updates: Partial<Alumni>): Promise<Alumni | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.studentId !== undefined) payload.student_id = updates.studentId;
        if (updates.course !== undefined) payload.course = updates.course;
        if (updates.year !== undefined) payload.year = updates.year;
        if (updates.email !== undefined) payload.email = updates.email;
        if (updates.company !== undefined) payload.company = updates.company;
        if (updates.position !== undefined) payload.position = updates.position;
        if (updates.location !== undefined) payload.location = updates.location;
        if (updates.employmentStatus !== undefined) payload.employment_status = updates.employmentStatus;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.avatar !== undefined) payload.avatar = updates.avatar;
        if (updates.saying !== undefined) payload.saying = updates.saying;

        await supabase.from("alumni_directory").update(payload).eq("id", id);
      } catch (err) {
        console.warn("Supabase updateAlumni error:", err);
      }
    }

    const list = await this.getAlumni();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(KEYS.ALUMNI, JSON.stringify(list));
    return list[index];
  },

  async deleteAlumni(id: number): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("alumni_directory").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase deleteAlumni error:", err);
      }
    }

    const list = await this.getAlumni();
    const filtered = list.filter((a) => a.id !== id);
    localStorage.setItem(KEYS.ALUMNI, JSON.stringify(filtered));
    return true;
  },

  async batchImportAlumni(graduates: Partial<Alumni>[]): Promise<{ addedCount: number; updatedCount: number; totalProcessed: number }> {
    const list = await this.getAlumni();
    let addedCount = 0;
    let updatedCount = 0;
    const now = Date.now();

    const supabaseInserts: any[] = [];

    for (let idx = 0; idx < graduates.length; idx++) {
      const item = graduates[idx];
      const cleanStudentId = (item.studentId || "").trim();
      const cleanEmail = (item.email || "").trim().toLowerCase();

      const existingIdx = list.findIndex(
        (a) =>
          (cleanStudentId && a.studentId.trim().toLowerCase() === cleanStudentId.toLowerCase()) ||
          (cleanEmail && a.email.trim().toLowerCase() === cleanEmail)
      );

      const avatarInitials =
        (item.name || "")
          .trim()
          .split(/\s+/)
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "AL";

      if (existingIdx !== -1) {
        list[existingIdx] = {
          ...list[existingIdx],
          name: item.name?.trim() || list[existingIdx].name,
          studentId: cleanStudentId || list[existingIdx].studentId,
          course: item.course || list[existingIdx].course,
          year: item.year ? Number(item.year) : list[existingIdx].year,
          status: item.status || list[existingIdx].status || "Employed",
          email: cleanEmail || list[existingIdx].email,
          company: item.company !== undefined ? item.company : list[existingIdx].company,
          position: item.position !== undefined ? item.position : list[existingIdx].position,
          location: item.location !== undefined ? item.location : list[existingIdx].location,
          saying: item.saying !== undefined ? item.saying : list[existingIdx].saying,
        };
        updatedCount++;

        if (isSupabaseConfigured() && supabase) {
          try {
            await supabase.from("alumni_directory").update({
              name: list[existingIdx].name,
              student_id: list[existingIdx].studentId,
              course: list[existingIdx].course,
              year: list[existingIdx].year,
              email: list[existingIdx].email,
              company: list[existingIdx].company || "",
              position: list[existingIdx].position || "",
              location: list[existingIdx].location || "",
              saying: list[existingIdx].saying || "",
            }).eq("id", list[existingIdx].id);
          } catch (err) {
            console.warn("Supabase update error during batch import:", err);
          }
        }
      } else {
        const newAlumnus: Alumni = {
          id: now + idx,
          name: item.name?.trim() || "Graduate Alumnus",
          studentId: cleanStudentId || `PCC-${now}-${idx}`,
          course: item.course || "BS Information Technology",
          year: item.year ? Number(item.year) : new Date().getFullYear(),
          status: item.status || "Employed",
          email: cleanEmail || `graduate.${now}.${idx}@pcc.edu.ph`,
          avatar: item.avatar || avatarInitials,
          company: item.company || "",
          position: item.position || "",
          location: item.location || "",
          saying: item.saying || "",
          linkedin: item.linkedin || "",
          github: item.github || "",
          facebook: item.facebook || "",
          instagram: item.instagram || "",
        };
        list.unshift(newAlumnus);
        addedCount++;

        if (isSupabaseConfigured() && supabase) {
          supabaseInserts.push({
            id: newAlumnus.id,
            name: newAlumnus.name,
            student_id: newAlumnus.studentId,
            gender: newAlumnus.gender || "Not specified",
            course: newAlumnus.course,
            year: newAlumnus.year,
            email: newAlumnus.email,
            phone: newAlumnus.phone || "",
            address: newAlumnus.address || "",
            company: newAlumnus.company || "",
            position: newAlumnus.position || "",
            location: newAlumnus.location || "",
            employment_status: newAlumnus.employmentStatus || "Employed",
            status: newAlumnus.status || "Active",
            avatar: newAlumnus.avatar || "AL",
            saying: newAlumnus.saying || "",
          });
        }
      }
    }

    if (isSupabaseConfigured() && supabase && supabaseInserts.length > 0) {
      try {
        await supabase.from("alumni_directory").insert(supabaseInserts);
      } catch (err) {
        console.warn("Supabase batch insert error:", err);
      }
    }

    localStorage.setItem(KEYS.ALUMNI, JSON.stringify(list));
    return { addedCount, updatedCount, totalProcessed: graduates.length };
  },

  // BATCH GRADUATE FILES CRUD
  async getBatchGraduateFiles(): Promise<BatchGraduateFile[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from("batch_documents").select("*").order("created_at", { ascending: false });
        if (!error && data) {
          const list = data.map((d: any) => ({
            id: d.id,
            fileName: d.file_name,
            batchYear: d.batch_year,
            uploadDate: d.upload_date,
            uploadedBy: d.uploaded_by,
            fileSize: d.file_size,
            totalGraduates: d.total_graduates,
            courseCounts: d.course_counts || {},
            description: d.description,
          }));
          localStorage.setItem(KEYS.BATCH_DOCUMENTS, JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.warn("Supabase getBatchGraduateFiles error:", err);
      }
    }
    const data = localStorage.getItem(KEYS.BATCH_DOCUMENTS);
    return data ? JSON.parse(data) : INITIAL_BATCH_DOCUMENTS;
  },

  async addBatchGraduateFile(doc: Omit<BatchGraduateFile, "id">): Promise<BatchGraduateFile> {
    const list = await this.getBatchGraduateFiles();
    const newDoc: BatchGraduateFile = {
      ...doc,
      id: `batch-${Date.now()}`,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("batch_documents").insert({
          id: newDoc.id,
          file_name: newDoc.fileName,
          batch_year: newDoc.batchYear,
          upload_date: newDoc.uploadDate,
          uploaded_by: newDoc.uploadedBy,
          file_size: newDoc.fileSize,
          total_graduates: newDoc.totalGraduates,
          course_counts: newDoc.courseCounts,
          description: newDoc.description,
        });
      } catch (err) {
        console.warn("Supabase addBatchGraduateFile error:", err);
      }
    }

    list.unshift(newDoc);
    localStorage.setItem(KEYS.BATCH_DOCUMENTS, JSON.stringify(list));
    return newDoc;
  },

  async deleteBatchGraduateFile(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("batch_documents").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase deleteBatchGraduateFile error:", err);
      }
    }

    const list = await this.getBatchGraduateFiles();
    const filtered = list.filter((d) => d.id !== id);
    localStorage.setItem(KEYS.BATCH_DOCUMENTS, JSON.stringify(filtered));
    return true;
  },

  // ANNOUNCEMENTS CRUD
  async getAnnouncements(): Promise<Announcement[]> {
    const data = localStorage.getItem(KEYS.ANNOUNCEMENTS);
    return data ? JSON.parse(data) : ANNOUNCEMENTS;
  },

  async addAnnouncement(announcement: Omit<Announcement, "id">): Promise<Announcement> {
    const list = await this.getAnnouncements();
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now(),
    };
    list.unshift(newAnnouncement);
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(list));
    return newAnnouncement;
  },

  async updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement | null> {
    const list = await this.getAnnouncements();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(list));
    return list[index];
  },

  async deleteAnnouncement(id: number): Promise<boolean> {
    const list = await this.getAnnouncements();
    const filtered = list.filter((a) => a.id !== id);
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
    return true;
  },

  // EMPLOYMENT HISTORY CRUD (Scoped per user account)
  async getEmploymentHistory(userEmail?: string): Promise<EmploymentRecord[]> {
    const session = this.getCurrentSession();
    const targetEmail = (userEmail || session?.email || "").toLowerCase();
    if (!targetEmail) return [];

    const data = localStorage.getItem(KEYS.EMPLOYMENT_HISTORY);
    if (!data) return [];
    try {
      const allRecords: (EmploymentRecord & { userEmail?: string })[] = JSON.parse(data);
      const userRecords = allRecords.filter((rec) => rec.userEmail && rec.userEmail.toLowerCase() === targetEmail);
      const isOwner = !userEmail || (session?.email && session.email.toLowerCase() === targetEmail);

      return userRecords.map((rec) => {
        if (!isOwner && rec.showSalaryPublicly === false) {
          return { ...rec, salary: "Confidential (Private)" };
        }
        return rec;
      });
    } catch {
      return [];
    }
  },

  async addEmploymentRecord(record: Omit<EmploymentRecord, "id">): Promise<EmploymentRecord> {
    const session = this.getCurrentSession();
    const currentProfile = await this.getProfile();
    const userEmail = (session?.email || currentProfile.email || "").toLowerCase();

    const data = localStorage.getItem(KEYS.EMPLOYMENT_HISTORY);
    const list: (EmploymentRecord & { userEmail?: string })[] = data ? JSON.parse(data) : [];

    const newRecord = {
      ...record,
      id: Date.now(),
      userEmail,
    };

    list.unshift(newRecord);
    localStorage.setItem(KEYS.EMPLOYMENT_HISTORY, JSON.stringify(list));

    await this.updateProfile({
      position: record.position,
      company: record.company,
      location: record.location,
    });

    return newRecord;
  },

  async updateEmploymentRecord(id: number, updates: Partial<EmploymentRecord>): Promise<EmploymentRecord | null> {
    const data = localStorage.getItem(KEYS.EMPLOYMENT_HISTORY);
    if (!data) return null;
    const list: (EmploymentRecord & { userEmail?: string })[] = JSON.parse(data);
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates };
    localStorage.setItem(KEYS.EMPLOYMENT_HISTORY, JSON.stringify(list));
    return list[index];
  },

  async deleteEmploymentRecord(id: number): Promise<boolean> {
    const data = localStorage.getItem(KEYS.EMPLOYMENT_HISTORY);
    if (!data) return false;
    const list: (EmploymentRecord & { userEmail?: string })[] = JSON.parse(data);
    const filtered = list.filter((e) => e.id !== id);
    localStorage.setItem(KEYS.EMPLOYMENT_HISTORY, JSON.stringify(filtered));
    return true;
  },

  // USER MANAGEMENT CRUD
  async getUsers(): Promise<UserItem[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
        if (!error && data) {
          const list = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            email: d.email,
            role: d.role,
            status: d.status,
            passwordHash: d.password_hash,
            salt: d.salt,
          }));
          localStorage.setItem(KEYS.USERS, JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.warn("Supabase getUsers error:", err);
      }
    }
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },

  async addUser(user: Omit<UserItem, "id">): Promise<UserItem> {
    const list = await this.getUsers();
    const newUser: UserItem = {
      ...user,
      id: Date.now(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("users").insert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email.toLowerCase(),
          role: newUser.role,
          status: newUser.status,
          password_hash: newUser.passwordHash,
          salt: newUser.salt,
        });
      } catch (err) {
        console.warn("Supabase addUser error:", err);
      }
    }

    list.unshift(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(list));
    return newUser;
  },

  async updateUser(id: number, updates: Partial<UserItem>): Promise<UserItem | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.email !== undefined) payload.email = updates.email.toLowerCase();
        if (updates.role !== undefined) payload.role = updates.role;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.passwordHash !== undefined) payload.password_hash = updates.passwordHash;
        if (updates.salt !== undefined) payload.salt = updates.salt;

        await supabase.from("users").update(payload).eq("id", id);
      } catch (err) {
        console.warn("Supabase updateUser error:", err);
      }
    }

    const list = await this.getUsers();
    const index = list.findIndex((u) => u.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(KEYS.USERS, JSON.stringify(list));
    return list[index];
  },

  async deleteUser(id: number): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("users").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase deleteUser error:", err);
      }
    }

    const list = await this.getUsers();
    const filtered = list.filter((u) => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(filtered));
    return true;
  },

  // USER PROFILE CRUD
  async getProfile(): Promise<ProfileData> {
    const session = this.getCurrentSession();
    if (isSupabaseConfigured() && supabase && session?.email) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", session.email.toLowerCase())
          .maybeSingle();

        if (!error && data) {
          return {
            name: data.name || "",
            email: data.email || "",
            studentId: data.student_id || "",
            gender: data.gender || "Not specified",
            birthdate: data.birthdate || "",
            phone: data.phone || "",
            address: data.address || "",
            course: data.course || "",
            year: data.year || new Date().getFullYear(),
            avatar: data.avatar || "AL",
            coverPhoto: data.cover_photo || "",
            position: data.position || "",
            company: data.company || "",
            location: data.location || "",
            saying: data.saying || "",
            linkedin: data.linkedin || "",
            github: data.github || "",
            facebook: data.facebook || "",
            instagram: data.instagram || "",
          };
        }
      } catch (err) {
        console.warn("Supabase getProfile error:", err);
      }
    }

    const localData = localStorage.getItem(KEYS.USER_PROFILE);
    return localData ? JSON.parse(localData) : EMPTY_PROFILE;
  },

  async updateProfile(updates: Partial<ProfileData>): Promise<ProfileData> {
    const current = await this.getProfile();
    const updated = { ...current, ...updates };
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(updated));

    if (isSupabaseConfigured() && supabase && updated.email) {
      try {
        await supabase.from("profiles").upsert(
          {
            email: updated.email.toLowerCase(),
            name: updated.name,
            student_id: updated.studentId,
            gender: updated.gender,
            birthdate: updated.birthdate,
            phone: updated.phone,
            address: updated.address,
            course: updated.course,
            year: updated.year,
            avatar: updated.avatar,
            cover_photo: updated.coverPhoto,
            position: updated.position,
            company: updated.company,
            location: updated.location,
            saying: updated.saying,
            linkedin: updated.linkedin,
            github: updated.github,
            facebook: updated.facebook,
            instagram: updated.instagram,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        );
      } catch (err) {
        console.warn("Supabase updateProfile error:", err);
      }
    }

    // Sync to Alumni Directory entry if email matches
    if (updated.email) {
      const alumniList = await this.getAlumni();
      const index = alumniList.findIndex((a) => a.email.toLowerCase() === updated.email.toLowerCase());
      if (index !== -1) {
        await this.updateAlumni(alumniList[index].id, {
          name: updated.name,
          avatar: updated.avatar || alumniList[index].avatar,
          studentId: updated.studentId || alumniList[index].studentId,
          course: updated.course || alumniList[index].course,
          year: updated.year || alumniList[index].year,
          company: updated.company || "",
          position: updated.position || "",
          location: updated.location || "",
          saying: updated.saying || "",
          linkedin: updated.linkedin || "",
          github: updated.github || "",
          facebook: updated.facebook || "",
          instagram: updated.instagram || "",
        });
      } else {
        await this.addAlumni({
          name: updated.name,
          email: updated.email.toLowerCase(),
          studentId: updated.studentId || "",
          course: updated.course || "BSIT",
          year: updated.year || 2024,
          status: "Active",
          avatar: updated.avatar || "AL",
          company: updated.company || "",
          position: updated.position || "",
          location: updated.location || "",
          saying: updated.saying || "",
          linkedin: updated.linkedin || "",
          github: updated.github || "",
          facebook: updated.facebook || "",
          instagram: updated.instagram || "",
        });
      }
    }

    return updated;
  },

  // REGISTER NEW ACCOUNT
  async registerAccount(data: {
    name: string;
    email: string;
    password?: string;
    studentId: string;
    course: string;
    year: number;
    gender?: string;
    role?: "Alumni" | "Admin";
  }): Promise<{ success: boolean; code?: string; message?: string }> {
    const cleanEmail = data.email.trim().toLowerCase();

    // 1. Data Validation: Email format
    if (!validateEmail(cleanEmail)) {
      return { success: false, message: "Please enter a valid email address." };
    }

    // 2. Check if user email ALREADY exists in the system
    const users = await this.getUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return {
        success: false,
        code: "ALREADY_REGISTERED",
        message: "An account with this email address already exists in the portal.",
      };
    }

    // 3. Data Validation: Password requirements
    const password = data.password || "";
    const pwdResult = validatePasswordStrength(password);
    if (!pwdResult.isValid) {
      return {
        success: false,
        message: `Password does not meet security requirements: ${pwdResult.errors.join(", ")}.`,
      };
    }

    // 4. Secure Password Hashing using Web Crypto
    const salt = generateSalt(16);
    const passwordHash = await hashPassword(password, salt);

    const avatarInitials =
      data.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AL";

    // 5. Create User in UserManagement storage
    await this.addUser({
      name: data.name.trim(),
      email: cleanEmail,
      role: data.role || "Alumni",
      status: "Active",
      passwordHash,
      salt,
    });

    // 6. Create clean Alumni entry in Alumni Directory
    await this.addAlumni({
      name: data.name.trim(),
      studentId: data.studentId.trim(),
      course: data.course,
      year: Number(data.year),
      status: "Seeking Opportunities",
      email: cleanEmail,
      avatar: avatarInitials,
      company: "",
      position: "",
      location: "",
      saying: "",
    });

    // 7. Initialize FRESH & EMPTY Profile for Newly Created Account
    const freshProfile: ProfileData = {
      name: data.name.trim(),
      email: cleanEmail,
      studentId: data.studentId.trim(),
      course: data.course,
      year: Number(data.year),
      gender: data.gender || "Not specified",
      birthdate: "",
      phone: "",
      address: "",
      avatar: avatarInitials,
      position: "",
      company: "",
      location: "",
      saying: "",
      linkedin: "",
      github: "",
      facebook: "",
      instagram: "",
    };

    await this.updateProfile(freshProfile);

    // 8. Establish Active Session
    const sessionToken = generateSessionToken();
    const session: UserSession = {
      token: sessionToken,
      email: cleanEmail,
      name: data.name.trim(),
      role: data.role || "Alumni",
      createdAt: new Date().toISOString(),
    };
    this.setCurrentSession(session);

    return { success: true };
  },

  // SECURE USER LOGIN
  async loginUser(email: string, passwordInput: string): Promise<{ success: boolean; message?: string; role?: "Alumni" | "Admin" }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !passwordInput) {
      return { success: false, message: "Please fill in both email and password." };
    }

    const users = await this.getUsers();
    const matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      return { success: false, message: "No account found with this email address. Please register first." };
    }

    // Verify Password Hash
    if (matchedUser.passwordHash && matchedUser.salt) {
      const computedHash = await hashPassword(passwordInput, matchedUser.salt);
      if (computedHash !== matchedUser.passwordHash) {
        return { success: false, message: "Incorrect password. Please try again." };
      }
    } else {
      // Legacy or admin fallback
      const salt = generateSalt(16);
      const passwordHash = await hashPassword(passwordInput, salt);
      await this.updateUser(matchedUser.id, { passwordHash, salt });
    }

    const alumniList = await this.getAlumni();
    const matchedAlumni = alumniList.find((a) => a.email.toLowerCase() === cleanEmail);

    let activeProfile: ProfileData;
    if (matchedAlumni) {
      activeProfile = {
        name: matchedAlumni.name,
        email: matchedAlumni.email,
        studentId: matchedAlumni.studentId,
        course: matchedAlumni.course,
        year: matchedAlumni.year,
        gender: "Not specified",
        birthdate: "",
        phone: "",
        address: "",
        avatar: matchedAlumni.avatar,
        position: matchedAlumni.position || "",
        company: matchedAlumni.company || "",
        location: matchedAlumni.location || "",
        saying: matchedAlumni.saying || "",
        linkedin: matchedAlumni.linkedin || "",
        github: matchedAlumni.github || "",
        facebook: matchedAlumni.facebook || "",
        instagram: matchedAlumni.instagram || "",
      };
    } else {
      activeProfile = {
        ...EMPTY_PROFILE,
        name: matchedUser.name,
        email: matchedUser.email,
      };
    }

    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(activeProfile));

    const sessionToken = generateSessionToken();
    const session: UserSession = {
      token: sessionToken,
      email: cleanEmail,
      name: matchedUser.name,
      role: matchedUser.role,
      createdAt: new Date().toISOString(),
    };
    this.setCurrentSession(session);

    return { success: true, role: matchedUser.role };
  },

  // NOTIFICATION & CONNECTION REQUEST MANAGEMENT
  async getNotifications(): Promise<NotificationItem[]> {
    if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
    const raw = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    try {
      const parsed = JSON.parse(raw) as NotificationItem[];
      return parsed.filter(
        (n) => n.type === "endorsement" || n.type === "connection_request" || n.type === "connection_accepted"
      );
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  async sendConnectionRequest(senderName: string, senderEmail: string, recipientName: string, recipientEmail?: string, alumniId?: number): Promise<void> {
    const list = await this.getNotifications();
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      senderName,
      senderEmail,
      senderAvatar: senderName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
      recipientEmail,
      type: "connection_request",
      title: "Connection Request",
      message: "wants to connect with you",
      time: "Just now",
      read: false,
      status: "pending",
      alumniId,
    };
    const updated = [newNotif, ...list];
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
  },

  async getConnections(): Promise<string[]> {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEYS.CONNECTIONS);
    if (!raw) {
      const defaultConns: string[] = [];
      localStorage.setItem(KEYS.CONNECTIONS, JSON.stringify(defaultConns));
      return defaultConns;
    }
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  },

  async isAlumniConnected(email?: string): Promise<boolean> {
    if (!email) return false;
    const conns = await this.getConnections();
    return conns.includes(email.toLowerCase());
  },

  async toggleConnection(email?: string): Promise<boolean> {
    if (!email) return false;
    const clean = email.toLowerCase();
    const conns = await this.getConnections();
    let updated: string[];
    let isConnected = false;
    if (conns.includes(clean)) {
      updated = conns.filter((e) => e !== clean);
      isConnected = false;
    } else {
      updated = [...conns, clean];
      isConnected = true;
    }
    localStorage.setItem(KEYS.CONNECTIONS, JSON.stringify(updated));
    return isConnected;
  },

  async respondToConnectionRequest(id: string, action: "accept" | "decline"): Promise<NotificationItem[]> {
    const list = await this.getNotifications();
    let targetNotif: NotificationItem | undefined;

    const updated = list.map((n) => {
      if (n.id === id) {
        targetNotif = n;
        return {
          ...n,
          status: action === "accept" ? ("accepted" as const) : ("declined" as const),
          read: true,
        };
      }
      return n;
    });

    if (action === "accept" && targetNotif && targetNotif.senderEmail) {
      await this.toggleConnection(targetNotif.senderEmail);
      const confirmationNotif: NotificationItem = {
        id: `notif_accept_${Date.now()}`,
        senderName: targetNotif.senderName,
        senderEmail: targetNotif.senderEmail,
        senderAvatar: targetNotif.senderAvatar,
        type: "connection_accepted",
        title: "Connection Established",
        message: `You and ${targetNotif.senderName} are now connected!`,
        time: "Just now",
        read: false,
      };
      updated.unshift(confirmationNotif);
    }

    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
    return updated;
  },

  async markAllNotificationsRead(): Promise<NotificationItem[]> {
    const list = await this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
    return updated;
  },

  // JOURNEY POSTS MANAGEMENT
  async getJourneyPosts(): Promise<JourneyPost[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from("journey_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            authorName: d.author_name,
            authorEmail: d.author_email,
            authorAvatar: d.author_avatar,
            authorCourse: d.author_course,
            authorYear: d.author_year,
            content: d.content,
            image: d.image,
            date: d.date,
            likes: d.likes || 0,
            likedByMe: false,
          }));
        }
      } catch (err) {
        console.warn("Supabase getJourneyPosts error:", err);
      }
    }

    if (typeof window === "undefined") return INITIAL_JOURNEY_POSTS;
    const raw = localStorage.getItem(KEYS.JOURNEY_POSTS);
    if (!raw) {
      localStorage.setItem(KEYS.JOURNEY_POSTS, JSON.stringify(INITIAL_JOURNEY_POSTS));
      return INITIAL_JOURNEY_POSTS;
    }
    try {
      return JSON.parse(raw) as JourneyPost[];
    } catch {
      return INITIAL_JOURNEY_POSTS;
    }
  },

  async addJourneyPost(content: string, image?: string): Promise<JourneyPost> {
    const me = await this.getProfile();
    const posts = await this.getJourneyPosts();
    const initials = me.name ? me.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "AL";

    const newPost: JourneyPost = {
      id: `post_${Date.now()}`,
      authorName: me.name || "PCC Alumni",
      authorEmail: me.email || "user@example.com",
      authorAvatar: me.avatar && (me.avatar.startsWith("data:") || me.avatar.startsWith("http")) ? me.avatar : initials,
      authorCourse: me.course || "Pagadian Capitol College",
      authorYear: me.year || new Date().getFullYear(),
      content,
      image,
      date: "Just now",
      likes: 0,
      likedByMe: false,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("journey_posts").insert({
          id: newPost.id,
          author_name: newPost.authorName,
          author_email: newPost.authorEmail,
          author_avatar: newPost.authorAvatar,
          author_course: newPost.authorCourse,
          author_year: newPost.authorYear,
          content: newPost.content,
          image: newPost.image || null,
          date: newPost.date,
          likes: 0,
        });
      } catch (err) {
        console.warn("Supabase addJourneyPost error:", err);
      }
    }

    const updated = [newPost, ...posts];
    localStorage.setItem(KEYS.JOURNEY_POSTS, JSON.stringify(updated));
    return newPost;
  },

  async toggleLikePost(postId: string): Promise<JourneyPost[]> {
    const me = await this.getProfile();
    const posts = await this.getJourneyPosts();
    let endorsedPost: JourneyPost | undefined;

    const updated = posts.map((p) => {
      if (p.id === postId) {
        const liked = !p.likedByMe;
        if (liked) {
          endorsedPost = p;
        }
        return {
          ...p,
          likedByMe: liked,
          likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      }
      return p;
    });

    if (isSupabaseConfigured() && supabase && endorsedPost) {
      try {
        await supabase.from("journey_posts").update({ likes: endorsedPost.likes + 1 }).eq("id", postId);
      } catch (err) {
        console.warn("Supabase toggleLikePost error:", err);
      }
    }

    localStorage.setItem(KEYS.JOURNEY_POSTS, JSON.stringify(updated));

    // Generate endorsement notification if a post was endorsed
    if (endorsedPost) {
      const list = await this.getNotifications();
      const initials = me.name ? me.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "AL";
      const snippet = endorsedPost.content.length > 40 ? endorsedPost.content.slice(0, 40) + "..." : endorsedPost.content;

      const notif: NotificationItem = {
        id: `notif_endorsed_${Date.now()}`,
        senderName: me.name || "Alumni Member",
        senderEmail: me.email,
        senderAvatar: me.avatar && (me.avatar.startsWith("data:") || me.avatar.startsWith("http")) ? me.avatar : initials,
        recipientEmail: endorsedPost.authorEmail,
        type: "endorsement",
        title: "Journey Endorsement",
        message: `endorsed your journey update: "${snippet}"`,
        time: "Just now",
        read: false,
      };
      const updatedNotifs = [notif, ...list];
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifs));
    }

    return updated;
  },

  async deleteJourneyPost(postId: string): Promise<JourneyPost[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("journey_posts").delete().eq("id", postId);
      } catch (err) {
        console.warn("Supabase deleteJourneyPost error:", err);
      }
    }

    const posts = await this.getJourneyPosts();
    const updated = posts.filter((p) => p.id !== postId);
    localStorage.setItem(KEYS.JOURNEY_POSTS, JSON.stringify(updated));
    return updated;
  },

  resetStorage(): void {
    this.purgeAllMockData();
  },
};
