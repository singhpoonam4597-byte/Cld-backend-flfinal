// ADD THIS FILE TO: src/routes/groups.js
// Then import in your main server file: app.register(groupRoutes, { prefix: '/api/groups' })

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function groupRoutes(fastify) {
  // GET all groups for current user
  fastify.get('/', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const groups = await prisma.group.findMany({
        where: {
          members: {
            some: {
              userId: request.user.id,
            },
          },
        },
        include: {
          creator: {
            select: { id: true, displayName: true, username: true, avatar: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, displayName: true, username: true, avatar: true },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { content: true, createdAt: true, sender: { select: { displayName: true } } },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return reply.send({ success: true, data: groups });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch groups' });
    }
  });

  // GET single group
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const group = await prisma.group.findUnique({
        where: { id },
        include: {
          creator: {
            select: { id: true, displayName: true, username: true, avatar: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, displayName: true, username: true, avatar: true },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
              sender: {
                select: { id: true, displayName: true, username: true, avatar: true },
              },
              reactions: {
                include: { user: { select: { id: true, displayName: true } } },
              },
              replyTo: {
                include: { sender: { select: { displayName: true } } },
              },
            },
          },
        },
      });

      if (!group) {
        return reply.code(404).send({ error: 'Group not found' });
      }

      return reply.send({ success: true, data: group });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch group' });
    }
  });

  // CREATE group
  fastify.post('/', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { name, description } = request.body;

      if (!name) {
        return reply.code(400).send({ error: 'Group name is required' });
      }

      const group = await prisma.group.create({
        data: {
          name,
          description,
          createdBy: request.user.id,
          members: {
            create: {
              userId: request.user.id,
              role: 'admin',
            },
          },
        },
        include: {
          creator: true,
          members: { include: { user: true } },
        },
      });

      return reply.code(201).send({ success: true, data: group });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create group' });
    }
  });

  // UPDATE group
  fastify.patch('/:id', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params;
      const { name, description } = request.body;

      // Check if user is admin
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: id, userId: request.user.id } },
      });

      if (!member || member.role !== 'admin') {
        return reply.code(403).send({ error: 'Only admins can update group' });
      }

      const group = await prisma.group.update({
        where: { id },
        data: { name, description },
        include: { creator: true, members: { include: { user: true } } },
      });

      return reply.send({ success: true, data: group });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update group' });
    }
  });

  // DELETE group
  fastify.delete('/:id', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params;

      // Check if user is creator
      const group = await prisma.group.findUnique({
        where: { id },
        select: { createdBy: true },
      });

      if (group?.createdBy !== request.user.id) {
        return reply.code(403).send({ error: 'Only creator can delete group' });
      }

      await prisma.group.delete({ where: { id } });

      return reply.send({ success: true, message: 'Group deleted' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete group' });
    }
  });

  // ADD member to group
  fastify.post('/:id/members', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params;
      const { userId, role = 'member' } = request.body;

      // Check if user is admin
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: id, userId: request.user.id } },
      });

      if (!member || !['admin', 'moderator'].includes(member.role)) {
        return reply.code(403).send({ error: 'No permission to add members' });
      }

      const newMember = await prisma.groupMember.create({
        data: {
          groupId: id,
          userId,
          role,
        },
        include: { user: true },
      });

      return reply.code(201).send({ success: true, data: newMember });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to add member' });
    }
  });

  // REMOVE member from group
  fastify.delete('/:id/members/:userId', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id, userId } = request.params;

      // Check if user is admin
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: id, userId: request.user.id } },
      });

      if (!member || member.role !== 'admin') {
        return reply.code(403).send({ error: 'Only admins can remove members' });
      }

      await prisma.groupMember.delete({
        where: { groupId_userId: { groupId: id, userId } },
      });

      return reply.send({ success: true, message: 'Member removed' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to remove member' });
    }
  });

  // CHANGE member role
  fastify.patch('/:id/members/:userId', async (request, reply) => {
    try {
      if (!request.user?.id) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const { id, userId } = request.params;
      const { role } = request.body;

      // Check if user is admin
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: id, userId: request.user.id } },
      });

      if (!member || member.role !== 'admin') {
        return reply.code(403).send({ error: 'Only admins can change roles' });
      }

      const updatedMember = await prisma.groupMember.update({
        where: { groupId_userId: { groupId: id, userId } },
        data: { role },
        include: { user: true },
      });

      return reply.send({ success: true, data: updatedMember });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update member role' });
    }
  });
}
