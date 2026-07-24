import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getExpenseById, useExpenses } from "./api";
import CreateExpenseForm from "./CreateExpenseForm";
import { Search } from "lucide-react";
import Icon from "@/components/shared/Icon";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

function Expense() {
  const [isCreateExpenseFormOpen, setIsCreateExpenseFormOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const { data: expenses, isLoading } = useExpenses();

  const handleOpenDetail = async (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setIsDetailLoading(true);
    try {
      const detail = await getExpenseById(expenseId);
      setSelectedExpense(detail);
    } catch (error) {
      console.error("Failed to fetch expense detail", error);
      setSelectedExpense(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const paymentRows = useMemo(() => {
    return selectedExpense?.expensePayments ?? [];
  }, [selectedExpense]);

  const splitRows = useMemo(() => {
    return selectedExpense?.splitExpense ?? [];
  }, [selectedExpense]);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-primary">Expense</h2>

        {/* Create Expense Modal */}
        <Dialog
          open={isCreateExpenseFormOpen}
          onOpenChange={setIsCreateExpenseFormOpen}
        >
          <DialogTrigger asChild>
            <Button size="lg" className="flex items-center gap-2">
              <Icon name="PlusCircle" size={20} className="text-black" />
              Create Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg p-6 space-y-4">
            <div className="p-6">
              <CreateExpenseForm
                onClose={() => setIsCreateExpenseFormOpen(false)}
                groupId={""}
              />
            </div>
          </DialogContent>
        </Dialog>
        
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-lg">
        {/* Search Bar */}
        <div className="relative w-full sm:w-auto sm:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input type="text" placeholder="Search expenses..." className="pl-10 w-full" />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              <SelectItem value="group1">Group 1</SelectItem>
              <SelectItem value="group2">Group 2</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Last 30 Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expense List */}
      {isLoading ? (
        <div>Loading expenses...</div>
      ) : expenses?.length === 0 ? (
        <div>No expenses found</div>
      ) : (
        expenses?.map((expense) => (
          <div
            key={expense.id}
            className="p-4 flex flex-row justify-between items-center border rounded-lg bg-card"
          >
            <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary rounded-full p-2 shrink-0">
                  <Icon name="ArrowDown" size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-semibold text-lg truncate">{expense.description}</h1>
                  <p className="text-sm text-muted-foreground truncate">
                    Paid by {expense.paid_by} •{" "}
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {expense.category}
                  </p>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start text-right gap-2 ml-auto">
                <span className="text-xl font-bold whitespace-nowrap">₹{expense.amount}</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="ghostBlue"
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => handleOpenDetail(expense.id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      <Dialog open={!!selectedExpenseId} onOpenChange={(open) => {
        if (!open) {
          setSelectedExpenseId(null);
          setSelectedExpense(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          {isDetailLoading ? (
            <div className="py-6 text-sm text-muted-foreground">Loading expense details...</div>
          ) : selectedExpense ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{selectedExpense.description}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedExpense.category} • {new Date(selectedExpense.expense_date).toLocaleDateString()}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Who paid</h4>
                  <div className="text-sm text-muted-foreground">
                    {selectedExpense.paid?.displayName || selectedExpense.paid_by || "Unknown"}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Total amount</h4>
                  <div className="text-sm font-semibold">₹{selectedExpense.amount}</div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Payments</h4>
                {paymentRows.length > 0 ? (
                  <div className="space-y-2">
                    {paymentRows.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between text-sm">
                        <span>{payment.user?.displayName || payment.user_id}</span>
                        <span>₹{payment.amount_paid}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No payment details available.</div>
                )}
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Split details</h4>
                {splitRows.length > 0 ? (
                  <div className="space-y-2">
                    {splitRows.map((split: any) => (
                      <div key={split.id} className="flex items-center justify-between text-sm">
                        <span>{split.splitUserId?.displayName || split.user_id}</span>
                        <div className="text-right">
                          <div>Exact: ₹{split.exact_amount}</div>
                          <div className="text-muted-foreground">Percent: {split.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No split details available.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-sm text-muted-foreground">No expense details available.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Expense;
