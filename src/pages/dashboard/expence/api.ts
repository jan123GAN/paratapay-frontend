import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api"; 
import type { User } from "@/store/store";


interface GroupMembers {
  id: string;
  userId: string;
  groupId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}




interface Expense {
  id: string;
  group_id: string;
  created_by: string;
  amount: number;
  category: string;
  expense_date: string;
  split_type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  paid_by: string;
}

const getExpenses = async (): Promise<Expense[]> => {
  try {
    const response = await apiInstance.get('/expense/');
    console.log('Expense response:', response);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses
  });
};

const getExpense = async ({ queryKey }: { queryKey: [string, string] }): Promise<Expense> => {
  const [_key, expenseId] = queryKey;
  if (!expenseId) throw new Error("Expense ID is required");

  try {
    const response = await apiInstance.get(`/expense/${expenseId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching expense:', error);
    throw error;
  }
};

export const useExpense = (expenseId: string) => {
  return useQuery({
    queryKey: ["expense", expenseId],
    queryFn: getExpense,
    enabled: !!expenseId,
  });
};








// group/getmembers/
export const getGroupMembers = async ({
  queryKey,
}: {
  queryKey: [string, string];
}): Promise<GroupMembers[]> => {
  const [_key, groupId] = queryKey;

  const response = await apiInstance.get(`/group/getmembers/${groupId}`);
  return response.data.data; // ✅ only the array
};



interface SettleExpensePayload {
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency_code: string;
  method: "ONLINE" | "CASH";
  expense_id?: string; // Optional - if provided, settles single expense
}

export function useSettleExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SettleExpensePayload) => {
      const response = await apiInstance.post(`/expense/settle`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

