// ADD THIS FILE TO: src/routes/communities.js
// Then import in your main server file: app.register(communityRoutes, { prefix: '/api/communities' })

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function communityRoutes(fastify) {
  // GET all public communities
  fastify.get('/', async (request, reply) => {
    try {
      const communities = await prisma.community.findMany({
        where: { isPublic: true },
        include: {
          creator: {
            select: { id: true, displayName: true, username: true, avatar: true },
          },
          members: true,
          roles: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return reply.send({ success: true, data: communities });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch communities' });
    }
  });

  // GET user's communities
  fastify.get('/my-communities', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const communities = await prisma.community.findMany({
        where: {
          members: {
            some: {
              userId: request.user.id,
            },
          },
        },
        include: {
          creator: true,
          members: true,
          roles: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({ success: true, data: communities });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch communities' });
    }
  });

  // GET single community
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const community = await prisma.community.findUnique({
        where: { id },
        include: {
          creator: true,
          members: { include: { user: true } },
          roles: true,
          channels: true,
        },
      });

      if (!community) {
        return reply.code(404).send({ error: 'Community not found' });
      }

      return reply.send({ success: true, data: community });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch community' });
    }
  });

  // CREATE community
  fastify.post('/', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { name, description, isPublic = true } = request.body;

      if (!name) {
        return reply.code(400).send({ error: 'Community name is required' });
      }

      const community = await prisma.community.create({
        data: {
          name,
          description,
          isPublic,
          createdBy: request.user.id,
          members: {
            create: {
              userId: request.user.id,
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
        include: { creator: true, members: true, roles: true },
      });

      return reply.code(201).send({ success: true, data: community });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create community' });
    }
  });

  // UPDATE community
  fastify.patch('/:id', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params;
      const { name, description, isPublic } = request.body;

      // Check if user is creator
      const community = await prisma.community.findUnique({
        where: { id },
        select: { createdBy: true },
      });

      if (community?.createdBy !== request.user.id) {
        return reply.code(403).send({ error: 'Only creator can update community' });
      }

      const updated = await prisma.community.update({
        where: { id },
        data: { name, description, isPublic },
        include: { creator: true, members: true, roles: true },
      });

      return reply.send({ success: true, data: updated });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update community' });
    }
  });

  // DELETE community
  fastify.delete('/:id', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params;

      const community = await prisma.community.findUnique({
        where: { id },
        select: { createdBy: true },
      });

      if (community?.createdBy !== request.user.id) {
        return reply.code(403).send({ error: 'Only creator can delete community' });
      }

      await prisma.community.delete({ where: { id } });

      return reply.send({ success: true, message: 'Community deleted' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete community' });
    }
  });

  // JOIN community
  fastify.post('/:id/join', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params;

      const member = await prisma.communityMember.create({
        data: {
          communityId: id,
          userId: request.user.id,
        },
        include: { user: true },
      });

      return reply.code(201).send({ success: true, data: member });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to join community' });
    }
  });

  // LEAVE community
  fastify.delete('/:id/leave', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params;

      await prisma.communityMember.delete({
        where: { communityId_userId: { communityId: id, userId: request.user.id } },
      });

      return reply.send({ success: true, message: 'Left community' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to leave community' });
    }
  });

  // GET community invite link
  fastify.post('/:id/invite', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params;

      const community = await prisma.community.findUnique({
        where: { id },
        select: { createdBy: true, inviteCode: true },
      });

      if (community?.createdBy !== request.user.id) {
        return reply.code(403).send({ error: 'Only creator can generate invites' });
      }

      const inviteCode = Math.random().toString(36).substring(7);

      const updated = await prisma.community.update({
        where: { id },
        data: { inviteCode },
      });

      return reply.send({ 
        success: true, 
        data: { 
          inviteCode: updated.inviteCode,
          link: `https://yourapp.com/join/${updated.inviteCode}`
        } 
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to generate invite' });
    }
  });

  // JOIN with invite code
  fastify.post('/join/:inviteCode', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { inviteCode } = request.params;

      const community = await prisma.community.findUnique({
        where: { inviteCode },
      });

      if (!community) {
        return reply.code(404).send({ error: 'Invalid invite code' });
      }

      const member = await prisma.communityMember.create({
        data: {
          communityId: community.id,
          userId: request.user.id,
        },
        include: { user: true },
      });

      return reply.code(201).send({ success: true, data: member });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to join community' });
    }
  });
}
