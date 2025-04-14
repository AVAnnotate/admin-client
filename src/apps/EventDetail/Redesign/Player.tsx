// react-player requires a weird workaround to keep TS from complaining
import { default as _ReactPlayer } from 'react-player';
import type { ReactPlayerProps } from 'react-player/types/lib';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SetStateAction,
} from 'react';
import './Player.css';
import { Button } from '@radix-ui/themes';
import {
  PauseFill,
  PlayFill,
  VolumeMuteFill,
  VolumeUpFill,
} from 'react-bootstrap-icons';
import { CopyIcon } from '@radix-ui/react-icons';
import * as Slider from '@radix-ui/react-slider';
import type { Translations } from '@ty/Types.ts';
import * as Tooltip from '@radix-ui/react-tooltip';
import { formatTimestamp } from '@lib/events/index.ts';

interface Props {
  type: 'Audio' | 'Video';
  i18n: Translations;
  url: string;
  offline?: boolean;

  // optional props for controlling the
  // player from a parent component
  playing?: boolean;
  position?: number;
}

const ReactPlayer = _ReactPlayer as unknown as React.FC<ReactPlayerProps>;

const Player: React.FC<Props> = (props) => {
  // total length of recording, in seconds
  const [duration, setDuration] = useState(0);

  const [muted, setMuted] = useState(false);

  // seconds played so far
  const [position, setPosition] = useState(0);

  const [playing, setPlaying] = useState(false);

  // store the player itself in state instead of a ref
  // because there's something weird in their packaging
  // that breaks ref-based calls
  const [player, setPlayer] = useState<any>(null);

  // whether the user is currently seeking
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    // we need to use typeof here instead of a null
    // check because 0 is falsy!
    if (player && typeof props.position === 'number') {
      player.seekTo(props.position);
    }
  }, [props.position]);

  useEffect(() => {
    if (props.playing) {
      setPlaying(props.playing);
    }
  }, [props.playing]);

  const { t } = props.i18n;

  const formattedPosition = useMemo(
    () => formatTimestamp(position, false),
    [position]
  );

  const formattedDuration = useMemo(
    () => formatTimestamp(duration, false),
    [duration]
  );

  const onSeek = useCallback(
    (val: number[]) => {
      setSeeking(false);
      if (player) {
        player.seekTo(val[0] * duration);
      }
    },
    [player, setSeeking]
  );

  const handleCopy = useCallback((val: string) => {
    navigator.clipboard.writeText(val);
  }, []);

  return (
    <div className='player'>
      {props.offline ? (
        <div className='offline'>{t['No media is available.']}</div>
      ) : (
        <ReactPlayer
          controls={props.type === 'Video'}
          playing={playing}
          played={position / duration || 0}
          muted={muted}
          onDuration={(dur: SetStateAction<number>) => setDuration(dur)}
          onProgress={(data: any) => {
            // don't move the point if the user is currently dragging it
            if (!seeking) {
              setPosition(data.playedSeconds);
            }
          }}
          onReady={(player: any) => setPlayer(player)}
          progressInterval={50}
          url={props.url}
          width={props.type === 'Video' ? '100%' : 0}
          height={props.type === 'Video' ? '100%' : 0}
        />
      )}
      {props.type === 'Audio' && !props.offline && (
        <div className='player-control-panel'>
          <div className='content'>
            <Button
              className='audio-button unstyled'
              onClick={() => setPlaying(!playing)}
            >
              {playing ? (
                <PauseFill color='black' />
              ) : (
                <PlayFill color='black' />
              )}
            </Button>
            <div className='position-label'>
              <span className='timestamp position'>{formattedPosition}</span>
              <span>/</span>
              <span className='timestamp duration'>{formattedDuration}</span>
            </div>
            <div className='seek-bar'>
              <Slider.Root
                className='seek-bar-slider'
                defaultValue={[0]}
                min={0}
                max={0.999999999}
                onValueChange={(val) => {
                  setSeeking(true);
                  setPosition(val[0] * duration);
                }}
                onValueCommit={onSeek}
                step={0.0001}
                value={[position / duration]}
              >
                <Slider.Track className='seek-bar-slider-track'>
                  <Slider.Range className='seek-bar-slider-range' />
                </Slider.Track>
                <Slider.Thumb className='seek-bar-slider-thumb' />
              </Slider.Root>
            </div>
            <div>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Button
                      className='unstyled copy-button'
                      onClick={() => handleCopy(formattedPosition)}
                    >
                      <CopyIcon />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content className='tooltip-content' side='bottom'>
                    {t['Copy timestamp']}
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
            <Button
              className='audio-button unstyled'
              onClick={() => setMuted(!muted)}
            >
              {muted ? (
                <VolumeMuteFill color='black' />
              ) : (
                <VolumeUpFill color='black' />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
