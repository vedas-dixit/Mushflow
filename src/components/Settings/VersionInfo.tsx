"use client";

import React from 'react';
import { Info, GitBranchPlus } from 'lucide-react';

interface VersionInfoProps {
  version: string;
  buildDate?: string;
  onViewChangelog?: () => void;
}

const VersionInfo: React.FC<VersionInfoProps> = ({ 
  version = '1.0.0', 
  buildDate = new Date().toLocaleDateString(),
  onViewChangelog 
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-neutral-800 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Info size={16} className="text-neutral-400" />
            <span className="text-white">Version {version}</span>
          </div>
          {onViewChangelog && (
            <button 
              onClick={onViewChangelog}
              className="text-amber-500 text-sm hover:text-amber-400 transition-colors"
            >
              Changelog
            </button>
          )}
        </div>
        
        {buildDate && (
          <div className="mt-2 text-xs text-neutral-400">
            Build date: {buildDate}
          </div>
        )}
      </div>
      
      <div className="bg-neutral-800 rounded-lg p-3">
        <a 
          href="https://github.com/vedasjad/Mushflow" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors"
        >
          <GitBranchPlus size={16} />
          <span>View on GitHub</span>
        </a>
      </div>
    </div>
  );
};

export default VersionInfo; 