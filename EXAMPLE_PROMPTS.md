# 📝 CodeGenesis - Example Prompts & Usage Guide

This guide provides example prompts to help you get started with CodeGenesis and understand how to create effective prompts for code generation.

---

## 🎯 Quick Start Example

### Example 1: Create a Landing Page

**Prompt:**
```
Create a modern landing page for a SaaS product called "TaskMaster" - a productivity app.

Requirements:
1. Hero section with:
   - Catchy headline: "Master Your Tasks, Master Your Life"
   - Subheading about boosting productivity
   - CTA buttons: "Start Free Trial" and "Watch Demo"
   - Hero image/illustration

2. Features section with 3 key features:
   - Smart Task Organization
   - AI-Powered Prioritization
   - Team Collaboration

3. Pricing section with 3 tiers:
   - Free (Basic features)
   - Pro ($9/month)
   - Enterprise (Custom pricing)

4. Newsletter signup form in footer

Tech Stack:
- React with TypeScript
- TailwindCSS for styling
- Framer Motion for animations
- Responsive design (mobile-first)

Design Style:
- Modern, clean, professional
- Color scheme: Blue and white
- Glassmorphism effects
- Smooth animations
```

**Expected Output:**
- `src/App.tsx` - Main application component
- `src/components/Hero.tsx` - Hero section
- `src/components/Features.tsx` - Features section
- `src/components/Pricing.tsx` - Pricing cards
- `src/components/Footer.tsx` - Footer with newsletter
- `src/styles/globals.css` - Global styles
- `package.json` - Dependencies
- `README.md` - Setup instructions

---

## 🏗️ Full-Stack Application Examples

### Example 2: E-Commerce Store

**Prompt:**
```
Build a complete e-commerce store for selling handmade crafts.

Frontend Requirements:
1. Product listing page with filters (category, price range)
2. Product detail page with image gallery
3. Shopping cart with add/remove functionality
4. Checkout page with form validation
5. User authentication (login/signup)

Backend Requirements:
1. REST API with Express.js
2. MongoDB database with Mongoose
3. Endpoints:
   - GET /api/products - List all products
   - GET /api/products/:id - Get product details
   - POST /api/cart - Add to cart
   - POST /api/orders - Create order
   - POST /api/auth/register - User registration
   - POST /api/auth/login - User login

Database Schema:
- Users (email, password, name)
- Products (name, description, price, category, images, stock)
- Orders (userId, products, total, status, createdAt)

Tech Stack:
- Frontend: React, TypeScript, TailwindCSS, React Router
- Backend: Node.js, Express, MongoDB, JWT authentication
- State Management: Context API or Zustand

Additional Features:
- Image upload for products
- Search functionality
- Responsive design
- Loading states and error handling
```

---

### Example 3: Blog Platform

**Prompt:**
```
Create a modern blog platform with CMS capabilities.

Features:
1. Public Blog:
   - Homepage with latest posts
   - Post detail page with comments
   - Category/tag filtering
   - Search functionality
   - Author profiles

2. Admin Dashboard:
   - Create/edit/delete posts
   - Rich text editor (Markdown support)
   - Image upload
   - Analytics dashboard
   - User management

3. Authentication:
   - User registration/login
   - Role-based access (admin, author, reader)
   - Protected routes

Tech Stack:
- Frontend: Next.js 14, TypeScript, TailwindCSS
- Backend: Next.js API routes
- Database: PostgreSQL with Prisma ORM
- Authentication: NextAuth.js
- Rich Text: TipTap or React Quill
- Deployment: Vercel

Database Models:
- User (id, email, name, role, avatar)
- Post (id, title, content, authorId, published, createdAt)
- Comment (id, content, postId, userId, createdAt)
- Category (id, name, slug)

Design:
- Clean, minimalist design
- Dark mode support
- Smooth page transitions
- SEO optimized
```

---

## 🎨 UI Component Examples

### Example 4: Dashboard Components

**Prompt:**
```
Create a set of reusable dashboard components for an analytics platform.

Components Needed:
1. StatCard - Display key metrics
   - Props: title, value, change (percentage), icon
   - Variants: success, warning, danger, info

2. ChartCard - Wrapper for charts
   - Props: title, subtitle, children
   - Actions: download, fullscreen, refresh

3. DataTable - Sortable, filterable table
   - Props: columns, data, pagination
   - Features: sorting, filtering, row selection

4. Sidebar - Navigation sidebar
   - Props: items (with icons and labels)
   - Features: collapsible, active state

5. TopBar - Header with user menu
   - Features: notifications, user dropdown, search

Tech Stack:
- React with TypeScript
- TailwindCSS
- Headless UI for accessibility
- Recharts for charts
- Lucide React for icons

Design System:
- Color palette: Primary (blue), Success (green), Warning (yellow), Danger (red)
- Typography: Inter font family
- Spacing: 4px base unit
- Border radius: 8px default
- Shadows: Subtle elevation
```

