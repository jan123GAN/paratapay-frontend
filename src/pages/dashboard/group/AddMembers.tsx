import React, { useState } from 'react';
import { useUserSearch, useAddMemberToGroupMutation } from './api';
import type { User } from '@/store/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { toast } from "sonner";


interface AddMemberFormProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ groupId, groupName, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearchTrigger, setCurrentSearchTrigger] = useState('');

  const { data: searchResults, isLoading: isSearching, error: searchError } = useUserSearch(currentSearchTrigger);
  const { mutate: addMember, isPending: isAdding } = useAddMemberToGroupMutation();
 

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentSearchTrigger(searchQuery);
  };

  const handleAddClick = (userIdToAdd: string): void => {
    console.log(`Adding userId: ${userIdToAdd} to groupId: ${groupId}`);
    addMember(
      { groupId, userId: userIdToAdd },
    );
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold text-primary mb-4">Add Members to "{groupName}"</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="search" className="text-sm font-medium text-muted-foreground">
            Search Users
          </label>
          <Input
            type="text"
            id="search"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Enter username or email"
          />
        </div>
        <Button type="submit" className="w-full">
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {searchError && <p className="text-sm text-red-500">Error searching users.</p>}

      {searchResults?.data?.user && searchResults.data.user.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-primary">Search Results</h3>
          {searchResults.data.user.map((user: User) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-4 p-3 border rounded-lg shadow-sm hover:bg-muted transition"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback>
                    {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-primary">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email} {user.id}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddClick(user.id)}
                disabled={isAdding}
              >
                {isAdding ? 'Adding...' : 'Add'}
              </Button>
            </div>
          ))}
        </div>
      )}

      {currentSearchTrigger &&
        !isSearching &&
        !searchError &&
        (!searchResults?.data?.user || searchResults.data.user.length === 0) && (
          <p className="text-sm text-muted-foreground">
            No users found for "<span className="font-medium">{currentSearchTrigger}</span>".
          </p>
        )}
        <Button variant="secondary" onClick={onClose} className="w-full mt-4">Close</Button>
    </div>
  );
};

export default AddMemberForm;