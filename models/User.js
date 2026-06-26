const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    bio: { type: String, default: '' },
    profilePic: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isBanned: { type: Boolean, default: false }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const AVATAR_COLORS = [
  ['#6366f1', '#8b5cf6'],
  ['#ec4899', '#f43f5e'],
  ['#f59e0b', '#ef4444'],
  ['#10b981', '#06b6d4'],
  ['#3b82f6', '#6366f1'],
  ['#14b8a6', '#22c55e'],
  ['#f97316', '#eab308'],
  ['#a855f7', '#d946ef']
];

userSchema.virtual('avatar').get(function () {
  if (this.profilePic) return this.profilePic;
  const name = (this.username || 'User').trim();
  const parts = name.split(/\s+/);
  const initials = (parts.length > 1
    ? parts[0][0] + parts[parts.length - 1][0]
    : name.slice(0, 2)
  ).toUpperCase();
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const [c1, c2] = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  const id = 'g' + Math.abs(hash);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="128" height="128" fill="url(#${id})"/><text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="54" font-weight="600" fill="#ffffff">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
});

module.exports = mongoose.model('User', userSchema);
