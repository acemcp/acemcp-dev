import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Service class for Session-related database operations.
 */
export const SessionService = {
  /**
   * Creates a new session.
   * @param data - Data for the new session, including userId and projectId.
   * @returns The newly created session.
   */
  async createSession(data: Prisma.SessionCreateInput) {
    return prisma.session.create({
      data,
    });
  },

  /**
   * Retrieves a session by its ID.
   * @param id - The ID of the session.
   * @returns The session object with related user, project, and conversations.
   */
  async getSessionById(id: string) {
    return prisma.session.findUnique({
      where: { id },
      include: {
        user: true,
        project: true,
        conversations: true,
      },
    });
  },

  /**
   * Updates a session, for example, to set the end time.
   * @param id - The ID of the session to update.
   * @param data - The data to update.
   * @returns The updated session.
   */
  async updateSession(id: string, data: Prisma.SessionUpdateInput) {
    return prisma.session.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes a session.
   * @param id - The ID of the session to delete.
   * @returns The deleted session object.
   */
  async deleteSession(id: string) {
    return prisma.session.delete({
      where: { id },
    });
  },
};
