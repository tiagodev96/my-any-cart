# 🛒 My Any Cart

**My Any Cart** is a personal project designed to make tracking and managing your shopping easy, fast, and organized.
Built with **Next.js** for the frontend, it allows you to **add, edit, and remove products**, set quantities and prices, and see the **total cost** in real time — before you even get to the checkout.

This repository contains the **frontend application**. The backend (in development) will be powered by **Django REST Framework** with **PostgreSQL**.

---

## ✨ Features

### ✅ Already implemented
- **Next.js** frontend with responsive and clean UI
- Local storage for persistent cart data
- Real-time price calculation as items are added or updated
- Edit and delete products easily

### 🚧 Upcoming features
- **Django REST API** backend integration
- **PostgreSQL** database for reliable and scalable storage
- Secure **user authentication**
- **Purchase history** with date tracking
- **Excel export** of purchase history
- **Smart purchase identification** and categorization
- **Dashboard** with:
  - Price analysis per product (price history tracking)
  - Consumption analysis to understand shopping habits

---

## 📂 Project Structure

```
├── 📁 .git/ 🚫 (auto-hidden)
├── 📁 .next/ 🚫 (auto-hidden)
├── 📁 node_modules/ 🚫 (auto-hidden)
├── 📁 public/
│   ├── 🖼️ file.svg
│   ├── 🖼️ globe.svg
│   ├── 🖼️ next.svg
│   ├── 🖼️ vercel.svg
│   └── 🖼️ window.svg
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 [locale]/
│   │   │   ├── 🖼️ favicon.ico
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 🎨 globals.css
│   │   └── 📄 layout.tsx
│   ├── 📁 components/
│   │   ├── 📁 container/
│   │   │   └── 📄 index.tsx
│   │   ├── 📁 locale-switcher-fab/
│   │   │   └── 📄 index.tsx
│   │   ├── 📁 products/
│   │   │   ├── 📄 columns.tsx
│   │   │   ├── 📄 currency.ts
│   │   │   ├── 📄 product-actions-cell.tsx
│   │   │   ├── 📄 product-dialog-form.tsx
│   │   │   ├── 📄 products-table.tsx
│   │   │   ├── 📄 products-toolbar.tsx
│   │   │   └── 📄 types.ts
│   │   └── 📁 ui/
│   │       ├── 📄 button.tsx
│   │       ├── 📄 dialog.tsx
│   │       ├── 📄 dropdown-menu.tsx
│   │       ├── 📄 input.tsx
│   │       ├── 📄 label.tsx
│   │       └── 📄 table.tsx
│   ├── 📁 hooks/
│   │   └── 📄 useUserTheme.tsx
│   ├── 📁 i18n/
│   │   ├── 📄 navigation.ts
│   │   ├── 📄 request.ts
│   │   └── 📄 routing.ts
│   ├── 📁 lib/
│   │   └── 📄 utils.ts
│   ├── 📁 messages/
│   │   ├── 📄 en.json
│   │   ├── 📄 es.json
│   │   ├── 📄 fr.json
│   │   └── 📄 pt.json
│   ├── 📁 types/
│   │   └── 📄 tanstack.d.ts
│   ├── 📁 views/
│   │   └── 📁 cart/
│   │       └── 📄 index.tsx
│   └── 📄 middleware.ts
├── 🚫 .gitignore
├── 📖 README.md
├── 📄 components.json
├── 📄 eslint.config.mjs
├── 📄 next-env.d.ts 🚫 (auto-hidden)
├── 📄 next.config.ts
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 postcss.config.mjs
└── 📄 tsconfig.json
```

---

---

## 🚀 Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/tiagodev96/my-any-cart.git
cd my-any-cart
npm install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open http://localhost:3000 in your browser to see it running.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend (soon):** Django REST Framework
- **Database (soon):** PostgreSQL

---

## 📌 Roadmap

- [ ] Django REST API integration
- [ ] Database setup (PostgreSQL)
- [ ] Authentication & authorization
- [ ] Purchase history
- [ ] Excel export
- [ ] Dashboard with analytics

---

## 🤝 Contributing

I’m open to **ideas and suggestions**! Feel free to open an issue or submit a pull request.
I’ll be posting updates for every new feature — follow the project to stay updated.

---

## 📎 Links

- **GitHub Repository:** https://github.com/tiagodev96/my-any-cart
- **Follow updates on LinkedIn:** (coming soon)
