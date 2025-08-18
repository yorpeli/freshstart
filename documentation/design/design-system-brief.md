# VP Product Onboarding App - Design System Brief

## **Brand Identity & Purpose**
**Application**: VP Product Onboarding Management Platform  
**User**: VP Product professionals navigating structured onboarding  
**Logo**: Blue rounded square with "VP" initials + "Onboarding" wordmark

## **Design System Foundation**

### **Color Palette**
**Primary Brand Colors:**
- Primary Blue: `#3b82f6` (primary-600) with full 50-900 scale
- Background: `#f9fafb` (gray-50)
- Card/Surface: `#ffffff` (white)

**Functional Color System:**
- **Workstream Identity Colors:**
  - Product: `#3b82f6` (Blue)
  - Process: `#10b981` (Green) 
  - People: `#f59e0b` (Amber)
  - Partnerships: `#ef4444` (Red)

- **Status/Feedback Colors:**
  - Success: `#10b981` (Green)
  - Warning: `#f59e0b` (Amber)
  - Error: `#ef4444` (Red)
  - Info: `#3b82f6` (Blue)

### **Typography**
- **Font Family**: Inter (Google Fonts)
- **Hierarchy**: 
  - Headings: 2xl-3xl, font-semibold/bold
  - Body: sm-base, font-medium/normal
  - Captions: xs-sm, text-gray-500

### **Layout Architecture**

**3-Panel Layout:**
1. **Fixed Sidebar** (256px width)
   - White background with gray border
   - Logo + 8 navigation items with icons
   - Active state: blue background + right border accent
   - Hover states with subtle gray background

2. **Fixed Header** (64px height)
   - Page title + subtitle
   - Search bar (264px width)
   - Notification bell with red dot indicator
   - User profile section

3. **Main Content Area**
   - Gray-50 background
   - Padding: 24px (p-6)
   - Scrollable content with white cards

### **Component Design Patterns**

**Card System:**
- White background with subtle shadow (`shadow-sm`)
- Gray border (`border-gray-200`)
- Rounded corners (`rounded-lg`)
- Configurable padding (sm/md/lg variants)
- Hover states with increased shadow

**Badge System:**
- 7 variants: default, primary, success, warning, error, info, outline
- 3 sizes: sm, md, lg
- Rounded-full design
- Color-coded for status communication

**Navigation Patterns:**
- Icons from Lucide React library
- Consistent 20px icon sizing
- Active state indicators
- Smooth transitions (200ms duration)

### **Content Organization**

**Grid Systems:**
- Responsive grids (1/2/4 columns based on screen size)
- Consistent 24px gaps (`gap-6`)
- Card-based information architecture

**Information Hierarchy:**
- **Dashboard**: 4-stat overview + 4-section insights
- **Phase Details**: 6-section comprehensive view
- **List Views**: Table/card hybrid layouts

### **Visual Language**

**Interaction Design:**
- Subtle hover states on all interactive elements
- Color transitions for state changes
- Loading states with skeleton screens
- Empty states with contextual icons and messaging

**Data Visualization:**
- Progress bars with gradient fills (blue-to-green)
- Color-coded priority indicators
- Percentage-based visual representations
- Timeline/milestone indicators

**Icon Strategy:**
- Lucide React icon library
- Contextual icons for each data type
- Consistent sizing (16-24px)
- Color-coded by function

### **Responsive Behavior**
- Mobile-first approach with Tailwind breakpoints
- Sidebar collapses on mobile
- Grid systems adapt: 4→2→1 columns
- Search bar maintains usability across devices

### **Professional SaaS Aesthetic**
- Clean, minimal design language
- Subtle shadows and borders
- Professional gray palette with strategic color accents
- High contrast for accessibility
- Consistent spacing scale (Tailwind's spacing system)

## **Single Phase View - Design Requirements**

### **Current Page Structure**
The Single Phase view displays comprehensive details about an individual onboarding phase in a **6-section card-based layout**:

**Grid Structure:**
- 2-column responsive grid (stacks on mobile)
- Full-width sections where appropriate
- Consistent spacing with `space-y-6`

**Section Breakdown:**

1. **Phase Metadata** (Left column)
   - Phase name as main heading (3xl font)
   - Week range badge
   - 4-column metadata grid: Phase number, date range, working days, last updated
   - Technical details: Phase ID, created date

2. **Progress Overview** (Right column)  
   - Learning vs Value percentage visual bar
   - Two highlighted stat boxes showing learning/value focus percentages
   - Color-coded: Blue for learning, Green for value

3. **Phase Details** (Full width)
   - Description in gray background box
   - Success criteria in green-accented box with left border
   - Optional constraints/notes in yellow-accented box

4. **Success Checkpoints** (Left column)
   - Categorized goals with emoji icons
   - 4 types: Decision (🎯), Knowledge (🧠), Deliverable (📋), Relationship (🤝)
   - Each goal displayed in blue-tinted cards

5. **Key Milestones** (Right column)
   - Timeline-based milestones with criticality indicators
   - Color-coded by priority (red/yellow/green)
   - Day badges and star icons for high-priority items
   - Description text for context

6. **Phase Outcomes** (Full width)
   - 2-column grid of outcome categories
   - Icons for each type (Team, Personal, Strategic, Quantitative, Stakeholder)
   - Green-themed cards matching outcome nature

### **Key Data Points**

**Most Important for Designer:**
- **Phase progress** (learning/value split) - primary KPI
- **Timeline information** (weeks, dates, working days)
- **Success checkpoints** by category - actionable goals
- **Key milestones** with priority levels - critical deadlines
- **Outcomes tracking** - results measurement

**Visual Hierarchy:**
- Phase name and week range are primary focus
- Progress visualization is prominently displayed
- Categorical organization of goals and milestones
- Color coding for priority/type differentiation

**Interaction Patterns:**
- Cards have hover states
- Navigation back to phases list
- Read-only view (no editing functionality)
- Responsive design for mobile/tablet

This page serves as a comprehensive "dashboard" for a single onboarding phase, balancing detailed information with visual clarity for VP Product users tracking their progress.

## **Key Design Principles**
1. **Clarity**: Information hierarchy guides user attention
2. **Consistency**: Repeated patterns create familiarity  
3. **Efficiency**: Dense information presentation without clutter
4. **Professional**: Enterprise-grade polish and reliability
5. **Contextual**: Color coding and iconography support comprehension

This design system supports a data-dense professional application while maintaining visual clarity and user-friendly navigation patterns.