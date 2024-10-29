import { DoubleSwitchInput } from '@components/Formic/index.tsx';
import type { Translations } from '@ty/Types.ts';

interface MediaPlayerFieldProps {
  i18n: Translations;
}

export const MediaPlayerField: React.FC<MediaPlayerFieldProps> = (props) => (
  <DoubleSwitchInput
    label={props.i18n.t['Media Player']}
    name='media_player'
    optionLeft={{
      value: 'avannotate',
      label: props.i18n.t['AV Annotate Viewer'],
    }}
    optionRight={{ value: 'aviary', label: props.i18n.t['Aviary Player'] }}
    required
  />
);
