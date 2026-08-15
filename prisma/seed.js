// ADD THIS FILE TO: prisma/seed.js
// Run with: npx prisma db seed

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (WARNING: This deletes everything!)
  // Uncomment only if you want to reset database completely
  // await prisma.$executeRawUnsafe('TRUNCATE TABLE public."User" CASCADE');

  // ============================================
  // CREATE TEST USERS
  // ============================================
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      username: 'sarahchen',
      displayName: 'Sarah Chen',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahchen',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'marcus@example.com' },
    update: {},
    create: {
      email: 'marcus@example.com',
      username: 'mjohnson',
      displayName: 'Marcus Johnson',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mjohnson',
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'emma@example.com' },
    update: {},
    create: {
      email: 'emma@example.com',
      username: 'emmaw',
      displayName: 'Emma Wilson',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emmaw',
    },
  });

  console.log('✅ Created 4 test users');

  // ============================================
  // CREATE GROUP CHATS
  // ============================================
  const group1 = await prisma.group.create({
    data: {
      name: 'Web Dev Team',
      description: 'Frontend and backend development discussions',
      createdBy: user1.id,
      members: {
        createMany: {
          data: [
            { userId: user1.id, role: 'admin' },
            { userId: user2.id, role: 'member' },
            { userId: user3.id, role: 'moderator' },
          ],
        },
      },
    },
  });

  const group2 = await prisma.group.create({
    data: {
      name: 'Design Team',
      description: 'UI/UX design collaboration',
      createdBy: user2.id,
      members: {
        createMany: {
          data: [
            { userId: user2.id, role: 'admin' },
            { userId: user1.id, role: 'member' },
            { userId: user4.id, role: 'member' },
          ],
        },
      },
    },
  });

  console.log('✅ Created 2 group chats');

  // ============================================
  // CREATE COMMUNITIES
  // ============================================
  const community1 = await prisma.community.create({
    data: {
      name: 'Web Development',
      description: 'Modern web technologies and best practices',
      isPublic: true,
      createdBy: user1.id,
      inviteCode: 'webdev123',
      members: {
        createMany: {
          data: [
            { userId: user1.id },
            { userId: user2.id },
            { userId: user3.id },
            { userId: user4.id },
          ],
        },
      },
      roles: {
        createMany: {
          data: [
            { name: 'admin', permissions: ['manage', 'moderate', 'post'] },
            { name: 'moderator', permissions: ['moderate', 'post'] },
            { name: 'member', permissions: ['post'] },
            { name: 'viewer', permissions: [] },
          ],
        },
      },
      channels: {
        createMany: {
          data: [
            { name: 'announcements', description: 'Important updates' },
            { name: 'general', description: 'General discussion' },
            { name: 'help', description: 'Ask for help' },
          ],
        },
      },
    },
  });

  const community2 = await prisma.community.create({
    data: {
      name: 'Design Systems',
      description: 'UI/UX and component libraries',
      isPublic: true,
      createdBy: user2.id,
      inviteCode: 'design456',
      members: {
        createMany: {
          data: [
            { userId: user2.id },
            { userId: user1.id },
            { userId: user4.id },
          ],
        },
      },
      roles: {
        createMany: {
          data: [
            { name: 'admin', permissions: ['manage', 'moderate', 'post'] },
            { name: 'moderator', permissions: ['moderate', 'post'] },
            { name: 'member', permissions: ['post'] },
            { name: 'viewer', permissions: [] },
          ],
        },
      },
    },
  });

  const community3 = await prisma.community.create({
    data: {
      name: 'JavaScript Tips',
      description: 'JavaScript, TypeScript, and Node.js',
      isPublic: true,
      createdBy: user3.id,
      inviteCode: 'jstips789',
      members: {
        createMany: {
          data: [
            { userId: user3.id },
            { userId: user1.id },
            { userId: user2.id },
          ],
        },
      },
      roles: {
        createMany: {
          data: [
            { name: 'admin', permissions: ['manage', 'moderate', 'post'] },
            { name: 'moderator', permissions: ['moderate', 'post'] },
            { name: 'member', permissions: ['post'] },
            { name: 'viewer', permissions: [] },
          ],
        },
      },
    },
  });

  console.log('✅ Created 3 communities');

  // ============================================
  // CREATE MESSAGES
  // ============================================
  const messages = await prisma.message.createMany({
    data: [
      {
        content: 'Hey everyone! Welcome to the Web Dev Team group 🚀',
        senderId: user1.id,
        groupId: group1.id,
      },
      {
        content: 'Thanks for creating this! Looking forward to collaborating',
        senderId: user2.id,
        groupId: group1.id,
      },
      {
        content: 'Let\'s discuss the new React features in our next meeting',
        senderId: user3.id,
        groupId: group1.id,
      },
      {
        content: 'Welcome to the Design Team! Let\'s create something amazing together 🎨',
        senderId: user2.id,
        groupId: group2.id,
      },
      {
        content: 'I\'m excited to see what we build!',
        senderId: user4.id,
        groupId: group2.id,
      },
    ],
  });

  console.log('✅ Created messages');

  // ============================================
  // CREATE REACTIONS
  // ============================================
  const allMessages = await prisma.message.findMany({
    take: 3,
  });

  for (const msg of allMessages) {
    await prisma.reaction.create({
      data: {
        messageId: msg.id,
        userId: user2.id,
        emoji: '👍',
      },
    });

    await prisma.reaction.create({
      data: {
        messageId: msg.id,
        userId: user3.id,
        emoji: '❤️',
      },
    });
  }

  console.log('✅ Created reactions');

  // ============================================
  // CREATE POSTS (for communities)
  // ============================================
  await prisma.post.createMany({
    data: [
      {
        content: 'Just launched our new design system! Check it out 🎉',
        authorId: user1.id,
        communityId: community1.id,
      },
      {
        content: 'Tips for optimizing React performance with useCallback',
        authorId: user2.id,
        communityId: community3.id,
      },
      {
        content: 'New Tailwind CSS features are amazing! Who\'s using them?',
        authorId: user3.id,
        communityId: community1.id,
      },
    ],
  });

  console.log('✅ Created posts');

  // ============================================
  // CREATE FOLLOW RELATIONSHIPS
  // ============================================
  await prisma.follow.createMany({
    data: [
      { followerId: user1.id, followingId: user2.id },
      { followerId: user1.id, followingId: user3.id },
      { followerId: user2.id, followingId: user1.id },
      { followerId: user3.id, followingId: user1.id },
      { followerId: user4.id, followingId: user1.id },
    ],
  });

  console.log('✅ Created follow relationships');

  console.log('✨ Seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email: test@example.com');
  console.log('Password: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email: sarah@example.com');
  console.log('Password: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
