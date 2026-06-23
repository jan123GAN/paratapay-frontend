import { useGroupStore } from '@/store/groupStore';
// import type { Group } from '@/store/groupStore'; 

export const useGroup = () => {
  const group = useGroupStore((state) => state.group);
  const isAdmin = useGroupStore((state) => state.isAdmin);
  const setGroup = useGroupStore((state) => state.setGroup);
  const setIsAdmin = useGroupStore((state) => state.setIsAdmin);
  const clearGroup = useGroupStore((state) => state.clearGroup);

  return {
    group,
    isAdmin,
    setGroup,
    setIsAdmin,
    clearGroup,
  };
};
