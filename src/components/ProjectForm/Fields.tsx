import { TripleSwitchInput } from '@components/Formic/index.tsx';
import type { Translations } from '@ty/Types.ts';

interface MediaPlayerFieldProps {
  i18n: Translations;
}

export const MediaPlayerField: React.FC<MediaPlayerFieldProps> = (props) => (
  <TripleSwitchInput
    label={props.i18n.t['Media Player']}
    helperText={
      props.i18n.t[
        'Your project can be presented using either the Universal Viewer or the Aviary Player to present media. Annotation-centered projects like digital editions generally work better with Universal Viewer, while media-centered projects like exhibitions may benefit from the Aviary Player. You can change viewers at any time in your project settings.'
      ]
    }
    name='media_player'
    optionLeft={{
      value: 'avannotate',
      label: props.i18n.t['AV Annotate Viewer'],
    }}
    optionMiddle={{
      value: 'universal',
      label: props.i18n.t['Universal Viewer'],
    }}
    optionRight={{ value: 'aviary', label: props.i18n.t['Aviary Player'] }}
    required
  />
);