---

## 🔧 Utility & Tool Examples

### Example 5: CLI Tool

**Prompt:**
```
Build a CLI tool for managing development environments.

Features:
1. Project scaffolding:
   - Create new projects from templates
   - Support for React, Vue, Node.js
   - Interactive prompts for configuration

2. Environment management:
   - Switch between dev/staging/prod
   - Manage environment variables
   - Validate .env files

3. Database operations:
   - Run migrations
   - Seed database
   - Backup/restore

4. Deployment helpers:
   - Build and deploy commands
   - Health checks
   - Rollback functionality

Tech Stack:
- Node.js with TypeScript
- Commander.js for CLI
- Inquirer.js for prompts
- Chalk for colored output
- Ora for spinners

Commands Structure:
- devtool init [template] - Create new project
- devtool env [environment] - Switch environment
- devtool db migrate - Run migrations
- devtool deploy [target] - Deploy application

Include:
- Comprehensive help messages
- Error handling
- Progress indicators
- Configuration file support (.devtoolrc)
```

---

## 🤖 AI Integration Examples

### Example 6: AI Chat Application

**Prompt:**
```
Create a ChatGPT-like interface with conversation management.

Features:
1. Chat Interface:
   - Message list with user/AI messages
   - Input field with send button
   - Typing indicator
   - Markdown rendering for AI responses
   - Code syntax highlighting

2. Conversation Management:
   - Create new conversations
   - List all conversations in sidebar
   - Delete conversations
   - Search conversations

3. Settings:
   - Model selection (GPT-4, GPT-3.5, Claude, etc.)
   - Temperature control
   - Max tokens setting
   - System prompt customization

4. Features:
   - Copy message to clipboard
   - Regenerate response
   - Edit and resend message
   - Export conversation

Tech Stack:
- Frontend: React, TypeScript, TailwindCSS
- Backend: Next.js API routes
- AI: OpenAI API or OpenRouter
- Database: Supabase (conversations, messages)
- Markdown: react-markdown
- Code Highlighting: prism-react-renderer

Database Schema:
- Conversations (id, userId, title, createdAt)
- Messages (id, conversationId, role, content, createdAt)
- Settings (userId, model, temperature, maxTokens)

Design:
- Similar to ChatGPT interface
- Dark mode by default
- Smooth animations
- Responsive layout
```

---

## 💡 Best Practices for Prompts

### 1. Be Specific
❌ Bad: "Create a website"
✅ Good: "Create a portfolio website with hero section, projects gallery, and contact form using React and TailwindCSS"

### 2. Include Tech Stack
Always specify:
- Frontend framework (React, Vue, Next.js)
- Styling solution (TailwindCSS, CSS Modules, Styled Components)
- Backend (if needed): Node.js, Python, etc.
- Database (if needed): PostgreSQL, MongoDB, etc.

### 3. Define Features Clearly
Use numbered lists:
```
Features:
1. User authentication with email/password
2. Dashboard with analytics charts
3. CRUD operations for products
4. Search and filter functionality
```

### 4. Specify Design Requirements
Include:
- Color scheme
- Design style (modern, minimalist, glassmorphism)
- Responsive requirements
- Animations/transitions

### 5. Provide Context
Explain the purpose:
```
"Create a task management app for remote teams that need to collaborate on projects..."
```

---

## 🎓 Progressive Complexity Examples

### Beginner: Simple Component
```
Create a reusable Button component in React with TypeScript.

Props:
- variant: 'primary' | 'secondary' | 'danger'
- size: 'sm' | 'md' | 'lg'
- onClick: function
- children: React.ReactNode

Styling: Use TailwindCSS
Include hover and active states
```

### Intermediate: Feature Module
```
Create a user authentication module with:
1. Login form with email/password
2. Registration form with validation
3. Password reset flow
4. Protected route component

Use React, TypeScript, React Hook Form, and Zod for validation
```

### Advanced: Full Application
```
Build a complete project management platform similar to Jira with:
- Kanban board with drag-and-drop
- Sprint planning
- User stories and tasks
- Team collaboration
- Real-time updates
- Analytics dashboard

Full-stack with Next.js, PostgreSQL, Prisma, WebSockets
```

---

## 🚀 Testing Your Prompts

1. **Start Simple**: Begin with a basic component or page
2. **Iterate**: Refine the generated code with follow-up prompts
3. **Add Features**: Gradually add complexity
4. **Review Code**: Always review and test generated code
5. **Customize**: Modify the code to fit your specific needs

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Need Help?** Check the main README.md or create an issue on GitHub.
