import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getExpenseById, useExpenses } from "./api";
import CreateExpenseForm from "./CreateExpenseForm";
import { Search } from "lucide-react";
import Icon from "@/components/shared/Icon";
import { Badge } from "@/components/ui/badge";
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
  
  // State for Settlement Modal
  const [settleExpenseData, setSettleExpenseData] = useState<any | null>(null);

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

  const handleSettleExpense = (expense: any) => {
    setSettleExpenseData(expense);
  };

  const paymentRows = useMemo(() => {
    return selectedExpense?.expensePayments ?? [];
  }, [selectedExpense]);

  const splitRows = useMemo(() => {
    return selectedExpense?.splitExpense ?? [];
  }, [selectedExpense]);

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary">Expenses</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Track, split, and settle up your group spending.
          </p>
        </div>

        {/* Create Expense Button */}
        <Dialog
          open={isCreateExpenseFormOpen}
          onOpenChange={setIsCreateExpenseFormOpen}
        >
          <DialogTrigger asChild>
            <Button size="lg" className="w-full sm:w-auto flex items-center gap-2 shadow-md">
              <Icon name="PlusCircle" size={18} />
              <span>Create Expense</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg p-6">
            <DialogHeader>
              <DialogTitle>Create New Expense</DialogTitle>
            </DialogHeader>
            <CreateExpenseForm
              onClose={() => setIsCreateExpenseFormOpen(false)}
              groupId={""}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Filters Container */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card border rounded-xl p-3 md:p-4 shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Search expenses..." 
            className="pl-9 h-9 text-xs md:text-sm w-full" 
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full md:w-auto">
          <Select>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              <SelectItem value="group1">Group 1</SelectItem>
              <SelectItem value="group2">Group 2</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="h-9 text-xs col-span-2 sm:col-span-1">
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
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading expenses...</div>
        ) : !expenses || expenses.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-xl space-y-2">
            <Icon name="Receipt" size={32} className="mx-auto text-muted-foreground opacity-50" />
            <p className="text-sm font-medium">No expenses found</p>
            <p className="text-xs text-muted-foreground">Add an expense to start tracking splits.</p>
          </div>
        ) : (
          expenses.map((expense) => {
            const amount = Number(expense.amount) || 0;
            const formattedDate = expense.expense_date 
              ? new Date(expense.expense_date).toLocaleDateString() 
              : "Recent";

            return (
              <div
                key={expense.id}
                className="p-3 md:p-4 border rounded-xl bg-card hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                {/* Left Section: Icon + Details */}
                <div className="flex items-start gap-3 min-w-0 w-full sm:w-auto">
                  <div className="bg-primary/10 text-primary rounded-lg p-2.5 shrink-0">
                    <Icon name="Receipt" size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm md:text-base truncate max-w-[180px] sm:max-w-[260px]">
                        {expense.description || "Untitled Expense"}
                      </h3>
                      {expense.category && (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          {expense.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Paid by <span className="font-medium text-foreground">{expense.paid_by || "Unknown"}</span> • {formattedDate}
                    </p>
                  </div>
                </div>

                {/* Right Section: Amount + Actions */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 gap-3 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-base md:text-lg font-bold block">₹{amount}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-2.5"
                      onClick={() => handleOpenDetail(expense.id)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="ghostGreen"
                      size="sm"
                      className="text-xs h-8 px-2.5 flex items-center gap-1"
                      onClick={() => handleSettleExpense(expense)}
                    >
                      <Icon name="CheckCircle2" size={14} />
                      <span>Settle Up</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Expense Detail Dialog */}
      <Dialog 
        open={!!selectedExpenseId} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedExpenseId(null);
            setSelectedExpense(null);
          }
        }}
      >
        <DialogContent className="max-w-md md:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading expense details...
            </div>
          ) : selectedExpense ? (
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h3 className="text-lg font-semibold">{selectedExpense.description}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedExpense.category || "General"} • {selectedExpense.expense_date ? new Date(selectedExpense.expense_date).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary">₹{Number(selectedExpense.amount) || 0}</span>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="rounded-lg border p-3 bg-muted/30">
                  <span className="text-xs text-muted-foreground block">Paid By</span>
                  <span className="text-sm font-medium">
                    {selectedExpense.paid?.displayName || selectedExpense.paid_by || "Unknown"}
                  </span>
                </div>
                <div className="rounded-lg border p-3 bg-muted/30">
                  <span className="text-xs text-muted-foreground block">Group</span>
                  <span className="text-sm font-medium truncate block">
                    {selectedExpense.group?.name || "Personal Expense"}
                  </span>
                </div>
              </div>

              {/* Payments Section */}
              <div className="rounded-lg border p-3 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Breakdown</h4>
                {paymentRows.length > 0 ? (
                  <div className="space-y-1.5 divide-y divide-border/40">
                    {paymentRows.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between text-xs md:text-sm pt-1.5">
                        <span>{payment.user?.displayName || payment.user_id}</span>
                        <span className="font-semibold">₹{Number(payment.amount_paid) || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No payment records.</div>
                )}
              </div>

              {/* Split Details Section */}
              <div className="rounded-lg border p-3 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Split Breakdown</h4>
                {splitRows.length > 0 ? (
                  <div className="space-y-1.5 divide-y divide-border/40">
                    {splitRows.map((split: any) => (
                      <div key={split.id} className="flex items-center justify-between text-xs md:text-sm pt-1.5">
                        <span>{split.splitUserId?.displayName || split.user_id}</span>
                        <div className="text-right">
                          <span className="font-semibold block">₹{Number(split.exact_amount) || 0}</span>
                          <span className="text-[10px] text-muted-foreground">{split.percentage || 0}% share</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No split details available.</div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button 
                  variant="ghostGreen" 
                  size="sm" 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    const exp = selectedExpense;
                    setSelectedExpenseId(null);
                    handleSettleExpense(exp);
                  }}
                >
                  Settle This Expense
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No details found.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settlement Confirmation Dialog */}
      <Dialog 
        open={!!settleExpenseData} 
        onOpenChange={(open) => {
          if (!open) setSettleExpenseData(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settle Expense</DialogTitle>
          </DialogHeader>

          {settleExpenseData && (
            <div className="space-y-4 pt-2">
              <div className="bg-muted/40 p-3 rounded-lg border text-sm space-y-1">
                <p className="text-muted-foreground text-xs">Expense</p>
                <p className="font-semibold text-foreground">{settleExpenseData.description}</p>
                <p className="text-xs text-muted-foreground">Total: ₹{Number(settleExpenseData.amount) || 0}</p>
              </div>

              <p className="text-xs md:text-sm text-muted-foreground">
                Confirming settlement will record full payment against this expense balance.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSettleExpenseData(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => {
                    // Call settlement API here
                    setSettleExpenseData(null);
                  }}
                >
                  Confirm Settlement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Expense;