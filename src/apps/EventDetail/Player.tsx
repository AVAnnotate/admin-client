// react-player requires a weird workaround to keep TS from complaining
import { default as _ReactPlayer } from 'react-player';
import type { ReactPlayerProps } from 'react-player/types/lib';
import { useCallback, useMemo, useRef, useState } from 'react';
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
  i18n: Translations;
  url: string;
}

const ReactPlayer = _ReactPlayer as unknown as React.FC<ReactPlayerProps>;

export const Player: React.FC<Props> = (props) => {
  // total length of recording, in seconds
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  // percent of file played so far
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  // whether the user is currently seeking
  const [seeking, setSeeking] = useState(false);

  const { t } = props.i18n;

  const playerRef = useRef<React.FC<typeof ReactPlayer>>(null);

  const formattedPosition = useMemo(
    () => formatTimestamp(position * duration),
    [position]
  );

  const formattedDuration = useMemo(
    () => formatTimestamp(duration),
    [duration]
  );

  const onSeek = useCallback(
    (val: number[]) => {
      setSeeking(false);
      if (player) {
        player.seekTo(val[0]);
      }
    },
    [player, setSeeking]
  );

  const handleCopy = useCallback((val: string) => {
    navigator.clipboard.writeText(val);
  }, []);

  return (
    <div>
      {/* the player doesn't have any UI when playing audio files, so let's keep it 0x0 */}
      {/* when we add video support, we'll need to conditionally set the width/height */}
      <ReactPlayer
        playing={playing}
        ref={playerRef}
        played={position}
        muted={muted}
        onDuration={(dur) => setDuration(dur)}
        onProgress={(data) => {
          // don't move the point if the user is currently dragging it
          if (!seeking) {
            setPosition(data.played);
          }
        }}
        onReady={(player) => setPlayer(player)}
        progressInterval={50}
        url={props.url}
        width={0}
        height={0}
      />
      <div className='player-control-panel'>
        <div className='content'>
          <Button
            className='audio-button unstyled'
            onClick={() => setPlaying(!playing)}
          >
            {playing ? <PauseFill color='black' /> : <PlayFill color='black' />}
          </Button>
          <div className='position-label'>
            <span className='timestamp position'>{formattedPosition}</span>
            <span>&nbsp;/&nbsp;</span>
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
                setPosition(val[0]);
              }}
              onValueCommit={onSeek}
              step={0.0001}
              value={[position]}
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
    </div>
  );
};
