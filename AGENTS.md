# Agent Guidelines for o2o Repository

This file provides guidance to agentic coding agents operating in this repository.

## Development Commands

### Package Manager
This project uses pnpm as the package manager.

### Scripts
- `pnpm install` - Install dependencies
- `pnpm dev` - Run development server
- `pnpm build` - Build for production
- `pnpm check` - Type check (runs build + tsc)
- `pnpm lint` - Run ESLint
- `pnpm deploy` - Deploy to Cloudflare Workers
- `pnpm preview` - Preview production build locally
- `pnpm cf-typegen` - Generate Cloudflare types

### Database Commands
- `pnpm db:generate` - Generate Drizzle ORM migrations
- `pnpm db:migrate:local` - Apply migrations to local D1 database
- `pnpm db:migrate:prod` - Apply migrations to production D1 database
- `pnpm db:studio` - Open Drizzle Studio

### Testing
There are no explicit test scripts defined. To run tests:
- Create test files with `.test.ts` or `.test.tsx` extension
- Use a test runner like Vitest or Jest (would need to be added to devDependencies)
- For UI tests, consider using Playwright (refer to playwright-cli skill)

## Code Style Guidelines

### Imports
1. **Order**: Group imports in this order:
   - Next.js/react imports
   - Third-party library imports
   - Internal imports (using @/* alias)
   - Type-only imports (when needed)

2. **Path Aliases**: Use `@/*` for internal imports, which maps to `./src/*`
   ```typescript
   // Good
   import { cn } from '@/lib/utils'
   import { ThemeProvider } from '@/contexts/theme-provider'
   
   // Avoid
   import { cn } from '../../lib/utils'
   ```

3. **Client Components**: Mark client components with `'use client';` at the very top

### Formatting
1. **Indentation**: Use 2 spaces for indentation
2. **Line Length**: Prefer lines under 100 characters
3. **Semicolons**: Use semicolons to terminate statements
4. **Quotes**: Use single quotes for strings, except when containing single quotes
5. **Trailing Commas**: Use trailing commas in multi-line arrays and objects

### TypeScript
1. **Strict Mode**: The project uses TypeScript in strict mode
2. **Type Definitions**: Prefer interfaces over types for object shapes
3. **Generic Components**: Use explicit generic types when needed
4. **Avoid any**: Minimize use of `any` type; use `unknown` instead when type is uncertain
5. **Nullable Types**: Use explicit null checks rather than non-null assertion operator (!) when possible

### Naming Conventions
1. **Components**: Use PascalCase for component names (e.g., `ThemeToggle`)
2. **Functions and Variables**: Use camelCase (e.g., `useTheme`, `setTheme`)
3. **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_ATTEMPTS`)
4. **Files**: Use kebab-case for file names (e.g., `theme-toggle.tsx`)
5. **Acronyms**: Treat acronyms as normal words (e.g., `XMLHttpRequest` becomes `XmlHttpRequest`)

### CSS/Tailwind
1. **Utility Classes**: Use Tailwind utility classes for styling
2. **Class Order**: Follow a logical order: positioning, box model, typography, visual, misc
3. **Custom Classes**: Use `@apply` sparingly in CSS files for complex utility combinations
4. **Variants**: Use variant classes like `hover:`, `focus:`, `dark:` appropriately
5. **CSS Files**: Keep global styles in `src/app/globals.css`

### Error Handling
1. **Async Functions**: Use try/catch for async operations
2. **Form Validation**: Validate user input and provide clear error messages
3. **API Errors**: Handle API error responses gracefully
4. **Console Errors**: Avoid console.log in production code; use proper logging if needed

### Specific Conventions Observed in Codebase
1. **Component Composition**: Prefer composition over inheritance
2. **Context Providers**: Wrap children with providers in layout (seen in RootLayout)
3. **Utility Functions**: Use `cn` function from `@/lib/utils` for class name merging
4. **Icons**: Use Lucide React icons imported individually
5. **Metadata**: Export metadata object from route segments for SEO
6. **Suppressed Warnings**: Use `suppressHydrationWarning` when necessary for SSr

## Architecture Notes

### Next.js App Router
- Uses `app/` directory structure
- Route segments defined by folder names
- Loading and error states handled by special files (`loading.tsx`, `error.tsx`)
- Server components by default, client components marked with `'use client'`

### Cloudflare Deployment
- Built with `@opennextjs/cloudflare`
- Uses Wrangler for deployment
- Environment variables managed through Wrangler secrets
- D1 database used for storage

### State Management
- Uses React Context for theme and i18n
- Uses Jotai for atomic state management (seen in imports)
- Authentication handled by Clerk

## Best Practices

### Performance
1. **Image Optimization**: Use Next.js Image component for automatic optimization
2. **Code Splitting**: Next.js handles this automatically with file-based routing
3. **Bundle Analysis**: Consider using `@next/bundle-analyzer` for production builds
4. **Prefetching**: Use `prefetch` attribute on links for navigation optimization

### Accessibility
1. **Semantic HTML**: Use appropriate HTML elements (button, nav, main, etc.)
2. **ARIA Labels**: Provide accessible labels for interactive elements
3. **Focus Management**: Ensure proper focus trapping in modals/dialogs
4. **Color Contrast**: Follow WCAG guidelines for text and background colors

### Security
1. **Environment Variables**: Never commit `.env` files; use `.env.example` as template
2. **Input Sanitization**: Validate and sanitize user input
3. **CSP Headers**: Consider implementing Content Security Policy headers
4. **Authentication**: Use established libraries like Clerk for auth

### Testing Strategy
While no tests currently exist, consider:
1. **Unit Tests**: Test utility functions and pure components
2. **Integration Tests**: Test API routes and database interactions
3. **E2E Tests**: Use Playwright for critical user journeys
4. **Test Coverage**: Aim for meaningful coverage rather than arbitrary percentages
