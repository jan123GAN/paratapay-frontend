import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getExpenseById, useExpenses, useSettleExpense } from "./api";
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

// Imports for Store & API
import { useGroup } from "../group/api"; 
import { useUser } from "@/hooks/useUser";
import { useGroupStore } from "@/store/groupStore";

function Expense() {
  const { userId } = useUser();
  const { group: activeStoreGroup } = useGroupStore();
  
  const [isSelectGroupOpen, setIsSelectGroupOpen] = useState(false);
  const [selectedGroupForCreate, setSelectedGroupForCreate] = useState<any | null>(null);

  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // State for Settlement Modal & Payment Method
  const [settleExpenseData, setSettleExpenseData] = useState<any | null>(null);
  const [settleMethod, setSettleMethod] = useState<"ONLINE" | "CASH">("CASH");

  const { data: expenses, isLoading: isExpensesLoading } = useExpenses();
  const { data: groups = [], isLoading: isGroupsLoading } = useGroup(userId ?? "");
  const queryClient = useQueryClient();

  // Settle Expense Mutation Hook
  const { mutate: settleExpense, isPending: isSettling } = useSettleExpense();

  // Create Expense Trigger
  const handleCreateExpenseClick = () => {
    if (activeStoreGroup?.id) {
      setSelectedGroupForCreate(activeStoreGroup);
    } else if (groups.length === 1) {
      setSelectedGroupForCreate(groups[0]);
    } else {
      setIsSelectGroupOpen(true);
    }
  };

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

  // Confirm & Execute Settlement
  const handleConfirmSettlement = () => {
    if (!settleExpenseData || !userId) return;

    // Safely extract receiver ID (supports object and string)
    const receiverId = typeof settleExpenseData.paid === 'object' 
      ? settleExpenseData.paid?.id 
      : settleExpenseData.paid_by;

    if (!receiverId) {
      alert("Receiver information is missing for this expense.");
      return;
    }

    if (receiverId === userId) {
      alert("You paid for this expense! Other members need to settle with you.");
      return;
    }

    // Find logged-in user's exact split share in this expense
    const mySplit = settleExpenseData.splitExpense?.find(
      (s: any) => (s.user_id === userId || s.splitUserId?.id === userId)
    );

    // Calculate settlement amount (exact share fallback to total if not found)
    const settlementAmount = mySplit 
      ? Number(mySplit.exact_amount || mySplit.amount) 
      : Number(settleExpenseData.amount);

    if (settlementAmount <= 0) {
      alert("No pending settlement amount found for your user.");
      return;
    }

    const payload = {
      group_id: settleExpenseData.group_id,
      from_user_id: userId,
      to_user_id: receiverId,
      amount: settlementAmount,
      currency_code: settleExpenseData.currency_code || "INR",
      method: settleMethod,
      expense_id: settleExpenseData.id,
    };

    settleExpense(payload, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["expenses"] });
        if (selectedExpenseId) {
          const detail = await getExpenseById(selectedExpenseId);
          setSelectedExpense(detail);
        }
        setSettleExpenseData(null);
      },
      onError: (error: any) => {
        console.error("Settlement failed:", error);
        alert(error?.response?.data?.message || "Failed to process settlement. Please try again.");
      },
    });
  };

  const paymentRows = useMemo(() => selectedExpense?.expensePayments ?? [], [selectedExpense]);
  const splitRows = useMemo(() => selectedExpense?.splitExpense ?? [], [selectedExpense]);

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary">Expenses</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Track, split, and settle up your group spending.
          </p>
        </div>

        <Button 
          size="lg" 
          className="w-full sm:w-auto flex items-center gap-2 shadow-md"
          onClick={handleCreateExpenseClick}
        >
          <Icon name="PlusCircle" size={18} />
          <span>Create Expense</span>
        </Button>
      </div>

      {/* 1. Group Selection Dialog */}
      <Dialog open={isSelectGroupOpen} onOpenChange={setIsSelectGroupOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Select Group</DialogTitle>
          </DialogHeader>

          {isGroupsLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Fetching your groups...</p>
          ) : groups.length === 0 ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-sm font-semibold text-destructive">No Groups Found</p>
              <p className="text-xs text-muted-foreground">Please create or join a group first.</p>
            </div>
          ) : (
            <div className="space-y-2 pt-2 max-h-[260px] overflow-y-auto">
              <p className="text-xs text-muted-foreground mb-2">Choose a group for this expense:</p>
              {groups.map((g: any) => (
                <div
                  key={g.id}
                  onClick={() => {
                    setSelectedGroupForCreate(g);
                    setIsSelectGroupOpen(false);
                  }}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={16} className="text-muted-foreground" />
                    <span className="font-medium text-sm">{g.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {g.member?.length ?? 0} members
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Create Expense Modal */}
      <Dialog 
        open={!!selectedGroupForCreate} 
        onOpenChange={(open) => {
          if (!open) setSelectedGroupForCreate(null);
        }}
      >
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle>Create Expense ({selectedGroupForCreate?.name})</DialogTitle>
          </DialogHeader>
          {selectedGroupForCreate && (
            <CreateExpenseForm
              onClose={() => setSelectedGroupForCreate(null)}
              members={selectedGroupForCreate.member ?? []}
              groupId={selectedGroupForCreate.id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card border rounded-xl p-3 md:p-4 shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="text" placeholder="Search expenses..." className="pl-9 h-9 text-xs md:text-sm w-full" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full md:w-auto">
          <Select>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {groups.map((g: any) => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
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

      {/* Expense List Rendering */}
      <div className="space-y-3">
        {isExpensesLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading expenses...</div>
        ) : !expenses || expenses.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-xl space-y-2">
            <Icon name="Receipt" size={32} className="mx-auto text-muted-foreground opacity-50" />
            <p className="text-sm font-medium">No expenses found</p>
          </div>
        ) : (
          expenses.map((expense: any) => {
            const payerId = typeof expense.paid === 'object' ? expense.paid?.id : expense.paid_by;
            const isOwner = payerId === userId;
            const isSettled = expense.isSettled === true;
            const isButtonDisabled = isOwner || isSettled;

            return (
              <div key={expense.id} className="p-3 md:p-4 border rounded-xl bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="bg-primary/10 text-primary rounded-lg p-2.5 shrink-0">
                    <Icon name="Receipt" size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm md:text-base truncate max-w-[180px] sm:max-w-[240px]">
                        {expense.description || "Untitled Expense"}
                      </h3>
                      {expense.category && (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">
                          {expense.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Paid by <span className="font-medium text-foreground">{expense.paid?.displayName || expense.paid_by || "Unknown"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                  <span className="font-bold text-base md:text-lg">₹{Number(expense.amount) || 0}</span>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs px-2.5" onClick={() => handleOpenDetail(expense.id)}>
                      Details
                    </Button>
                    <Button 
                      variant={isOwner ? "outline" : "ghostGreen"} 
                      size="sm" 
                      disabled={isButtonDisabled}
                      className="h-8 text-xs px-2.5 flex items-center gap-1"
                      onClick={() => setSettleExpenseData(expense)}
                    >
                      <Icon name="CheckCircle2" size={14} />
                      <span>{isSettled ? "Settled" : isOwner ? "You Paid" : "Settle Up"}</span>
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
                    {selectedExpense.group?.name || "Group Expense"}
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
                {(() => {
                  const payerId = typeof selectedExpense.paid === 'object' ? selectedExpense.paid?.id : selectedExpense.paid_by;
                  const isOwner = payerId === userId;
                  const isSettled = selectedExpense.isSettled === true;
                  const isButtonDisabled = isOwner || isSettled;

                  return (
                    <Button 
                      variant="ghostGreen" 
                      size="sm" 
                      disabled={isButtonDisabled}
                      className="w-full sm:w-auto"
                      onClick={() => {
                        const exp = selectedExpense;
                        setSelectedExpenseId(null);
                        setSettleExpenseData(exp);
                      }}
                    >
                      {isSettled ? "Settled" : isOwner ? "You Paid This Expense" : "Settle This Expense"}
                    </Button>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No details found.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. Settlement Confirmation Modal */}
      <Dialog 
        open={!!settleExpenseData} 
        onOpenChange={(open) => {
          if (!open && !isSettling) setSettleExpenseData(null);
        }}
      >
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Settle Balance</DialogTitle>
          </DialogHeader>

          {settleExpenseData && (
            <div className="space-y-4 pt-2">
              <div className="bg-muted/40 p-3 rounded-lg border text-sm space-y-1">
                <p className="text-muted-foreground text-xs">Expense Description</p>
                <p className="font-semibold text-foreground">{settleExpenseData.description || "Expense Settlement"}</p>
                <p className="text-xs text-muted-foreground">
                  Your Share to Settle:{" "}
                  <span className="font-bold text-foreground">
                    ₹{
                      (() => {
                        const mySplit = settleExpenseData.splitExpense?.find(
                          (s: any) => (s.user_id === userId || s.splitUserId?.id === userId)
                        );
                        return mySplit ? Number(mySplit.exact_amount || mySplit.amount) : Number(settleExpenseData.amount);
                      })()
                    }
                  </span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
                <Select 
                  value={settleMethod} 
                  onValueChange={(val: "ONLINE" | "CASH") => setSettleMethod(val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash Payment</SelectItem>
                    <SelectItem value="ONLINE">Online Payment / UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-muted-foreground">
                Confirming will record this settlement in the group ledger and adjust corresponding member balances.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isSettling}
                  onClick={() => setSettleExpenseData(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  disabled={isSettling}
                  onClick={handleConfirmSettlement}
                >
                  {isSettling ? "Processing..." : "Confirm Settlement"}
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