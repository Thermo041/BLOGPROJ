require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Blog = require('./models/Blog');

const samples = [
  {
    title: 'Why I stopped chasing the perfect tech stack',
    description: 'A reflection on building things that ship instead of endlessly comparing frameworks.',
    category: 'Career',
    tags: ['mindset', 'productivity'],
    cover: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80'
  },
  {
    title: 'Understanding closures without the jargon',
    description: 'Closures are not magic. Here is the mental model that finally made them click for me.',
    category: 'Programming',
    tags: ['javascript', 'fundamentals'],
    cover: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1600&q=80'
  },
  {
    title: 'Building a habit of writing every week',
    description: 'Small notes on staying consistent when motivation runs dry.',
    category: 'Technology',
    tags: ['writing', 'habits'],
    cover: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&q=80'
  }
];

const body =
  'There is a quiet kind of progress that happens when you stop optimising and start shipping. ' +
  'For a long time I treated every project as a chance to try the newest thing. The result was a ' +
  'graveyard of half finished repos. What changed was boring: I picked tools I already knew and ' +
  'gave myself a deadline. Constraints turned out to be the feature, not the bug.\n\n' +
  'If you take one thing away, let it be this: the stack you can reason about at 2am beats the one ' +
  'that looks good in a conference talk. Ship the thing. Learn from real users. Iterate.';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Blog.deleteMany({});

  const adminPass = await bcrypt.hash('admin123', 12);
  const userPass = await bcrypt.hash('user123', 12);

  const admin = await User.create({
    username: 'admin',
    email: 'admin@blogsphere.dev',
    password: adminPass,
    role: 'admin',
    bio: 'Keeping BlogSphere tidy.'
  });
  const author = await User.create({
    username: 'devesh',
    email: 'devesh@blogsphere.dev',
    password: userPass,
    bio: 'Writing about code, habits and the messy middle.'
  });

  for (const s of samples) {
    const blog = new Blog({
      title: s.title,
      description: s.description,
      content: body,
      category: s.category,
      tags: s.tags,
      coverImage: s.cover,
      status: 'published',
      author: author._id,
      views: Math.floor(Math.random() * 2000)
    });
    await blog.save();
  }

  console.log('Seeded. admin@blogsphere.dev / admin123  |  devesh@blogsphere.dev / user123');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
