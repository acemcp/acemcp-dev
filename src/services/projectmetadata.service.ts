import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Service class for ProjectMetadata-related database operations.
 * This handles the one-to-one agent configuration for a project.
 */
export const ProjectMetadataService = {
  /**
   * Creates or updates the metadata for a project.
   * A project has only one metadata record, so we use upsert.
   * @param projectId - The ID of the project this metadata belongs to.
   * @param data - The metadata to create or update (identity, instructions, tone).
   * @returns The created or updated project metadata.
   */
  async upsertProjectMetadata(
    projectId: string,
    data: { identity?: string; instructions?: string; tone?: string }
  ) {
    return prisma.projectMetadata.upsert({
      where: { id: projectId },
      update: data,
      create: {
        id: projectId, // The ID must match the project's ID
        ...data,
      },
    });
  },

  /**
   * Retrieves the metadata for a specific project.
   * @param projectId - The ID of the project.
   * @returns The metadata object or null if not found.
   */
  async getProjectMetadata(projectId: string) {
    return prisma.projectMetadata.findUnique({
      where: { id: projectId },
    });
  },
};
