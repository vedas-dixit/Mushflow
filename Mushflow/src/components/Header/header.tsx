"use client";

import React, { useEffect, useState, createContext, useContext } from 'react';
import { Search, Settings, LayoutGrid, LogIn, LogOut, Music } from 'lucide-react';
import { LightbulbIcon, Bell, PencilLine, Archive, Trash } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

// Define types for our navigation items
type NavItem = {
    id: string;
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
};

// Create a context for header state
type HeaderContextType = {
    navItems: NavItem[];
    setNavItems: React.Dispatch<React.SetStateAction<NavItem[]>>;
    activeNavId: string | null;
    setActiveNavId: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

// Custom hook to use the header context
export const useHeader = () => {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error('useHeader must be used within a HeaderProvider');
    }
    return context;
};

// Header Provider component
export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [navItems, setNavItems] = useState<NavItem[]>([
        { id: 'notes', icon: <LightbulbIcon className="w-5 h-5 min-w-[20px]" />, label: 'Notes', isActive: true },
        { id: 'jam', icon: <Music className="w-5 h-5 min-w-[20px]" />, label: 'JAM Mode' },
        { id: 'pinned', icon: <Bell className="w-5 h-5 min-w-[20px]" />, label: 'Pinned' },
    ]);
    const [activeNavId, setActiveNavId] = useState<string | null>('notes');
    const [searchQuery, setSearchQuery] = useState('');

    const handleSetActiveNavId = (id: string) => {
        setActiveNavId(id);
        setNavItems(prev => 
            prev.map(item => ({
                ...item,
                isActive: item.id === id
            }))
        );
    };

    const value = {
        navItems,
        setNavItems,
        activeNavId,
        setActiveNavId: handleSetActiveNavId,
        searchQuery,
        setSearchQuery
    };

    return (
        <HeaderContext.Provider value={value}>
            {children}
        </HeaderContext.Provider>
    );
};

