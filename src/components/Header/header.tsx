"use client";

import React, { useEffect, useState, createContext, useContext, useRef } from 'react';
import { Search, LayoutGrid, LogIn, LogOut, Music, Pin, X } from 'lucide-react';
import { LightbulbIcon } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useAppDispatch } from '@/redux/hooks';
import { setCurrentView } from '@/redux/features/navigationSlice';
import { showLogin } from '@/redux/features/authSlice';
import { SettingsButton } from '@/components/Settings';
import AnimatedMushIcon from '../animIcon/AnimMushIcon';

type NavItem = {
    id: string;
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
};


type HeaderContextType = {
    navItems: NavItem[];
    setNavItems: React.Dispatch<React.SetStateAction<NavItem[]>>;
    activeNavId: string | null;
    setActiveNavId: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isSearchExpanded: boolean;
    setIsSearchExpanded: (expanded: boolean) => void;
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
        { id: 'pinned', icon: <Pin className="w-5 h-5 min-w-[20px]" />, label: 'Pinned' },
    ]);
    const [activeNavId, setActiveNavId] = useState<string | null>('notes');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

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
        setSearchQuery,
        isSearchExpanded,
        setIsSearchExpanded
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
    const { navItems, setActiveNavId, searchQuery, setSearchQuery, isSearchExpanded, setIsSearchExpanded } = useHeader();
    const dispatch = useAppDispatch();
    const searchRef = useRef<HTMLDivElement>(null);
    const [isClosing, setIsClosing] = useState(false);
    
    // Handle clicks outside of the search bar
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node) && isSearchExpanded) {
                handleSearchClose();
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSearchExpanded]);
    
    // Handle search close with animation
    const handleSearchClose = () => {
        if (isSearchExpanded && !isClosing) {
            setIsClosing(true);
            setTimeout(() => {
                setIsSearchExpanded(false);
                setIsClosing(false);
            }, 280); // Slightly less than animation duration to prevent flicker
        }
    };
    
    const handleNavItemClick = (id: string) => {
        setActiveNavId(id);
        
        // Check if user is authenticated
        // if (status !== 'authenticated') {
        //     dispatch(showLogin());
        //     return;
        // }
        
        // Update the app state based on the nav item
        if (id === 'jam' || id === 'notes' || id === 'pinned') {
            dispatch(setCurrentView(id));
        } else {
            console.log(`Navigated to ${id} view`);
        }
    };
    useEffect(() => {
        if (status === 'unauthenticated') {
          dispatch(showLogin());
        }
      }, [status, dispatch]);


    return (
        <>
            <div className="sticky top-0 left-0 right-0 flex items-center w-full px-4 py-2 bg-stone-800 shadow-sm z-30">
                <div className="flex items-center">
                    <AnimatedMushIcon />
                    <span className="ml-2 text-xl text-white">MushFlow</span>
                </div>

                {/* Desktop search - hidden on mobile */}
                <div className="hidden md:flex flex-1 mx-8">
                    <div className={`flex items-center w-full max-w-2xl bg-neutral-800 border ${searchQuery ? 'border-blue-500/70' : 'border-neutral-700'} rounded-full px-3 py-1.5 transition-all ease-in-out duration-200 hover:border-neutral-600 focus-within:border-neutral-500 focus-within:shadow-sm focus-within:shadow-neutral-700/50`}>
                        <Search className={`w-4 h-4 ${searchQuery ? 'text-blue-400' : 'text-neutral-400'}`} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full ml-3 bg-transparent border-none outline-none placeholder-neutral-500 text-neutral-300 text-sm"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="p-0.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Search Icon - visible only on mobile */}
                <div className="flex md:hidden ml-auto mr-2">
                    <button 
                        onClick={() => isSearchExpanded ? handleSearchClose() : setIsSearchExpanded(true)}
                        className="p-2 rounded-full text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center ">
                    {/* Show settings button only on mobile */}
                    <div className="md:hidden">
                        <SettingsButton />
                    </div>
                    
                    {isAuthenticated && (
                        <div className="flex items-center space-x-2">
                            {session?.user?.image ? (
                                <button 
                                    className="ml-2 relative group"
                               >
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "Profile"}
                                        className="w-8 h-8 rounded-full"
                                        onError={(e) => {
                                            console.log("Image failed to load:", session.user.image,e);
                                            // e.currentTarget.src = "/default-avatar.png"; // Fallback image
                                        }}
                                    />
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
                    )}
                </div>
            </div>

            {/* Mobile expanded search overlay - appears when search is expanded */}
            {(isSearchExpanded || isClosing) && (
                <div 
                    ref={searchRef}
                    className={`fixed md:hidden top-0 left-0 right-0 z-40 bg-stone-800 p-3 shadow-md ${isClosing ? 'animate-slideUp' : 'animate-slideDown'}`}
                >
                    <div className="flex items-center">
                        <div className={`flex items-center w-full bg-neutral-800 border ${searchQuery ? 'border-blue-500/70' : 'border-neutral-700'} rounded-full px-3 py-1.5`}>
                            <Search className={`w-4 h-4 ${searchQuery ? 'text-blue-400' : 'text-neutral-400'}`} />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full ml-3 bg-transparent border-none outline-none placeholder-neutral-500 text-neutral-300 text-sm"
                                autoFocus
                            />
                            {searchQuery ? (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="p-0.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSearchClose}
                                    className="p-0.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar - hidden on mobile */}
            <div className="fixed top-0 left-0 h-screen bg-[#202124] text-gray-300 pt-16 w-12 hover:w-64 transition-all duration-300 group z-20 hidden md:flex flex-col justify-between">
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
                
                {/* Settings button at bottom of sidebar */}
                <div className="mb-4">
                    <div className="hidden md:block">
                        <SettingsButton className="w-full flex items-center px-3 py-3 rounded-r-full hover:bg-gray-700 text-neutral-400 hover:text-white transition-colors" />
                    </div>
                </div>
            </div>

            {/* Mobile bottom navigation - visible only on mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#202124] text-gray-300 z-10 md:hidden">
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
        { id: 'pinned', icon: <Pin className="w-5 h-5 min-w-[20px]" />, label: 'Pinned' },
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    
    // Handle clicks outside of the search bar
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node) && isSearchExpanded) {
                handleSearchClose();
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSearchExpanded]);
    
    // Handle search close with animation
    const handleSearchClose = () => {
        if (isSearchExpanded && !isClosing) {
            setIsClosing(true);
            setTimeout(() => {
                setIsSearchExpanded(false);
                setIsClosing(false);
            }, 280); // Slightly less than animation duration to prevent flicker
        }
    };
    
    const handleNavItemClick = (id: string) => {
        setNavItems(prev => 
            prev.map(item => ({
                ...item,
                isActive: item.id === id
            }))
        );
        
        // Check if user is authenticated
        if (status !== 'authenticated') {
            dispatch(showLogin());
            return;
        }
        
        // Update the app state based on the nav item
        if (id === 'jam' || id === 'notes' || id === 'pinned') {
            dispatch(setCurrentView(id));
        } else {
            console.log(`Navigated to ${id} view`);
        }
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

                {/* Desktop search - hidden on mobile */}
                <div className="hidden md:flex flex-1 mx-8">
                    <div className={`flex items-center w-full max-w-2xl bg-neutral-800 border ${searchQuery ? 'border-blue-500/70' : 'border-neutral-700'} rounded-full px-3 py-1.5 transition-all duration-200 hover:border-neutral-600 focus-within:border-neutral-500 focus-within:shadow-sm focus-within:shadow-neutral-700/50`}>
                        <Search className={`w-4 h-4 ${searchQuery ? 'text-blue-400' : 'text-neutral-400'}`} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full ml-3 bg-transparent border-none outline-none placeholder-neutral-500 text-neutral-300 text-sm"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="p-0.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Search Icon - visible only on mobile */}
                <div className="flex md:hidden ml-auto mr-2">
                    <button 
                        onClick={() => isSearchExpanded ? handleSearchClose() : setIsSearchExpanded(true)}
                        className="p-2 rounded-full text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Show settings button only on mobile */}
                    <div className="md:hidden">
                        <SettingsButton />
                    </div>
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

            {/* Mobile expanded search overlay - appears when search is expanded */}
            {(isSearchExpanded || isClosing) && (
                <div 
                    ref={searchRef}
                    className={`fixed md:hidden top-0 left-0 right-0 z-40 bg-stone-800 p-3 shadow-md ${isClosing ? 'animate-slideUp' : 'animate-slideDown'}`}
                >
                    <div className="flex items-center">
                        <div className={`flex items-center w-full bg-neutral-800 border ${searchQuery ? 'border-blue-500/70' : 'border-neutral-700'} rounded-full px-3 py-1.5`}>
                            <Search className={`w-4 h-4 ${searchQuery ? 'text-blue-400' : 'text-neutral-400'}`} />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full ml-3 bg-transparent border-none outline-none placeholder-neutral-500 text-neutral-300 text-sm"
                                autoFocus
                            />
                            {searchQuery ? (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="p-0.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSearchClose}
                                    className="p-0.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar - hidden on mobile */}
            <div className="fixed top-0 left-0 h-screen bg-[#202124] text-gray-300 pt-16 w-12 hover:w-64 transition-all duration-300 group z-20 hidden md:flex flex-col justify-between">
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
                
                {/* Settings button at bottom of sidebar */}
                <div className="mb-4 px-3">
                    <div className="hidden md:block">
                        <SettingsButton className="w-full flex items-center px-3 py-3 rounded-r-full hover:bg-gray-700 text-neutral-400 hover:text-white transition-colors" />
                    </div>
                </div>
            </div>

            {/* Mobile bottom navigation - visible only on mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#202124] text-gray-300 z-10 md:hidden">
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