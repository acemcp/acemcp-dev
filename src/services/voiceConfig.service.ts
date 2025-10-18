import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Service class for VoiceConfig-related database operations.
 */
export const VoiceConfigService = {
  /**
   * Creates a new Voice configuration.
   * @param data - The data for the new Voice config.
   * @returns The newly created config.
   */
  async createVoiceConfig(data: Prisma.VoiceConfigCreateInput) {
    return prisma.voiceConfig.create({
      data,
    });
  },

  /**
   * Retrieves all Voice configurations for a specific user.
   * @param userId - The ID of the user.
   * @returns A list of Voice configs for the user.
   */
  async getVoiceConfigsByUser(userId: string) {
    return prisma.voiceConfig.findMany({
      where: { userId },
    });
  },

  /**
   * Updates a Voice configuration.
   * @param id - The ID of the config to update.
   * @param data - The data to update.
   * @returns The updated config.
   */
  async updateVoiceConfig(id: string, data: Prisma.VoiceConfigUpdateInput) {
    return prisma.voiceConfig.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes a Voice configuration.
   * @param id - The ID of the config to delete.
   * @returns The deleted config.
   */
  async deleteVoiceConfig(id: string) {
    return prisma.voiceConfig.delete({
      where: { id },
    });
  },
};
