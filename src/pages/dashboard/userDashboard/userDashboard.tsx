import { 
  PlusCircle, 
  ChevronRight, 
  IndianRupee,
  ArrowUpCircle,
  ArrowDownCircle,
  Users,
  Handshake,
  UserPlus,
  LineChart,
  Plane,
  Building2,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import {}
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

import { useUser } from "@/hooks/useUser";
import { useCreateSettlement, useDashboardStats, useRecentExpenses, useActiveGroups, useSettlements } from "./api";


function Dashboard() {
  const { userId } = useUser();
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats(userId ?? "");
  const { data: recentExpensesData, isLoading: isLoadingRecent } = useRecentExpenses(userId ?? "");
  const { data: activeGroupsData, isLoading: isLoadingGroups } = useActiveGroups(userId ?? "");
  const selectedGroupId = activeGroupsData?.[0]?.id;
  const { data: settlements, isLoading: isLoadingSettlements } = useSettlements(selectedGroupId ?? "");
  const { mutate: createSettlement, isPending: isCreatingSettlement } = useCreateSettlement();
  // const { data: monthlySpendingData, isLoading: isLoadingSpending } = useMonthlySpending(userId ?? "");

  const summaryStats = stats ? [
    {
      title: 'Total Expenses',
      value: `₹${stats.totalExpenses}`,
      icon: <IndianRupee />,
      color: 'primary',
      bgColor: 'bg-primary/10',
      bgGradient: 'bg-gradient-to-br from-orange-50 to-transparent',
      trend: 'neutral',
      change: 'Lifetime group expenses'
    },
    {
      title: 'You Owe',
      value: `₹${stats.youOwe}`,
      icon: <ArrowUpCircle />,
      color: 'destructive',
      bgColor: 'bg-destructive/10',
      bgGradient: 'bg-gradient-to-br from-red-50 to-transparent',
      trend: 'down',
      change: 'You owe'
    },
    {
      title: 'Owed to You',
      value: `₹${stats.owedToYou}`,
      icon: <ArrowDownCircle />,
      color: 'success',
      bgColor: 'bg-success/10',
      bgGradient: 'bg-gradient-to-br from-green-50 to-transparent',
      trend: 'up',
      change: 'Owed to you'
    },
    {
      title: 'Active Groups',
      value: stats.activeGroups.toString(),
      icon: <Users />,
      color: 'info',
      bgColor: 'bg-blue-500/10',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-transparent',
      trend: 'neutral',
      change: 'Active groups'
    }
  ] : [];

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(id);
  }, []);

  const recentExpenses = recentExpensesData?.map(expense => ({
    id: expense.id,
    description: expense.description,
    group: expense.group.name,
    date: new Date(expense.createdAt).toLocaleDateString(),
    amount: expense.amount.toString(),
    status: 'pending',
    avatar: expense.user.avatarUrl,
    paidBy: expense.user.displayName
  })) ?? [];

  const quickActions = [
    {
      title: 'Add Expense',
      subtitle: 'Record a new expense',
      icon: <PlusCircle className="h-5 w-5" />,
      to: '/add-expense'
    },
    {
      title: 'Settle Up',
      subtitle: 'Pay back friends',
      icon: <Handshake className="h-5 w-5" />,
      to: '/settle-up'
    },
    {
      title: 'Create Group',
      subtitle: 'Start a new group',
      icon: <UserPlus className="h-5 w-5" />,
      to: '/groups/create'
    },
    {
      title: 'View Analytics',
      subtitle: 'See spending insights',
      icon: <LineChart className="h-5 w-5" />,
      to: '/analytics'
    }
  ];

  const activeGroups = activeGroupsData?.map((group, index) => ({
    ...group,
    color: ['bg-primary', 'bg-green-500', 'bg-blue-500'][index % 3],
    icon: [<Plane className="h-5 w-5" />, <Building2 className="h-5 w-5" />, <Home className="h-5 w-5" />][index % 3],
    balance: Number(group.balance)
  })) ?? [];

  const mySettlements = (settlements ?? []).filter((settlement) => settlement.from.id === userId);

  const handleSettle = (settlement: { from: { id: string }; to: { id: string }; amount: string }) => {
    if (!selectedGroupId) {
      return;
    }

    createSettlement({
      group_id: selectedGroupId,
      from_user_id: settlement.from.id,
      to_user_id: settlement.to.id,
      amount: Number(settlement.amount),
      method: "ONLINE",
    });
  };

  return (
    <div className={`p-6 space-y-6 transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-primary">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your shared expenses and balances.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border border-border/60 shadow-sm h-28 p-4">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          summaryStats.map((stat, index) => (
          <Card
            key={index}
            className={`${stat.bgGradient} ${stat.bgColor} rounded-2xl border border-border/60 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 h-28 backdrop-blur-sm`}
          >
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <h3 className={`text-3xl font-extrabold mt-1 transition-transform duration-500 ${mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>{stat.value}</h3>
                </div>
                <div className="flex flex-col items-end">
                  <div className="h-10 w-10 rounded-md flex items-center justify-center text-white bg-white/10">{stat.icon}</div>
                  <span className="text-xs text-muted-foreground mt-2">{stat.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {quickActions.slice(0,3).map((action, idx) => (
          <a key={idx} href={action.to} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">{action.icon}</div>
            <div>
              <div className="text-sm font-medium">{action.title}</div>
              <div className="text-xs text-muted-foreground">{action.subtitle}</div>
            </div>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6">
        {/* Recent Expenses (70%) */}
        <div className="lg:col-span-7 md:col-span-2">
          <Card className="mb-6">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-6 gap-3">
              <CardTitle className="text-2xl">Recent Expenses</CardTitle>
              <Button variant="link" size="sm" asChild>
                <a href="/expenses" className="flex items-center text-sm">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </CardHeader>

            <div className="border-t border-border">
              {isLoadingRecent ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : recentExpenses.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-muted/30 transition-transform duration-200 rounded-md gap-4">
                      <div className="flex items-start gap-4 min-w-0 w-full sm:w-auto">
                        <div className="flex flex-col items-center">
                          <span className="h-3 w-3 rounded-full bg-primary mt-2" />
                          <span className="w-px bg-border flex-1 mt-2" />
                        </div>
                        <div className="flex items-center gap-4 min-w-0 w-full">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={expense.avatar} />
                            <AvatarFallback>IC</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{expense.description}</p>
                            <p className="text-xs text-muted-foreground truncate">{expense.group} • {expense.date}</p>
                            <p className="text-xs text-muted-foreground truncate">Paid by {expense.paidBy}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto text-left sm:text-right">
                        <div className="text-lg font-bold">₹{expense.amount}</div>
                        <Badge className={expense.status === 'settled' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="bg-muted rounded-full p-4 mb-4">
                    <IndianRupee className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-700">No expenses yet</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mb-6">
                    Start by adding your first expense to track group spending.
                  </p>
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add First Expense
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
        {/* Active Groups (30%) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold">Active Groups</h3>
            <Button variant="link" size="sm" asChild>
              <a href="/groups" className="flex items-center text-sm">View All <ChevronRight className="ml-1 h-4 w-4" /></a>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoadingGroups && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="w-full">
                        <Skeleton className="h-4 w-28 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {!isLoadingGroups && activeGroups.length > 0 && (
              <>
                {activeGroups.map((group) => (
                  <div key={group.id} className="rounded-xl border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-transform duration-200 hover:-translate-y-1">
                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto w-full sm:w-auto">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${group.color}`}>{group.icon}</div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{group.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{group.members} members</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                      <div className="text-sm text-muted-foreground">Your Balance</div>
                      <div className={`text-lg font-bold ${group.balance > 0 ? 'text-green-500' : group.balance < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{group.balance > 0 ? '+' : ''}₹{Math.abs(group.balance)}</div>
                      <Button size="sm" variant="outline" className="rounded-full transition-transform duration-200 hover:scale-105 w-full sm:w-auto" asChild>
                        <a href={`/groups/${group.id}`}>View</a>
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {!isLoadingGroups && activeGroups.length === 0 && (
              <div className="p-4">
                <Alert>
                  <AlertTitle>No groups yet</AlertTitle>
                  <p>Create your first group to start splitting expenses.</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <a href="/groups/create">Create Group</a>
                  </Button>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settlements Section */}
      {selectedGroupId && (
        <Card className="mb-6 max-h-56 overflow-auto">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-3">
            <CardTitle>Suggested Settlements</CardTitle>
            {isLoadingSettlements && (
              <div className="text-sm text-muted-foreground">Loading...</div>
            )}
          </CardHeader>
          <div className="border-t border-border">
            <div className="divide-y divide-border">
              {isLoadingSettlements ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : mySettlements.length > 0 ? (
                mySettlements.map((settlement, index) => {
                  const amount = Number(settlement.amount);

                  return (
                    <div key={`${settlement.from.id}-${settlement.to.id}-${index}`} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={settlement.to.avatar ?? undefined} />
                          <AvatarFallback>{settlement.to.name?.[0] ?? "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">You owe {settlement.to.name}</p>
                          <p className="text-sm text-muted-foreground">₹{amount}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSettle(settlement)}
                        disabled={isCreatingSettlement}
                        className="transition-transform duration-200 hover:scale-105"
                      >
                        {isCreatingSettlement ? "Settling..." : "Settle Now"}
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <div className="bg-muted rounded-full p-4 mb-3">
                    <Handshake className="h-8 w-8 text-green-500 opacity-80" />
                  </div>
                  <h3 className="text-sm font-bold text-green-700">You're all settled!</h3>
                  <p className="text-xs text-muted-foreground">
                    No pending settlements in this group.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg">
              <LineChart className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-center text-muted-foreground mt-2">Chart will be implemented</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="p-4">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg">
              <div className="h-16 w-16 rounded-full border-4 border-muted-foreground/50 border-t-primary"></div>
              <p className="text-center text-muted-foreground mt-2">Chart will be implemented</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;