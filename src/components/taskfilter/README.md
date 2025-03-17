# Task Filter Component

A flexible and user-friendly filter component for tasks in the Mushflow application.

## Features

- **Label Filtering**: Filter tasks by one or more labels
- **Priority Filtering**: Filter tasks by priority levels (high, medium, low)
- **Sorting Options**: Sort tasks by due date, creation date, or priority
- **Sort Direction**: Toggle between ascending and descending order
- **Visual Indicators**: Shows active filters with count badges
- **Responsive Design**: Works well on all screen sizes

## Usage

```tsx
import TaskFilter from '@/components/taskfilter/TaskFilter';
import { Task } from '@/types/Task';

// In your component
const [tasks, setTasks] = useState<Task[]>(initialTasks);
const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);

const handleFilterChange = (filteredResults: Task[]) => {
  setFilteredTasks(filteredResults);
};

// In your JSX
<TaskFilter 
  tasks={tasks} 
  onFilterChange={handleFilterChange} 
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `tasks` | `Task[]` | Array of tasks to be filtered |
| `onFilterChange` | `(filteredTasks: Task[]) => void` | Callback function that receives the filtered tasks |

## Filter Options

### Labels
- Select from predefined labels
- Multiple labels can be selected (OR logic)
- Visual indicators show which labels are active

### Priority
- Filter by High, Medium, or Low priority
- Multiple priorities can be selected (OR logic)
- Color-coded for easy identification

### Sorting
- Due Date: Sort by task due date
- Date Created: Sort by task creation date
- Priority: Sort by task priority level
- Toggle between ascending and descending order

## Design

The component follows the Mushflow design system with:
- Dark theme color scheme
- Consistent spacing and typography
- Dropdown menus for filter options
- Clear visual feedback for active filters
- Smooth transitions and animations

## Implementation Details

- Uses React hooks for state management
- Implements click-outside detection for menus
- Efficiently filters and sorts tasks
- Updates parent component only when filters change 