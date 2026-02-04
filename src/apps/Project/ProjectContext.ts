import { createContext, type Dispatch, type SetStateAction } from 'react';
import type { ProjectData } from '@ty/Types.ts';

interface ProjectContentInterface {
  project: ProjectData;
  setProject: Dispatch<SetStateAction<ProjectData>>;
}

const initialState = {
  project: null,
  setProject: () => {},
} as unknown as ProjectContentInterface;

export const ProjectContext =
  createContext<ProjectContentInterface>(initialState);
