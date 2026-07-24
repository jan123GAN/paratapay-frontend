import { useMutation, useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api"; 
import { queryClient } from "@/providers/query.provider";
import type { Group } from "@/store/groupStore";
import type { User } from "@/store/store";




interface GroupMembers {
  user: any;
  id: string;
  userId: string;
  groupId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}



import type { QueryFunctionContext } from "@tanstack/react-query";

const fetchGroup = async ({ queryKey }: QueryFunctionContext<[string, string]>): Promise<Group[]> => {
  const [, userId] = queryKey;
  const response = await apiInstance.get(`/group/user/${userId}`);
  console.log("API response:", response.data);
  return response.data.groups; // Changed from response.data.data to response.data.groups
};

export const useGroup = (userId: string) => {
  return useQuery({
    queryKey: ["group", userId],
    queryFn: fetchGroup,
    enabled: !!userId, 
  });
};



const createGroup = async (formData: FormData): Promise<Group> => {
  try {
    const response = await apiInstance.post("/group", formData);
    return response.data.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const useCreateGroupMutation = () => {
  return useMutation<Group, Error, FormData>({
    mutationFn: createGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["userGroups"] });
      console.log("Group created successfully:", data);
    },
    onError: (error) => {
      console.error("Create group API error:", error);
    },
  });
};


const fetchGroupMembers = async ({ queryKey }: QueryFunctionContext<[string, string]>): Promise<GroupMembers[]> => {
  const [, groupId] = queryKey;
  const response = await apiInstance.get(`/group/getmembers/${groupId}`);
  console.log("API response:", response.data);
  return response.data.data;
};

export const useGroupMembers = (groupId: string) => {
  return useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: fetchGroupMembers,
    enabled: !!groupId,
  });
};



export const userSearch = async ({ queryKey }: { queryKey: [string, string] }): Promise<User> => {
  const [_key, name] = queryKey;

  if (!name) {
    throw new Error("User name is required for user search.");
  }

  try {
    const response = await apiInstance.get<User>(`/user?search=${name}`);
    return response.data;
  } catch (error: any) {
    console.error("API error during user search:", error);
    throw error;
  }
}

export const useUserSearch = (name: string) => {
  return useQuery({
   queryKey: ["userSearch", name],
   queryFn: userSearch,
   enabled: !!name,
  
   
  });
};


const addMemberToGroup = async (groupId: string, userId: string): Promise<GroupMembers> => {
  try {
    const response = await apiInstance.post("/group/addmember", {
      groupId,
      userId,
    });
    console.log("API response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};  


export const useAddMemberToGroupMutation = () => {
  return useMutation<GroupMembers, Error, { groupId: string; userId: string }>({
    mutationFn: ({ groupId, userId }) => addMemberToGroup(groupId, userId),
    onSuccess: (data) => {
     
      console.log("Member added successfully:", data);
    },
    onError: (error) => {
      console.error("Add member API error:", error);
    },
  });
}
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


// export const getGroupMembers = async ({ queryKey }: { queryKey: [string, string] }): Promise<GroupMembers[]> => {
//   const [_key, groupId] = queryKey;

//   if (!groupId) {
//     throw new Error("Group ID is required to fetch group members.");
//   }

//   try {
//     const response = await apiInstance.get<GroupMembers[]>(`/group/getmembers/${groupId}`);
//     console.log("API response:", response.data.data);
//     return response.data.data;
//   } catch (error: any) {
//     console.error("API error during fetching group members:", error);
//     throw error;
//   }
// }


export const useGetMembers = (groupId: string) => {
  return useQuery({
   queryKey: ["groupMembers", groupId],
   queryFn: getGroupMembers,
   enabled: !!groupId,

  });
};




interface ExpensePayload {
  group_id: string;
  created_by: string;
  paid_by: string;
  amount: number;
  description: string;
  category: string;
  currency_code: string;
  expense_date: string;
  split_type: "EQUAL_SPLIT" | "EXACT_AMOUNT_SPLIT" | "PERCENTAGE_SPLIT";
  paid_by_data: Array<{ user_id: string; amount: number }>;
  expense_data: Array<{
    user_id: string;
    amount?: number;
    percentage?: number;
  }>;
}

const createExpense = async (data: ExpensePayload): Promise<any> => {
  try {
    const response = await apiInstance.post("/expense", data);
    return response.data?.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const useCreateExpenseMutation = () => {
  return useMutation({
    mutationFn: createExpense,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      console.log("Expense created successfully:", data);
    },
    onError: (error) => {
      console.error("Create expense API error:", error);
    },
  });
};

