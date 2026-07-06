export type RepoVisibility = 'private' | 'public' | 'internal';

export const getEnterpriseGitHubOrgs = (): string[] => {
  const enterpriseOrgs =
    import.meta.env.PUBLIC_GITHUB_ENTERPRISE_ORGS ||
    import.meta.env.GITHUB_ENTERPRISE_ORGS ||
    '';

  return enterpriseOrgs
    .split(',')
    .map((org: string) => org.trim().toLowerCase())
    .filter(Boolean);
};

export const isEnterpriseGitHubOrg = (org: string): boolean =>
  getEnterpriseGitHubOrgs().includes(org.trim().toLowerCase());

export const getTemplateOwnerForDestinationOrg = (org: string): string => {
  if (isEnterpriseGitHubOrg(org) && import.meta.env.GIT_REPO_ORG_ENTERPRISE) {
    return import.meta.env.GIT_REPO_ORG_ENTERPRISE;
  }

  return import.meta.env.GIT_REPO_ORG;
};
