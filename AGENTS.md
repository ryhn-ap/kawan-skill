# Rules for Kawan Skill Development

Always refer to [CONTEXT.md](file:///home/reyhan/Projects/kawan-skill-app/CONTEXT.md) in the workspace root directory before generating code. Follow the Vanilla HTML + Tailwind + Supabase JS SDK architecture strictly.

## Key Architecture Guidelines
- **Frontend**: Vanilla HTML5, Tailwind CSS, and Vanilla JavaScript.
- **No Complex Frameworks**: Do NOT use Next.js, React, Vue, or complex SPA routers. Use standalone `.html` files for pages (e.g. `index.html`, `katalog.html`, `profil.html`).
- **Scripts**: Keep JavaScript organized in separate files inside the `js/` directory.
- **Backend/DB/Auth**: Supabase Free Tier via Supabase JavaScript SDK client-side.
- **Design System**: Dark Theme (`#0B1517` background), Teal (`#2DB7AD`) for Tukar Skill, Orange (`#FF8F2E`) for Minta Tolong.
