import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

interface DashboardStats {
  totalExpenses: string;
  youOwe: string;
  owedToYou: string;
  activeGroups: number;
}

interface RecentExpense {
  id: string;
  description: string;
  amount: number;
  group: {
    name: string;
  };
  user: {
    displayName: string;
    avatarUrl: string;
  };
  createdAt: string;
}

interface ActiveGroup {
  id: string;
  name: string;
  members: number;
  totalExpenses: string;
  balance: string;
}

export interface Settlement {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  amountToSettle: string;
  isSettled?: boolean;
}

// Fetch dashboard summary stats
const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  const response = await apiInstance.get(`/dashboard/stats/${userId}`);
  return response.data.data;
};

export const useDashboardStats = (userId: string) => {
  return useQuery({
    queryKey: ["dashboardStats", userId],
    queryFn: () => getDashboardStats(userId),
    enabled: !!userId,
  });
};

// Fetch recent expenses
const getRecentExpenses = async (userId: string): Promise<RecentExpense[]> => {
  try {
    const response = await apiInstance.get(`/dashboard/recent-expenses/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching recent expenses:', error);
    return [];
  }
};

export const useRecentExpenses = (userId: string) => {
  return useQuery({
    queryKey: ["recentExpenses", userId],
    queryFn: () => getRecentExpenses(userId),
    enabled: !!userId,
  });
};

// Fetch active groups
const getActiveGroups = async (userId: string): Promise<ActiveGroup[]> => {
  const response = await apiInstance.get(`/dashboard/active-groups/${userId}`);
  return response.data.data;
};

export const useActiveGroups = (userId: string) => {
  return useQuery({
    queryKey: ["activeGroups", userId],
    queryFn: () => getActiveGroups(userId),
    enabled: !!userId,
  });
};

// Fetch monthly spending
const getMonthlySpending = async (userId: string): Promise<Record<string, string>> => {
  const response = await apiInstance.get(`/dashboard/monthly-spending/${userId}`);
  return response.data.data;
};

export const useMonthlySpending = (userId: string) => {
  return useQuery({
    queryKey: ["monthlySpending", userId],
    queryFn: () => getMonthlySpending(userId),
    enabled: !!userId,
  });
};

// Fetch settlements for a group
const getSettlements = async (groupId: string): Promise<Settlement[]> => {
  try {
    const response = await apiInstance.get(`/dashboard/settlements/${groupId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching settlements:', error);
    return [];
  }
};

export const useSettlements = (groupId: string) => {
  return useQuery({
    queryKey: ["settlements", groupId],
    queryFn: () => getSettlements(groupId),
    enabled: !!groupId,
  });
};