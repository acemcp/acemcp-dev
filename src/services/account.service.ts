import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Service class for Account-related database operations.
 * These are typically used for OAuth and linking external accounts.
 */
export const AccountService = {
  /**
   * Creates a new account link for a user.
   * @param data - The data for the new account link.
   * @returns The newly created account link.
   */
  async createAccount(data: Prisma.AccountCreateInput) {
    return prisma.account.create({
      data,
    });
  },

  /**
   * Retrieves an account by its provider and providerAccountId.
   * @param provider - The OAuth provider (e.g., 'google').
   * @param providerAccountId - The user's ID from that provider.
   * @returns The account object or null if not found.
   */
  async getAccountByProvider(provider: string, providerAccountId: string) {
    return prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    });
  },

  /**
   * Retrieves all accounts linked to a specific user.
   * @param userId - The ID of the user.
   * @returns A list of linked accounts.
   */
  async getAccountsByUser(userId: string) {
    return prisma.account.findMany({
      where: { userId },
    });
  },

  /**
   * Deletes an account link.
   * @param id - The ID of the account link to delete.
   * @returns The deleted account object.
   */
  async deleteAccount(id: string) {
    return prisma.account.delete({
      where: { id },
    });
  },
};
