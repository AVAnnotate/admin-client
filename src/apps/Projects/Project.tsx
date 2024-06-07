import type { ProjectData } from '@ty/Types.ts';
import type React from 'react';

interface Props {
  project: ProjectData;
}

const Project: React.FC<Props> = (props) => {
  return (
    <div>
      <p>Hello, I'm {props.project.project.title}</p>
      <p>I contain the following events:</p>
      <ul>
        {props.project.events.map((ev) => (
          <li key={ev}>{ev}</li>
        ))}
      </ul>
    </div>
  );
};

export default Project;
