import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Service class for MCPConfig-related database operations.
 */
export const McpConfigService = {
  /**
   * Creates a new MCP configuration.
   * @param data - The data for the new MCP config.
   * @returns The newly created config.
   */
  async createMcpConfig(data: Prisma.MCPConfigCreateInput) {
    return prisma.mCPConfig.create({
      data,
    });
  },

  /**
   * Retrieves all MCP configurations for a specific user.
   * @param userId - The ID of the user.
   * @returns A list of MCP configs for the user.
   */
  async getMcpConfigsByUser(userId: string) {
    return prisma.mCPConfig.findMany({
      where: { userId },
    });
  },

  /**
   * Updates an MCP configuration.
   * @param id - The ID of the config to update.
   * @param data - The data to update.
   * @returns The updated config.
   */
  async updateMcpConfig(id: string, data: Prisma.MCPConfigUpdateInput) {
    return prisma.mCPConfig.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes an MCP configuration.
   * @param id - The ID of the config to delete.
   * @returns The deleted config.
   */
  async deleteMcpConfig(id: string) {
    return prisma.mCPConfig.delete({
      where: { id },
    });
  },
};
	
