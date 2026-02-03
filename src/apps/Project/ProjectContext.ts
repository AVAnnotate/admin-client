import { createContext, type Dispatch, type SetStateAction } from 'react';
import type { ProjectData } from '@ty/Types.ts';

interface ProjectContentInterface {
  project: ProjectData | null;
  setProject: Dispatch<SetStateAction<ProjectData | null>>;
}

export const ProjectContext = createContext<ProjectContentInterface>({
  project: null,
  setProject: () => {},
});
