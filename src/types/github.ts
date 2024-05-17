import type { FromSchema } from 'json-schema-to-ts';

import CollaboratorsSchema from 'src/schemas/github/Collaborators.ts';
import FullRepositorySchema from 'src/schemas/github/FullRespository.ts';
import RepositoryInvitationSchema from 'src/schemas/github/RepositoryInvitation.ts';

export type FullRepository = FromSchema<typeof FullRepositorySchema>;
export type Collaborators = FromSchema<typeof CollaboratorsSchema>;
export type RepositoryInvitation = FromSchema<
  typeof RepositoryInvitationSchema
>;
