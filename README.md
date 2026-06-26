# BlogSphere

A full-stack, multi-user blogging platform. Write, publish, like, comment, bookmark and moderate. Built with Node.js, Express, MongoDB and EJS with a hand-crafted Tailwind + DaisyUI interface.

## Features

- Email/password auth with Passport local strategy, bcrypt hashing and persistent sessions
- Role-based access (guest / author / admin)
- Blog publishing workflow with drafts, slugs, auto reading-time and view counter
- Cover image and avatar uploads via Cloudinary
- Likes, bookmarks, threaded comments
- Search, category filtering, sorting (latest / most liked / most viewed) and pagination
- Author profiles and account settings (bio, avatar, password)
- Admin dashboard: stats, user banning, blog and comment moderation
- Light (`paper`) and dark (`ink`) custom themes with a persistent toggle

## Tech stack

Node.js, Express, MongoDB Atlas, Mongoose, express-session, connect-mongo, Passport.js, bcryptjs, Multer, Cloudinary, EJS, express-ejs-layouts, Tailwind CSS, DaisyUI.

## Getting started

```bash
npm install
npm run seed         # optional: sample admin, author and posts
npm run dev
```

App runs on `http://localhost:3000`.

Seeded accounts (after `npm run seed`):

- Admin: `admin@blogsphere.dev` / `admin123`
- Author: `devesh@blogsphere.dev` / `user123`

## Environment variables

Defined in `.env`:

| Key | Description |
| --- | --- |
| `PORT` | Server port (default 3000) |
| `SESSION_SECRET` | Session signing secret |
| `MONGO_URI` | MongoDB Atlas connection string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Project structure

```
config/        db, passport and cloudinary setup
controllers/   auth, blog, comment, profile, admin logic
models/        User, Blog, Comment, Bookmark schemas
middlewares/   isAuthenticated, isAdmin guards
routes/        auth, blog, admin routers
views/         EJS templates (layouts, partials, pages)
public/        css and client-side js
app.js         entrypoint
seed.js        sample data seeder
```

## Deployment

Deploy the backend to Render (or any Node host), point `MONGO_URI` at MongoDB Atlas, and set the Cloudinary variables. Sessions are stored in MongoDB via connect-mongo so they survive restarts.
