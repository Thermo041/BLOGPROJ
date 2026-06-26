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

userSchema.virtual('avatar').get(function () {
  if (this.profilePic) return this.profilePic;
  const seed = encodeURIComponent(this.username || 'user');
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&radius=50&backgroundType=gradientLinear&fontWeight=600`;
});

module.exports = mongoose.model('User', userSchema);
