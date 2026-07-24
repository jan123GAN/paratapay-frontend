import { 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
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

import { useUser } from "@/hooks/useUser";
import { useCreateSettlement, useDashboardStats, useRecentExpenses, useActiveGroups, useSettlements } from "./api";


function Dashboard() {
  const { userId } = useUser();
  const { data: stats} = useDashboardStats(userId ?? "");
  const { data: recentExpensesData } = useRecentExpenses(userId ?? "");
  const { data: activeGroupsData} = useActiveGroups(userId ?? "");
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
      trend: 'neutral',
      change: 'Current total'
    },
    {
      title: 'You Owe',
      value: `₹${stats.youOwe}`,
      icon: <ArrowUpCircle />,
      color: 'destructive',
      bgColor: 'bg-destructive/10',
      trend: 'down',
      change: 'Outstanding'
    },
    {
      title: 'Owed to You',
      value: `₹${stats.owedToYou}`,
      icon: <ArrowDownCircle />,
      color: 'success',
      bgColor: 'bg-success/10',
      trend: 'up',
      change: 'To receive'
    },
    {
      title: 'Active Groups',
      value: stats.activeGroups.toString(),
      icon: <Users />,
      color: 'info',
      bgColor: 'bg-blue-500/10',
      trend: 'neutral',
      change: 'Current groups'
    }
  ] : [];

  const recentExpenses = recentExpensesData?.map(expense => ({
    id: expense.id,
    description: expense.description,
    group: expense.group.name,
    date: new Date(expense.createdAt).toLocaleDateString(),
    amount: expense.amount.toString(),
    status: 'pending',
    avatar: expense.user.avatarUrl
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
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 mt-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary">Dashboard</h2>
          <p className="text-sm md:text-base text-muted-foreground">Track your expenses and group finances</p>
        </div>
        <Button size="lg" className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryStats.map((stat, index) => (
          <Card 
            key={index} 
            className={`${stat.bgColor} hover:translate-y-[-2px] transition-transform duration-200`}
          >
            <CardContent className="p-6 flex flex-col justify-between h-[140px]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <h3 className="text-xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`text-${stat.color}`}>{stat.icon}</div>
              </div>
              <div className="flex items-center mt-4">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : stat.trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : (
                  <Minus className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-xs ml-1">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle>Recent Expenses</CardTitle>
              <Button variant="link" size="sm" asChild>
                <a href="/expenses" className="flex items-center">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </CardHeader>
            
            <div className="border-t border-border">
              {recentExpenses.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage src={expense.avatar} />
                          <AvatarFallback>DP</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">{expense.group} • {expense.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{expense.amount}</div>
                        <Badge 
                          variant="outline"
                          className={expense.status === 'settled' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}
                        >
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
               <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
  <div className="bg-muted rounded-full  p-4 mb-4">
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

        {/* Quick Actions & Groups */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-4 pt-0">
              <div className="space-y-1">
                {quickActions.map((action, index) => (
                  <a 
                    key={index} 
                    href={action.to}
                    className="flex items-center py-3 px-2 hover:bg-accent rounded-md transition-colors"
                  >
                    <div className="mr-3 text-primary">
                      {action.icon}
                    </div>
                    <div>
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.subtitle}</div>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Groups */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle>Active Groups</CardTitle>
              <Button variant="link" size="sm" asChild>
                <a href="/groups" className="flex items-center">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </CardHeader>
            
            <div className="border-t border-border">
              {activeGroups.length > 0 ? (
                <div className="divide-y divide-border">
                  {activeGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 ${group.color} rounded-full flex items-center justify-center text-white mr-4`}>
                          {group.icon}
                        </div>
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {group.members} members • ₹{group.totalExpenses} total
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={
                          group.balance > 0 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : group.balance < 0 
                              ? 'bg-destructive/10 text-destructive border-destructive/20' 
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                        }
                      >
                        {group.balance > 0 ? '+' : ''}₹{Math.abs(group.balance)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
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
          </Card>
        </div>
      </div>

      {/* Settlements Section */}
      {selectedGroupId && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle>Suggested Settlements</CardTitle>
            {isLoadingSettlements && (
              <div className="text-sm text-muted-foreground">Loading...</div>
            )}
          </CardHeader>
          <div className="border-t border-border">
            <div className="divide-y divide-border">
              {mySettlements.length > 0 ? (
                mySettlements.map((settlement, index) => {
                  const amount = Number(settlement.amount);

                  return (
                    <div key={`${settlement.from.id}-${settlement.to.id}-${index}`} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
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
                      >
                        {isCreatingSettlement ? "Settling..." : "Settle Now"}
                      </Button>
                    </div>
                  );
                })) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
  <div className="bg-muted rounded-full p-4 mb-3">
    <Handshake className="h-8 w-8 text-green-500 opacity-80" />
  </div>
  <h3 className="text-sm font-bold text-green-700">All Settled Up!</h3>
  <p className="text-xs text-muted-foreground">
  All balances are settled in this group.
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