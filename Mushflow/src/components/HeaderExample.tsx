"use client";

import React from 'react';
import { useHeader } from './Header/header';

export const HeaderExample = () => {
  const { activeNavId, setActiveNavId, navItems, setNavItems } = useHeader();

  // Example function to change the active navigation item
  const changeActiveNav = (id: string) => {
    setActiveNavId(id);
  };

  // Example function to add a new navigation item
  const addNewNavItem = () => {
    const newItem = {
      id: `custom-${Date.now()}`,
      icon: <span className="w-5 h-5 min-w-[20px] flex items-center justify-center">📝</span>,
      label: `Custom ${navItems.length + 1}`
    };
    
    setNavItems([...navItems, newItem]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Header Control Panel</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Active Nav: {activeNavId}</h3>
        <div className="flex flex-wrap gap-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => changeActiveNav(item.id)}
              className={`px-3 py-2 rounded-md ${
                item.isActive 
                  ? 'bg-[#41331C] text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <button 
          onClick={addNewNavItem}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Custom Nav Item
        </button>
      </div>
    </div>
  );
}; 