import type { AudiovisualFile, Translations } from '@ty/Types.ts';
import Player from './Player.tsx';
import * as Separator from '@radix-ui/react-separator';

interface Props {
  avFile: AudiovisualFile;
  i18n: Translations;
  title: string;
}

const TabContent: React.FC<Props> = (props) => {
  return (
    <div className='event-detail-tab-content'>
      <div className='container'>
        <h2>{props.title}</h2>
        <Player type={'Audio'} i18n={props.i18n} url={props.avFile.file_url} />
        <Separator.Root className='SeparatorRoot' decorative />
        <p>hello</p>
      </div>
    </div>
  );
};

export default TabContent;
