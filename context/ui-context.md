# UI Context

## Theme

System-preference driven light/dark mode. Light mode uses white backgrounds with dark text; dark mode uses near-black backgrounds with light text. The design language is clean and technical — adequate whitespace, bordered card surfaces, and subtle accent colors for interactive elements.

## Colors

Defined as CSS custom properties in `globals.css`. All components use these tokens — no hardcoded hex values.

| Role            | CSS Variable       | Light      | Dark       |
| --------------- | ------------------ | ---------- | ---------- |
| Page background | `--background`     | `#ffffff`  | `#0a0a0a`  |
| Foreground      | `--foreground`     | `#171717`  | `#ededed`  |

Additional tokens should be added as needed using `@theme inline` in Tailwind.

## Typography

| Role      | Font              | Variable            |
| --------- | ----------------- | ------------------- |
| UI text   | Geist Sans        | `--font-geist-sans` |
| Code/mono | Geist Mono        | `--font-geist-mono` |

## Border Radius

| Context           | Class             |
| ----------------- | ----------------- |
| Inline / small UI | `rounded-md`      |
| Cards / panels    | `rounded-lg`      |
| Modals / overlays | `rounded-xl`      |

## Component Library

Custom Tailwind CSS components. No third-party UI library is currently installed. Components live in `frontend/components/`. Plan to adopt Radix UI primitives for complex interactive elements (dropdowns, dialogs, etc.) as needed.

## Layout Patterns

- **Dashboard**: Full-viewport layout with a top navbar, collapsible sidebar, and main content area
- **Sidebar**: Fixed width with bottom-border separator, navigation links grouped by role
- **Kanban Board**: Horizontal scrollable columns for To Do / In Progress / Done with task cards
- **Modals**: Centered overlay with backdrop for create/edit forms
- **Tables**: Bordered rows with hover states for user/project listing

## Icons

Lucide React (planned install). Stroke-based icons only. Sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons.
