import type React from 'react';

interface Props {
  slug: string;
}

const Project: React.FC<Props> = (props) => {
  return <p>Hello, I'm {props.slug}</p>;
};

export default Project;
