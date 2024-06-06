import type { ProjectData } from '@ty/Types.ts';
import type React from 'react';

interface Props {
  project: ProjectData;
}

const Project: React.FC<Props> = (props) => {
  return <p>Hello, I'm {props.project.project.title}</p>;
};

export default Project;
