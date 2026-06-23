import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useState } from 'react'
import CreateGroupForm from "./CreateGroupForm"
import type { Group } from "../../../store/groupStore"
import CreateExpenseForm from "../expence/CreateExpenseForm"
import Icon from '@/components/shared/Icon'
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

  // ✅ selected group for expense
  const [selectedGroupForExpense, setSelectedGroupForExpense] = useState<Group | null>(null);
  const [selectedGroupDetailsForMembers, setSelectedGroupDetailsForMembers] = useState<{ id: string; name: string } | null>(null);

  const { data: groups = [], isLoading: isLoadingGroups, error: errorGroups } = useGroup(userId ?? "");

  const handleAddMembersClick = (group: Group) => {
    if (group.id && group.name) {
      setSelectedGroupDetailsForMembers({ id: group.id, name: group.name });
      setIsAddMemberFormOpen(true);
    } else {
      console.error("Group ID or Name is undefined for selected group:", group);
    }
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 mt-6 gap-4'>
        <h1 className='text-2xl md:text-3xl font-bold text-primary'>Groups</h1>
        <Dialog open={isCreateGroupFormOpen} onOpenChange={setIsCreateGroupFormOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="flex items-center gap-2">
              <Icon name="PlusCircle" size={20} className="text-black" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <CreateGroupForm onClose={() => setIsCreateGroupFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoadingGroups && <p>Loading groups...</p>}
      {errorGroups && <p className='text-red-500'>Error loading groups</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {groups.map((group: Group, idx: number) => (
          <Card key={group.id ?? idx} className="hover:shadow-md transition-all">
            <CardHeader className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-md">
                  <AvatarImage src={group.avatarUrl} />
                  <AvatarFallback>{group.name?.[0] ?? "G"}</AvatarFallback>
                </Avatar>
                <CardTitle className="capitalize text-lg truncate max-w-[140px]">{group.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-accent-foreground">
                    <Icon name="MoreVertical" size={20} className="cursor-pointer" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => handleAddMembersClick(group)}>Add Members</DropdownMenuItem>
                  <DropdownMenuItem>Delete Group</DropdownMenuItem>
                  <DropdownMenuItem>Remove Members</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            
            <CardContent className="pt-2 space-y-4">
              <p className="text-muted-foreground text-sm truncate max-w-[140px]">{group.description}</p>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className='text-lg'>Your balance</span>
                  <span className='text-lg text-chart'>+₹0</span>
                </div>
                <Progress value={0} className="h-2" />

                {/* ✅ Members directly from group */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {group.member?.map((member) => (
                    <div key={member.user.id} className="flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded-full">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.user.avatarUrl} />
                        <AvatarFallback>{member.user.displayName?.[0] ?? "U"}</AvatarFallback>
                      </Avatar>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant={'ghostBlue'}>View Expense</Button>
                <Button variant={'ghostGreen'} onClick={() => setSelectedGroupForExpense(group)}>Create Expense</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

      {/* ✅ Create Expense Dialog */}
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
    </div>
  );
}
