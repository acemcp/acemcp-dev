import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Service class for AnalyticEvent-related database operations.
 */
export const AnalyticEventService = {
  /**
   * Creates a new analytic event. This is often a "fire-and-forget" operation.
   * @param data - Data for the new analytic event.
   * @returns The newly created event.
   */
  async createAnalyticEvent(data: Prisma.AnalyticEventCreateInput) {
    return prisma.analyticEvent.create({
      data,
    });
  },

  /**
   * Retrieves all analytic events for a specific user.
   * @param userId - The ID of the user.
   * @returns A list of events for the user.
   */
  async getAnalyticEventsByUser(userId: string) {
    return prisma.analyticEvent.findMany({
      where: { userId },
      orderBy: {
        timestamp: 'desc',
      },
    });
  },
};
