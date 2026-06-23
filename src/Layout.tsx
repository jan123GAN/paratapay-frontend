import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div >
     
      <main className="flex-grow">
        <Outlet />
      </main>
    
    </div>
  );
};

export default Layout;