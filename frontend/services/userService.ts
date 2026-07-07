// User Service

import { UserProfile, User } from "@/types/user";

const API_URL = "http://localhost:5000/api/users";

// Get JWT Token
function getToken() {
  return localStorage.getItem("token");
}

// Fetch Current User Profile
export async function getUserProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data.user;
}

// Fetch All Users
export async function getUsers(): Promise<User[]> {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
}