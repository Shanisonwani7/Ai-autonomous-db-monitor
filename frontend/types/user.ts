// User Profile Interface

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  joinedDate: string;
  avatar?: string;
}
// User Management Interface

export interface User {
  id: number;
  name: string;
  email: string;
  role: "Administrator" | "User";
  status: "Active" | "Inactive";
  joinedDate: string;
  avatar?: string;
}