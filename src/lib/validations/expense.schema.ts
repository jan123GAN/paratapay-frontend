import { z } from "zod";

const expenseAmountSchema = z.object({
 
  amount: z.number().min(0),
});

export const createExpenseSchema = z.object({
 
  paid_by: z.string(),
  amount: z.number().min(0),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["Food", "Travel", "Shopping", "Bills", "Other"]),
  currency_code: z.string(),
  expense_date: z.string(),
  split_type: z.enum(["EQUAL_SPLIT", "CUSTOM_SPLIT"]),
  paid_by_data: z.array(expenseAmountSchema),
  expense_data: z.array(expenseAmountSchema),
});

export type CreateExpenseSchema = z.infer<typeof createExpenseSchema>;