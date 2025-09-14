# Mini-Trello Screenshots

This directory contains screenshots demonstrating all major features of the Mini-Trello Kanban application.

## Application Screenshots

### 1. Authentication
- **01_login.png** - Login page with email/password form validation
- **02_register.png** - Registration page for new users

### 2. Dashboard
- **03_dashboard.png** - User dashboard showing all boards
- **04_create_board.png** - Create new board modal

### 3. Kanban Board
- **05_kanban_board.png** - Main Kanban board view with lists and cards
- **06_board_header.png** - Board header with title, description, and members
- **07_add_list.png** - Adding a new list to the board
- **08_add_card.png** - Creating a new card in a list

### 4. Drag & Drop
- **09_drag_card.png** - Card being dragged between lists
- **10_reorder_lists.png** - Reordering lists on the board
- **11_card_positioning.png** - Cards maintaining position after drag

### 5. Card Details
- **12_card_modal.png** - Card details modal with all features
- **13_card_assignees.png** - Assigning users to a card
- **14_card_labels.png** - Adding and managing card labels
- **15_card_due_date.png** - Setting due dates for cards
- **16_card_checklist.png** - Card checklist functionality

### 6. Comments & Activity
- **17_card_comments.png** - Comments section in card modal
- **18_activity_feed.png** - Board activity feed sidebar
- **19_real_time_comments.png** - Real-time comment updates

### 7. Search & Filters
- **20_search_cards.png** - Search functionality across board
- **21_filter_by_assignee.png** - Filtering cards by assignee
- **22_filter_by_label.png** - Filtering cards by labels
- **23_filter_by_due_date.png** - Filtering cards by due date

### 8. Real-time Collaboration
- **24_real_time_sync.png** - Two browser windows showing real-time synchronization
- **25_user_presence.png** - User presence indicators on board
- **26_simultaneous_editing.png** - Multiple users editing simultaneously

### 9. Responsive Design
- **27_mobile_login.png** - Mobile login page
- **28_mobile_dashboard.png** - Mobile dashboard view
- **29_mobile_kanban.png** - Mobile Kanban board (responsive)
- **30_tablet_view.png** - Tablet responsive layout

### 10. Settings & Management
- **31_board_settings.png** - Board settings and configuration
- **32_member_management.png** - Adding and managing board members
- **33_workspace_settings.png** - Workspace management
- **34_user_profile.png** - User profile and preferences

## How to Take Screenshots

### For Manual Testing:
1. Start the application:
   ```bash
   # Backend
   cd backend && npm start
   
   # Frontend (new terminal)
   cd frontend && npm run dev
   ```

2. Open browser and navigate to `http://localhost:3000`

3. Use the seeded data to login:
   - Email: `john@example.com`
   - Password: `Password123`

4. Test all features and capture screenshots

### For Automated Screenshots:
You can use tools like Playwright or Cypress to automate screenshot capture:

```javascript
// Example with Playwright
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  // Login
  await page.fill('[data-testid="email"]', 'john@example.com');
  await page.fill('[data-testid="password"]', 'Password123');
  await page.click('[data-testid="login-button"]');
  
  // Take dashboard screenshot
  await page.screenshot({ path: 'screenshots/03_dashboard.png' });
  
  await browser.close();
})();
```

## Screenshot Guidelines

### Quality Standards:
- Resolution: 1920x1080 minimum
- Format: PNG for UI screenshots
- Quality: High quality, no compression artifacts
- Content: Show realistic data, not Lorem Ipsum

### What to Include:
- ✅ Realistic user data
- ✅ Multiple cards and lists
- ✅ User interactions in progress
- ✅ Loading states where applicable
- ✅ Error states for edge cases
- ✅ Different screen sizes (desktop, tablet, mobile)

### What to Avoid:
- ❌ Empty boards with no content
- ❌ Debug information visible
- ❌ Browser developer tools open
- ❌ Personal or sensitive information
- ❌ Blurry or low-quality images

## Real-time Testing Screenshots

For real-time collaboration screenshots:

1. Open two browser windows/tabs
2. Login with different users:
   - Window 1: `john@example.com` / `Password123`
   - Window 2: `jane@example.com` / `Password123`
3. Both users join the same board
4. Demonstrate real-time features:
   - Move cards in one window, show update in other
   - Add comments and show immediate sync
   - Show user presence indicators

## Browser Testing

Capture screenshots in different browsers:
- Chrome (latest)
- Firefox (latest) 
- Safari (latest)
- Edge (latest)

And different devices:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

## Notes

- Screenshots should demonstrate the application working correctly
- Include both light and dark themes if implemented
- Show the application with realistic data
- Capture loading states and transitions
- Document any specific setup required for certain screenshots