// The internal component that uses the context
const HeaderWithContext = () => {
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const { navItems, setActiveNavId, searchQuery, setSearchQuery } = useHeader();

    const handleNavItemClick = (id: string) => {
        setActiveNavId(id);
        // You can add additional logic here for navigation if needed
        console.log(`Navigated to ${id} view`);
    };

    return (
        <>
            <div className="sticky top-0 left-0 right-0 flex items-center w-full px-4 py-2 bg-stone-800 shadow-sm z-30">
                <div className="flex items-center">
                    <div className="flex items-center ml-2">
                        <img
                            src="/mush.png"
                            alt="Keep Logo"
                            className="w-10 h-10"
                        />
                        <span className="ml-2 text-xl text-white">MushFlow</span>
                    </div>
                </div>

                <div className="flex flex-1 mx-8">
                    <div className="flex items-center w-full max-w-2xl bg-gray-100 rounded-lg px-4 py-2">
                        <Search className="w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full ml-3 bg-transparent border-none outline-none placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Settings className="w-6 h-6 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <LayoutGrid className="w-6 h-6 text-gray-600" />
                    </button>
                    
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-2">
                            {session?.user?.image ? (
                                <button 
                                    className="ml-2 relative group"
                                    onClick={() => signOut()}
                               >
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "Profile"}
                                        className="w-8 h-8 rounded-full"
                                        onError={(e) => {
                                            console.log("Image failed to load:", session.user.image);
                                            // e.currentTarget.src = "/default-avatar.png"; // Fallback image
                                        }}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-white shadow-lg rounded-md p-2 hidden group-hover:block">
                                        <div className="text-sm text-gray-800 font-medium mb-1">{session.user.name}</div>
                                        <div className="text-xs text-gray-500 mb-2">{session.user.email}</div>
                                        <button 
                                            onClick={() => signOut()} 
                                            className="flex items-center text-sm text-red-600 hover:text-red-800"
                                        >
                                            <LogOut className="w-4 h-4 mr-1" />
                                            Sign out
                                        </button>
                                    </div>
                                </button>
                            ) : (
                                <button 
                                    className="ml-2 bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-white"
                                    onClick={() => signOut()}
                                >
                                    {session?.user?.name?.charAt(0) || "U"}
                                </button>
                            )}
                        </div>
                    ) : (
                        <button 
                            onClick={() => signIn('google')}
                            className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                        >
                            <LogIn className="w-4 h-4 mr-1" />
                            <span>Sign in</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Desktop sidebar - hidden on mobile */}
            <div className="fixed top-0 left-0 h-screen bg-[#202124] text-gray-300 pt-16 w-12 hover:w-64 transition-all duration-300 group z-10 hidden md:block">
                <nav>
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <button 
                                    className={`flex items-center w-full px-3 py-3 rounded-r-full ${
                                        item.isActive 
                                            ? 'text-white bg-[#41331C] hover:bg-gray-700' 
                                            : 'hover:bg-gray-700'
                                    }`}
                                    onClick={() => handleNavItemClick(item.id)}
                                >
                                    {item.icon}
                                    <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {item.label}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Mobile bottom navigation - visible only on mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#202124] text-gray-300 z-30 md:hidden">
                <nav className="flex justify-around">
                    {navItems.map((item) => (
                        <button 
                            key={item.id}
                            className={`flex flex-col items-center justify-center py-3 px-4 w-full ${
                                item.isActive 
                                    ? 'text-white bg-[#41331C]' 
                                    : 'hover:bg-gray-700'
                            }`}
                            onClick={() => handleNavItemClick(item.id)}
                        >
                            {item.icon}
                            <span className="text-xs mt-1">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </>
    );
};

// Standalone component that doesn't require the context
function HeaderComponent() {
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const [navItems, setNavItems] = useState<NavItem[]>([
        { id: 'notes', icon: <LightbulbIcon className="w-5 h-5 min-w-[20px]" />, label: 'Notes', isActive: true },
        { id: 'jam', icon: <Music className="w-5 h-5 min-w-[20px]" />, label: 'JAM Mode' },
        { id: 'pinned', icon: <Bell className="w-5 h-5 min-w-[20px]" />, label: 'Pinned' },
    ]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleNavItemClick = (id: string) => {
        setNavItems(prev => 
            prev.map(item => ({
                ...item,
                isActive: item.id === id
            }))
        );
        // You can add additional logic here for navigation if needed
        console.log(`Navigated to ${id} view`);
    };

    return (
        <>
            <div className="sticky top-0 left-0 right-0 flex items-center w-full px-4 py-2 bg-stone-800 shadow-sm z-30">
                <div className="flex items-center">
                    <div className="flex items-center ml-2">
                        <img
                            src="/mush.png"
                            alt="Keep Logo"
                            className="w-10 h-10"
                        />
                        <span className="ml-2 text-xl text-white">MushFlow</span>
                    </div>
                </div>

                <div className="flex flex-1 mx-8">
                    <div className="flex items-center w-full max-w-2xl bg-gray-100 rounded-lg px-4 py-2">
                        <Search className="w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full ml-3 bg-transparent border-none outline-none placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Settings className="w-6 h-6 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <LayoutGrid className="w-6 h-6 text-gray-600" />
                    </button>
                    
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-2">
                            {session?.user?.image ? (
                                <button 
                                    className="ml-2 relative group"
                                    onClick={() => signOut()}
                                >
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "Profile"}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-32 bg-white shadow-lg rounded-md p-2 hidden group-hover:block">
                                        <div className="text-sm text-gray-800 font-medium mb-1">{session.user.name}</div>
                                        <div className="text-xs text-gray-500 mb-2">{session.user.email}</div>
                                        <button 
                                            onClick={() => signOut()} 
                                            className="flex items-center text-sm text-red-600 hover:text-red-800"
                                        >
                                            <LogOut className="w-4 h-4 mr-1" />
                                            Sign out
                                        </button>
                                    </div>
                                </button>
                            ) : (
                                <button 
                                    className="ml-2 bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-white"
                                    onClick={() => signOut()}
                                >
                                    {session?.user?.name?.charAt(0) || "U"}
                                </button>
                            )}
                        </div>
                    ) : (
                        <button 
                            onClick={() => signIn('google')}
                            className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                        >
                            <LogIn className="w-4 h-4 mr-1" />
                            <span>Sign in</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Desktop sidebar - hidden on mobile */}
            <div className="fixed top-0 left-0 h-screen bg-[#202124] text-gray-300 pt-16 w-12 hover:w-64 transition-all duration-300 group z-10 hidden md:block">
                <nav>
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <button 
                                    className={`flex items-center w-full px-3 py-3 rounded-r-full ${
                                        item.isActive 
                                            ? 'text-white bg-[#41331C] hover:bg-gray-700' 
                                            : 'hover:bg-gray-700'
                                    }`}
                                    onClick={() => handleNavItemClick(item.id)}
                                >
                                    {item.icon}
                                    <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {item.label}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Mobile bottom navigation - visible only on mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#202124] text-gray-300 z-30 md:hidden">
                <nav className="flex justify-around">
                    {navItems.map((item) => (
                        <button 
                            key={item.id}
                            className={`flex flex-col items-center justify-center py-3 px-4 w-full ${
                                item.isActive 
                                    ? 'text-white bg-[#41331C]' 
                                    : 'hover:bg-gray-700'
                            }`}
                            onClick={() => handleNavItemClick(item.id)}
                        >
                            {item.icon}
                            <span className="text-xs mt-1">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </>
    );
}

// Create a component that uses the context if available, otherwise uses the standalone version
export const DynamicHeader = () => {
    // Try to use the context, but don't throw an error if it's not available
    const context = useContext(HeaderContext);
    
    // If context is available, use the context version
    if (context) {
        return <HeaderWithContext />;
    }
    
    // Otherwise, use the standalone version
    return <HeaderComponent />;
};

export default HeaderComponent;