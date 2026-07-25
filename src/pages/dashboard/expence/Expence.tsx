import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

// 🔑 Imports for Store & API
import { useGroup } from "../group/api"; 
import { useUser } from "@/hooks/useUser";
import { useGroupStore } from "@/store/groupStore"; // 👈 Store import kar liya

function Expense() {
  const { userId } = useUser();
  const { group: activeStoreGroup } = useGroupStore(); // 👈 Current store se group uthaya
  
  const [isSelectGroupOpen, setIsSelectGroupOpen] = useState(false);
  const [selectedGroupForCreate, setSelectedGroupForCreate] = useState<any | null>(null);

  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [settleExpenseData, setSettleExpenseData] = useState<any | null>(null);

  const { data: expenses, isLoading: isExpensesLoading } = useExpenses();
  const { data: groups = [], isLoading: isGroupsLoading } = useGroup(userId ?? "");

  // Main Action: Create Expense Button
  const handleCreateExpenseClick = () => {
    // 1. Agar Store mein already active group set hai, toh seedha uska form khol do
    if (activeStoreGroup?.id) {
      setSelectedGroupForCreate(activeStoreGroup);
    } 
    // 2. Agar API se ek hi group mila hai, toh usko direct pick kar lo
    else if (groups.length === 1) {
      setSelectedGroupForCreate(groups[0]);
    } 
    // 3. Nahi toh Group Selector Dialog dikhao
    else {
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

      {/* 1. Group Selection Dialog (Only opens if multiple groups & none active in store) */}
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

      {/* 2. Create Expense Modal (Original CreateExpenseForm call) */}
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

      {/* Filters & Expense List UI Section */}
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
          expenses.map((expense: any) => (
            <div key={expense.id} className="p-3 md:p-4 border rounded-xl bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="bg-primary/10 text-primary rounded-lg p-2.5 shrink-0">
                  <Icon name="Receipt" size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm md:text-base truncate max-w-[200px]">{expense.description}</h3>
                  <p className="text-xs text-muted-foreground">Paid by {expense.paid?.displayName || expense.paid_by}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">₹{expense.amount}</span>
                <Button variant="outline" size="sm" onClick={() => handleOpenDetail(expense.id)}>Details</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Expense;