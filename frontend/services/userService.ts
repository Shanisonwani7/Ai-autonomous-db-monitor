// User Service
import { UserProfile, User } from "@/types/user";

// Fetch user profile
export async function getUserProfile(): Promise<UserProfile> {

  // Temporary Dummy Data
  // Later replace with Backend API

  return {
    id: 1,
    name: "Shani",
    email: "shani@example.com",
    role: "Administrator",
    joinedDate: "July 2026",
  };

}

// Get All Users
// Currently returns dummy data.
// Later this will call the backend API.

export async function getUsers(): Promise<User[]> {
  return [
    {
      id: 1,
      name: "Shani",
      email: "shani@example.com",
      role: "Administrator",
      status: "Active",
      joinedDate: "July 2026",
    },
    {
      id: 2,
      name: "Rahul",
      email: "rahul@example.com",
      role: "User",
      status: "Active",
      joinedDate: "June 2026",
    },
    {
      id: 3,
      name: "Aman",
      email: "aman@example.com",
      role: "User",
      status: "Inactive",
      joinedDate: "May 2026",
    },
  ];
}