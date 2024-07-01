import type { FormPage, Page } from '@ty/Types.ts';

const defaultPage: FormPage = {
  content: [],
  title: '',
};

interface Props {
  page?: Page;
}

export const PageForm: React.FC<Props> = (props) => {
  return <p>WIP</p>;
};
