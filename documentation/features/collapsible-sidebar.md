# Collapsible Sidebar Feature

## Overview
The sidebar now supports a collapsible mode that reduces the width from 256px (w-64) to 64px (w-16) when collapsed, showing only icons for navigation items.

## Features

### Collapsed State
- **Width**: Reduces from 256px to 64px
- **Content**: Shows only icons, hides text labels
- **Logo**: Shows abbreviated "VP" instead of full "VP Product Onboarding"
- **Tooltips**: Enhanced custom tooltips show full names and descriptions on hover

### Enhanced Tooltips
- **Navigation Items**: Show full navigation names when hovering over icons
- **Toggle Button**: Shows "Expand sidebar (Ctrl+B)" when collapsed
- **Footer**: Shows full company name when hovering over abbreviated "VP"
- **Styling**: Dark background with white text, smooth fade-in animation
- **Positioning**: Appears to the right of icons with arrow pointer

### Toggle Controls
- **Toggle Button**: Chevron icon in the header that toggles between states
- **Keyboard Shortcut**: `Ctrl+B` (Windows/Linux) or `Cmd+B` (Mac) to toggle
- **Visual Feedback**: Hover effects and smooth transitions

### State Persistence
- **Local Storage**: User's preference is saved and restored on page refresh
- **Default State**: Sidebar starts expanded by default

## Implementation Details

### Components Modified
- `src/components/layout/Sidebar.tsx` - Added collapsible functionality and custom tooltips
- `src/components/layout/Layout.tsx` - Added state management and keyboard shortcuts

### Custom Tooltip Component
- **Visibility**: Only shows when sidebar is collapsed (except footer tooltip)
- **Positioning**: Appears to the right of elements with proper spacing
- **Animation**: Smooth opacity transition (200ms duration)
- **Styling**: Dark theme with rounded corners and arrow pointer
- **Accessibility**: High contrast and clear typography

### Key Features
- Smooth CSS transitions (300ms duration)
- Responsive layout adjustments
- Icon-only navigation with enhanced tooltips
- Persistent state across sessions
- Keyboard accessibility
- Professional tooltip design

### CSS Classes Used
- `transition-all duration-300 ease-in-out` - Smooth animations
- `w-64` / `w-16` - Width transitions
- `justify-center` - Icon centering when collapsed
- `hover:scale-105` - Button hover effects
- `opacity-0 group-hover:opacity-100` - Tooltip fade-in effect

## Usage

### Toggle Methods
1. **Click the chevron button** in the sidebar header
2. **Use keyboard shortcut** `Ctrl+B` or `Cmd+B`
3. **State persists** across browser sessions

### Visual States
- **Expanded**: Full width with text labels and logo
- **Collapsed**: Narrow width with icons only and abbreviated logo

### Tooltip Interaction
- **Hover over icons** to see full navigation names
- **Hover over toggle button** to see expand instruction
- **Hover over footer** to see full company name
- **Smooth animations** for better user experience

## Accessibility
- Enhanced tooltips show full navigation names when collapsed
- Keyboard shortcut support
- Smooth transitions for better UX
- Maintains all navigation functionality in both states
- High contrast tooltips for better readability
- Professional tooltip design with arrow pointers
