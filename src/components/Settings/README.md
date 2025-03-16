# Settings Components

This directory contains modular components for the settings functionality in the Mushflow application.

## Components

### SettingsButton

A button component that triggers the settings popup when clicked. This is typically placed in the header or navigation bar.

```tsx
import { SettingsButton } from '@/components/Settings';

// Usage
<SettingsButton />
```

### SettingsPopup

The main settings popup component that displays user profile information, logout option, version info, contact support, and about section.

```tsx
import { SettingsPopup } from '@/components/Settings';

// Usage
const [isOpen, setIsOpen] = useState(false);
<SettingsPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
```

### UserProfile

Displays the user's profile information and allows for editing the display name and about section.

```tsx
import { UserProfile } from '@/components/Settings';

// Usage
<UserProfile onUpdate={(data) => console.log('Profile updated:', data)} />
```

### ContactForm

A form component for users to contact support with issues or feedback.

```tsx
import { ContactForm } from '@/components/Settings';

// Usage
const [isOpen, setIsOpen] = useState(false);
<ContactForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
```

### VersionInfo

Displays the application version and build information.

```tsx
import { VersionInfo } from '@/components/Settings';

// Usage
<VersionInfo 
  version="1.0.0" 
  buildDate="2023-06-01" 
  onViewChangelog={() => console.log('View changelog')} 
/>
```

### AboutSection

Displays information about the application, including creator and license details.

```tsx
import { AboutSection } from '@/components/Settings';

// Usage
<AboutSection 
  appName="Mushflow" 
  description="A collaborative music listening and study platform." 
/>
```

## Integration

These components are designed to be modular and can be used independently or together. The typical integration pattern is to use the `SettingsButton` in your header or navigation, which then opens the `SettingsPopup` when clicked.

## Styling

All components use Tailwind CSS for styling and are designed with a dark theme to match the overall application aesthetic. The components are responsive and will adapt to different screen sizes. 