import type { ReactNode } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
// import { isAuthenticated } from '../lib/auth';

export interface User {
  user: any;
  name: ReactNode;
  data: User | undefined;
  id: string;
  displayName: string;
  mobileNumber: string;
  email: string;
  password: string;
  social_login_provider: string;
  avatarUrl: string;
  contact_list?: {
    name: string;
    number: string;
  }[];
}



interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setAuthenticated: (state: boolean) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}




export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            token: null,
            setUser: (user) => set({ user }),
            setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            setToken: (token) => set({ token }),
            logout: () => set({ user: null, isAuthenticated: false, token: null }),
        }),
        {
            name: 'auth-storage',
              storage: createJSONStorage(() => sessionStorage),         }
    )
);