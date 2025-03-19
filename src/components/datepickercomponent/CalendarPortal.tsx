import React, { useEffect } from 'react';

const CalendarPortal: React.FC = () => {
  useEffect(() => {
    // Create portal container if it doesn't exist
    if (!document.getElementById('calendar-portal')) {
      const portalDiv = document.createElement('div');
      portalDiv.id = 'calendar-portal';
      portalDiv.style.position = 'fixed';
      portalDiv.style.top = '0';
      portalDiv.style.left = '0';
      portalDiv.style.width = '100%';
      portalDiv.style.height = '0';
      portalDiv.style.zIndex = '9999';
      portalDiv.style.pointerEvents = 'none';
      document.body.appendChild(portalDiv);
    }
    
    // Clean up on unmount
    return () => {
      const portal = document.getElementById('calendar-portal');
      if (portal && portal.childNodes.length === 0) {
        document.body.removeChild(portal);
      }
    };
  }, []);
  
  return null;
};

export default CalendarPortal; 