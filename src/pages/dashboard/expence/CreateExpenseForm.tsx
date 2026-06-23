import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/hooks/useUser";
import { useCreateExpenseMutation } from "../group/api";

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

export default function CreateExpenseForm({ onClose, members = [], groupId }: Props & { groupId: string }) {
  const { userId } = useUser();
  const { mutate: createExpense } = useCreateExpenseMutation();
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [splitType, setSplitType] = useState<"EQUAL_SPLIT" | "CUSTOM_SPLIT">("EQUAL_SPLIT");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [customSplits, setCustomSplits] = useState(
    members.map(m => ({ user_id: m.user.id, amount: 0 }))
  );

  const equalShare = amount ? (Number(amount) / members.length).toFixed(2) : "0";

  const handleCustomChange = (id: string, value: string) => {
    setCustomSplits(prev => 
      prev.map(split => 
        split.user_id === id ? { ...split, amount: Number(value) } : split
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expenseData = {
      group_id: groupId,
      created_by: userId || "",
      paid_by: userId || "",
      amount: Number(amount),
      description,
      category,
      currency_code: "INR",
      expense_date: new Date(expenseDate).toISOString(),
      split_type: splitType,
      paid_by_data: [{
        user_id: userId || "",
        amount: Number(amount)
      }],
      expense_data: splitType === "EQUAL_SPLIT" 
        ? members.map(m => ({
            user_id: m.user.id,
            amount: Number(equalShare)
          }))
        : customSplits
    };
    
    // Updated mutation call
    createExpense(expenseData, {
      onSuccess: () => {
        // Form closes on success
        if (onClose) onClose();
      },
      onError: (error) => {
        console.error("Expense creation failed:", error);
        // You can add a toast or a pop-up here to inform the user
      },
      onSettled: () => {
        // This will run whether the mutation succeeds or fails
        // It's a good place to reset form state or close the form
        if (onClose) onClose();
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
          onValueChange={(value: "EQUAL_SPLIT" | "CUSTOM_SPLIT") => setSplitType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select split type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EQUAL_SPLIT">Equal Split</SelectItem>
            <SelectItem value="CUSTOM_SPLIT">Custom Split</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Split Section */}
      <div className="max-h-[150px] overflow-y-auto border rounded-md p-3 space-y-2">
        {members.map((m) => (
          <div key={m.user.id} className="flex justify-between items-center">
            <span>{m.user.displayName || m.user.email}</span>
            <Input
              type="number"
              className="w-[100px]"
              disabled={splitType === "EQUAL_SPLIT"}
              value={
                splitType === "EQUAL_SPLIT"
                  ? equalShare
                  : customSplits.find((s) => s.user_id === m.user.id)?.amount || ""
              }
              onChange={(e) => handleCustomChange(m.user.id, e.target.value)}
            />
          </div>
        ))}
      </div>

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