import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useState, useMemo } from 'react'
import CreateGroupForm from "./CreateGroupForm"
import type { Group } from "../../../store/groupStore"
import CreateExpenseForm from "../expence/CreateExpenseForm"
import Icon from '@/components/shared/Icon'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useGroup } from './api'
import { useUser } from "@/hooks/useUser"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import AddMemberForm from './AddMembers'

export default function Groups() {
  const { userId } = useUser();
  const [isCreateGroupFormOpen, setIsCreateGroupFormOpen] = useState(false);
  const [isAddMemberFormOpen, setIsAddMemberFormOpen] = useState(false);

  // Selected group state
  const [selectedGroupForExpense, setSelectedGroupForExpense] = useState<Group | null>(null);
  const [selectedGroupDetailsForMembers, setSelectedGroupDetailsForMembers] = useState<{ id: string; name: string } | null>(null);

  const { data: groups = [], isLoading: isLoadingGroups, error: errorGroups } = useGroup(userId ?? "");

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return groups.filter(g => {
      if (term && !g.name?.toLowerCase().includes(term)) return false;
      if (filter === 'positive') return Number(g.balance) > 0;
      if (filter === 'negative') return Number(g.balance) < 0;
      return true;
    });
  }, [groups, searchTerm, filter]);

  const handleAddMembersClick = (group: Group) => {
    if (group.id && group.name) {
      setSelectedGroupDetailsForMembers({ id: group.id, name: group.name });
      setIsAddMemberFormOpen(true);
    } else {
      console.error("Group ID or Name is undefined for selected group:", group);
    }
  };

  return (
    <div className='p-4 md:p-6 space-y-6 pb-20'>
      {/* Header & Controls */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-primary'>Groups</h1>
          <p className='text-xs md:text-sm text-muted-foreground mt-0.5'>
            Manage your groups, members, and shared expenses.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="w-full md:w-auto flex flex-col gap-2">
          <div className="relative w-full md:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon name="Search" size={16} className="text-muted-foreground" />
            </div>
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 w-full"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button 
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`} 
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === 'positive' ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}`} 
              onClick={() => setFilter('positive')}
            >
              Positive
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === 'negative' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}`} 
              onClick={() => setFilter('negative')}
            >
              Negative
            </button>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoadingGroups && <p className='text-sm text-muted-foreground'>Loading groups...</p>}
      {errorGroups && <p className='text-sm text-red-500'>Error loading groups</p>}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group: Group, idx: number) => (
            <Card key={group.id ?? idx} className="hover:shadow-md transition-all flex flex-col justify-between">
              
              {/* Card Header */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 rounded-lg shrink-0">
                    <AvatarImage src={group.avatarUrl} />
                    <AvatarFallback>{group.name?.[0] ?? "G"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="capitalize text-base font-semibold truncate">{group.name}</CardTitle>
                    <p className="text-xs text-muted-foreground truncate">{group.description || "No description"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Icon name="MoreVertical" size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleAddMembersClick(group)}>Add Members</DropdownMenuItem>
                      <DropdownMenuItem>Delete Group</DropdownMenuItem>
                      <DropdownMenuItem>Remove Members</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              {/* Card Content */}
              <CardContent className="p-4 pt-2 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Total expenses</span>
                    <span className="font-semibold text-foreground">₹{group.totalExpenses ?? 0}</span>
                  </div>
                  <Progress value={Math.min(100, Number(group.totalExpenses) ? 50 : 0)} className="h-1.5" />

                  {/* Members Stack */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex -space-x-2 overflow-hidden py-1">
                      {group.member?.slice(0, 5).map((member) => (
                        <Avatar key={member.user.id} className="h-7 w-7 ring-2 ring-background">
                          <AvatarImage src={member.user.avatarUrl} />
                          <AvatarFallback className="text-[10px]">{member.user.displayName?.[0] ?? 'U'}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {group.member?.length ?? group.members ?? 0} members
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant={'ghostBlue'} size="sm" className="w-full text-xs">View Expense</Button>
                  <Button variant={'ghostGreen'} size="sm" className="w-full text-xs" onClick={() => setSelectedGroupForExpense(group)}>Create Expense</Button>
                </div>
              </CardContent>

            </Card>
          ))
        ) : (
          /* Empty State */
          <div className="col-span-full">
            <Card className="p-8 text-center border-dashed">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Icon name="Users" size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold">No groups found</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Create a group to start splitting expenses with friends.</p>
              <Dialog open={isCreateGroupFormOpen} onOpenChange={setIsCreateGroupFormOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Create Group</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <CreateGroupForm onClose={() => setIsCreateGroupFormOpen(false)} />
                </DialogContent>
              </Dialog>
            </Card>
          </div>
        )}
      </div>

      {/* Add Members Dialog */}
      {selectedGroupDetailsForMembers && (
        <Dialog open={isAddMemberFormOpen} onOpenChange={setIsAddMemberFormOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Members to "{selectedGroupDetailsForMembers.name}"</DialogTitle>
            </DialogHeader>
            <AddMemberForm
              groupId={selectedGroupDetailsForMembers.id}
              groupName={selectedGroupDetailsForMembers.name}
              onClose={() => setIsAddMemberFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Create Expense Dialog */}
      <Dialog open={!!selectedGroupForExpense} onOpenChange={() => setSelectedGroupForExpense(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Expense</DialogTitle>
          </DialogHeader>
          {selectedGroupForExpense && (
            <CreateExpenseForm
              onClose={() => setSelectedGroupForExpense(null)}
              members={selectedGroupForExpense.member ?? []}
              groupId={selectedGroupForExpense.id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <div className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-10">
        <Dialog open={isCreateGroupFormOpen} onOpenChange={setIsCreateGroupFormOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg flex items-center gap-2 px-4 py-3">
              <Icon name="PlusCircle" size={20} />
              <span className="hidden sm:inline text-sm font-medium">Create Group</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <CreateGroupForm onClose={() => setIsCreateGroupFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}