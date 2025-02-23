import React from 'react';
import { Search, Settings, LayoutGrid } from 'lucide-react';
import { LightbulbIcon, Bell, PencilLine, Archive, Trash } from 'lucide-react';

function HeaderComponent() {
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
                        <span className="ml-2 text-xl text-white">MeloTask</span>
                    </div>
                </div>

                <div className="flex flex-1 mx-8">
                    <div className="flex items-center w-full max-w-2xl bg-gray-100 rounded-lg px-4 py-2">
                        <Search className="w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search"
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
                    <button className="ml-2">
                        <img
                            src="/group.png"
                            alt="Profile"
                            className="w-8 h-8 rounded-full"
                        />
                    </button>
                </div>
            </div>

            <div className="fixed top-0 left-0 h-screen bg-[#202124] text-gray-300 pt-16 w-12 hover:w-64 transition-all duration-300 group z-10">
                <nav>
                    <ul className="space-y-1">
                        <li>
                            <button className="flex items-center w-full px-3  py-3 text-white rounded-r-full bg-[#41331C] hover:bg-gray-700">
                                <LightbulbIcon className="w-5 h-5 min-w-[20px]" />
                                <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Notes</span>
                            </button>
                        </li>

                        <li>
                            <button className="flex items-center w-full px-3  py-3 hover:bg-gray-700 rounded-r-full">
                                <Bell className="w-5 h-5 min-w-[20px]" />
                                <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Reminders</span>
                            </button>
                        </li>

                        <li>
                            <button className="flex items-center w-full px-3  py-3 hover:bg-gray-700 rounded-r-full">
                                <PencilLine className="w-5 h-5 min-w-[20px]" />
                                <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Edit labels</span>
                            </button>
                        </li>

                        <li>
                            <button className="flex items-center w-full px-3  py-3 hover:bg-gray-700 rounded-r-full">
                                <Archive className="w-5 h-5 min-w-[20px]" />
                                <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Archive</span>
                            </button>
                        </li>

                        <li>
                            <button className="flex items-center w-full px-3 py-3 hover:bg-gray-700 rounded-r-full">
                                <Trash className="w-5 h-5 min-w-[20px]" />
                                <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Trash</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    );
}

export default HeaderComponent;