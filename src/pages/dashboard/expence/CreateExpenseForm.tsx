import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateExpenseMutation } from "../group/api";
import { getExpenseById } from "./api";

type Member = {
  user: {
    id: string;
    displayName?: string;
    email?: string;
  };
};

type Props = {
  onClose?: () => void;
  members?: Member[];
};

type SplitType = "EQUAL_SPLIT" | "EXACT_AMOUNT_SPLIT" | "PERCENTAGE_SPLIT";

type CustomSplit = {
  user_id: string;
  amount: number;
  percentage: number;
};

type ExpensePayload = {
  group_id: string;
  created_by: string;
  paid_by: string;
  amount: number;
  description: string;
  category: string;
  currency_code: string;
  expense_date: string;
  split_type: SplitType;
  paid_by_data: Array<{ user_id: string; amount: number }>;
  expense_data: Array<{
    user_id: string;
    amount?: number;
    percentage?: number;
  }>;
};

export default function CreateExpenseForm({ onClose, members = [], groupId }: Props & { groupId: string }) {
  const { userId } = useUser();
  const { mutate: createExpense } = useCreateExpenseMutation();
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [splitType, setSplitType] = useState<SplitType>("EQUAL_SPLIT");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 16));
  const [customSplits, setCustomSplits] = useState<CustomSplit[]>(
    members.map(m => ({ user_id: m.user.id, amount: 0, percentage: 0 }))
  );
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setCustomSplits(members.map(m => ({ user_id: m.user.id, amount: 0, percentage: 0 })));
  }, [members]);

  const handleCustomChange = (id: string, value: string) => {
    setCustomSplits(prev => 
      prev.map(split => {
        if (split.user_id !== id) return split;

        if (splitType === "PERCENTAGE_SPLIT") {
          return { ...split, percentage: Number(value) };
        }

        return { ...split, amount: Number(value) };
      })
    );
  };

  const getSplitPayload = () => {
    if (splitType === "EQUAL_SPLIT") {
      return [];
    }

    return customSplits.map(split => {
      if (splitType === "PERCENTAGE_SPLIT") {
        return {
          user_id: split.user_id,
          percentage: split.percentage
        };
      }

      return {
        user_id: split.user_id,
        amount: split.amount
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const totalAmount = Number(amount);
    if (!totalAmount || totalAmount <= 0) {
      setErrorMessage("Amount must be greater than 0.");
      return;
    }

    if (splitType === "EXACT_AMOUNT_SPLIT") {
      const sum = customSplits.reduce((acc, split) => acc + split.amount, 0);
      if (sum !== totalAmount) {
        setErrorMessage("Exact amounts must sum to the total expense amount.");
        return;
      }
    }

    if (splitType === "PERCENTAGE_SPLIT") {
      const sum = customSplits.reduce((acc, split) => acc + split.percentage, 0);
      if (sum !== 100) {
        setErrorMessage("Percentages must add up to 100%.");
        return;
      }
    }

    const expenseData: ExpensePayload = {
      group_id: groupId,
      created_by: userId || "",
      paid_by: userId || "",
      amount: totalAmount,
      description,
      category,
      currency_code: "INR",
      expense_date: new Date(expenseDate).toISOString(),
      split_type: splitType,
      paid_by_data: userId ? [{ user_id: userId, amount: totalAmount }] : [],
      expense_data: splitType === "EQUAL_SPLIT" ? [] : getSplitPayload(),
    };

    createExpense(expenseData, {
      onSuccess: async (createdExpense) => {
        const expenseId =
          createdExpense?.id || createdExpense?.data?.id || createdExpense?.expense?.id;

        if (expenseId) {
          try {
            const fullExpense = await getExpenseById(expenseId);
            queryClient.setQueryData(["expense", expenseId], fullExpense);
          } catch (error) {
            console.error("Failed to fetch expense detail after creation:", error);
          }
        }

        if (onClose) onClose();
      },
      onError: (error) => {
        console.error("Expense creation failed:", error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... (rest of your form JSX) ... */}
      <div>
        <Label>Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Expense Description"
        />
      </div>

      <div>
        <Label>Amount</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
      </div>

      <div>
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
            <SelectItem value="Shopping">Shopping</SelectItem>
            <SelectItem value="Bills">Bills</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Date</Label>
        <Input
          type="datetime-local"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
        />
      </div>

      <div>
        <Label>Split Type</Label>
        <Select 
          value={splitType} 
          onValueChange={(value: SplitType) => setSplitType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select split type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EQUAL_SPLIT">Equal Split</SelectItem>
            <SelectItem value="EXACT_AMOUNT_SPLIT">Exact Amount Split</SelectItem>
            <SelectItem value="PERCENTAGE_SPLIT">Percentage Split</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {errorMessage ? (
        <div className="text-sm text-red-600">{errorMessage}</div>
      ) : null}

      {/* Members Split Section */}
      <div className="max-h-[150px] overflow-y-auto border rounded-md p-3 space-y-2">
        {members.map((m) => {
          const split = customSplits.find((s) => s.user_id === m.user.id);
          return (
            <div key={m.user.id} className="flex justify-between items-center">
              <span>{m.user.displayName || m.user.email}</span>
              <Input
                type="number"
                className="w-[100px]"
                disabled={splitType === "EQUAL_SPLIT"}
                placeholder={
                  splitType === "EQUAL_SPLIT"
                    ? "Backend calculates equal share"
                    : splitType === "PERCENTAGE_SPLIT"
                    ? "%"
                    : "Amount"
                }
                value={
                  splitType === "EQUAL_SPLIT"
                    ? ""
                    : splitType === "PERCENTAGE_SPLIT"
                    ? split?.percentage ?? ""
                    : split?.amount ?? ""
                }
                onChange={(e) => handleCustomChange(m.user.id, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Equal split values are computed by the backend after creation.
      </p>

      <div className="flex justify-end gap-2">
        {onClose && (
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
}