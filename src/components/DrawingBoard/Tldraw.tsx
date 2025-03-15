"use client";
import { useState } from 'react';
import { Tldraw } from "@tldraw/tldraw";
import { Pencil } from 'lucide-react';
import 'tldraw/tldraw.css';

export default function Whiteboard() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-stone-800 hover:bg-neutral-700 rounded-full text-white transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : 'translate-x-0'
                }`}
            >
                <Pencil size={24} />
            </button>

            <div
                className={`fixed top-0 right-0 h-screen w-full md:w-3/4 lg:w-2/3 bg-white transition-transform duration-300 ease-in-out transform z-40 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{ maxWidth: '1200px' }}
            >
                <div className="h-full w-full">
                    <Tldraw />
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}