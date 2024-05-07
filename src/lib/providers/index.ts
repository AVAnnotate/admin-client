import * as GitHub from '../GitHub/index.ts';
import type { ProviderUser } from '@ty/Types.ts';

export interface ProviderFunctions {
  getUsers(repo: string, token: string): ProviderUser[];
}

export const providers = () => {
  if ((import.meta.env.PROVIDER = 'GITHUB')) {
    return {
      getUsers: GitHub.getCollaborators,
    };
  } else {
    return null;
  }
};
