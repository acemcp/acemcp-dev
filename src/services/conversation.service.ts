import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Service class for Conversation-related database operations.
 */
export const ConversationService = {
  /**
   * Creates a new conversation message.
   * @param data - Data for the new conversation, including sessionId.
   * @returns The newly created conversation message.
   */
  async createConversation(data: Prisma.ConversationCreateInput) {
    return prisma.conversation.create({
      data,
    });
  },

  /**
   * Retrieves all conversations for a specific session.
   * @param sessionId - The ID of the session.
   * @returns A list of conversations for the session, ordered by timestamp.
   */
  async getConversationsBySession(sessionId: string) {
    return prisma.conversation.findMany({
      where: { sessionId },
      orderBy: {
        timestamp: 'asc',
      },
    });
  },

  /**
   * Updates a conversation message.
   * @param id - The ID of the conversation to update.
   * @param data - The data to update.
   * @returns The updated conversation message.
   */
  async updateConversation(id: string, data: Prisma.ConversationUpdateInput) {
    return prisma.conversation.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes a conversation message.
   * @param id - The ID of the conversation message to delete.
   * @returns The deleted conversation object.
   */
  async deleteConversation(id: string) {
    return prisma.conversation.delete({
      where: { id },
    });
  },
};