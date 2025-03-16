"use client";

import React from 'react';
import { Info, ExternalLink, GitBranchPlus } from 'lucide-react';

interface AboutSectionProps {
  appName?: string;
  description?: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ 
  appName = 'Mushflow', 
  description = 'A collaborative music listening and study platform that brings people together through shared experiences.'
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-neutral-400 flex items-center gap-2">
        <Info size={16} />
        About {appName}
      </h4>
      
      <div className="bg-neutral-800 rounded-lg p-4">
        <p className="text-white text-sm mb-4">{description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">Created by</span>
            <span className="text-white">Vedas</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400">License</span>
            <span className="text-white">MIT</span>
          </div>
          
          <a 
            href="https://github.com/vedasjad/Mushflow" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm mt-4 text-amber-500 hover:text-amber-400 transition-colors"
          >
            <GitBranchPlus size={16} />
            <span>View on GitHub</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutSection; 