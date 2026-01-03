---
trigger: always_on
---

.windsurfrules

## Tech Stack

- Use Next.js 16 only
- Use TypeScript only (.ts, .tsx)
- JavaScript files (.js, .jsx) are not allowed

## Folder Structure

- Primary application folder must be:
  /[company]/[country]/
- All routes, layouts, components, and logic must follow this structure
- Do not create parallel root-level app structures

## Styling Rules

- Use Tailwind CSS only
- Use utility classes and Tailwind-based components
- No custom CSS or SCSS files
- No CSS Modules
- No inline style tags

## Code & Changes

- Do not break existing functionality
- All new changes must be backward-compatible
- Avoid refactoring unrelated code unless explicitly required

## Explanation Requirement

- Every code change must include a clear explanation:
  - What was changed
  - Why it was needed
  - How it works (brief and simple)

## General Rules

- Follow Next.js 16 best practices
- Keep components reusable and readable
- Use proper TypeScript types (avoid `any`)
- Keep code simple and consistent
- Do not introduce unnecessary dependencies
