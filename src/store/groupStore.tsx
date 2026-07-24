import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';


export type GroupTypeEnum = "CUSTOM_SPLIT" | "EQUAL_SPLIT";
export interface GroupMember {
  id: string;
  joined_at: string;
  role: "MEMBER" | "ADMIN";
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    email?: string;
    mobileNumber?: string;
  };
}

export interface Group {
  id: string;
  avatarUrl?: string;
  groupAvatar?: FileList | string;
  name: string;
  description: string;
  groupType: GroupTypeEnum;
  createdAt?: string;
  creatorId?: string;
  member?: GroupMember[]; // ✅ Added members array
  balance?: string;
  members?: number;
  totalExpenses?: string;
}

interface GroupState {
    group: Group | null;
    isAdmin: boolean;
    setGroup: (group: Group) => void;
    setIsAdmin: (isAdmin: boolean) => void;
    clearGroup: () => void;
}

export const useGroupStore = create<GroupState>()(
    persist(
        (set) => ({
            group: null,
            isAdmin: false,
            setGroup: (group) => set({ group }),
            setIsAdmin: (isAdmin) => set({ isAdmin }),
            clearGroup: () => set({ group: null, isAdmin: false }),
        }),
        {
            name: 'group-store', 
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
