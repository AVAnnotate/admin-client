import { type ProjectData, type Translations } from '@ty/Types.ts';
import { useCallback, useState } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import {
  ChevronRightIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from '@radix-ui/react-icons';
import { Transforms, type BaseEditor } from 'slate';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Button } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import './PageForm.css';
import { Check } from 'react-bootstrap-icons';
import { TimeInput } from '@components/Formic/index.tsx';

type InsertButtonModalTypes = 'single-event' | 'event-compare';

type ColumnLayout = [2, 4] | [3, 3] | [4, 2];

const insertColumns = (
  editor: BaseEditor & ReactEditor,
  newLayout: ColumnLayout
) => {
  const paragraph = { type: 'paragraph', children: [{ text: '' }] };

  const columns: any[] = [
    {
      type: 'grid',
      layout: newLayout,
      children: [
        {
          type: 'column',
          children: [paragraph],
        },
        {
          type: 'column',
          children: [paragraph],
        },
      ],
    },
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  Transforms.insertNodes(editor, columns);
};

const insertEvent = (
  editor: BaseEditor & ReactEditor,
  uuid: string,
  includes: string[],
  timeRange?: [number, number]
) => {
  const paragraph = { type: 'paragraph', children: [{ text: '' }] };

  const eventObj: any = {
    type: 'event',
    uuid,
    includes,
    children: [{ text: '' }],
  };

  if (timeRange) {
    eventObj['start'] = timeRange[0];
    eventObj['end'] = timeRange[1];
  }

  Transforms.insertNodes(editor, [eventObj, paragraph]);
};

interface ClipInterfaceProps {
  start?: number;
  end?: number;
  setStart: (arg: number) => void;
  setEnd: (arg: number) => void;
  i18n: Translations;
}

const ClipInterface: React.FC<ClipInterfaceProps> = (props) => {
  const { t } = props.i18n;

  return (
    <>
      <div className='include-clip-times'>
        <label>
          <TimeInput
            defaultValue={0}
            label={t['Start Time']}
            onChange={(val) => props.setStart(val)}
            required
          />
        </label>
        <label>
          <TimeInput
            defaultValue={0}
            label={t['End Time']}
            onChange={(val) => props.setEnd(val)}
            required
          />
        </label>
      </div>
    </>
  );
};

interface DurationInterfaceProps {
  duration: 'full' | 'clip';
  setDuration: (arg: 'full' | 'clip') => void;
  i18n: Translations;
}

const DurationInterface: React.FC<DurationInterfaceProps> = (props) => {
  const { t } = props.i18n;

  return (
    <>
      <p>{t['Duration']}</p>
      <div className='duration-buttons'>
        <Button
          className={props.duration === 'full' ? 'primary' : 'outline'}
          onClick={() => props.setDuration('full')}
          type='button'
        >
          {t['Full Recording']}
        </Button>
        <Button
          className={props.duration === 'clip' ? 'primary' : 'outline'}
          onClick={() => props.setDuration('clip')}
          type='button'
        >
          {t['Clip']}
        </Button>
      </div>
    </>
  );
};

interface IncludeInterfaceProps {
  include: string[];
  toggleInclude: (arg: string) => void;
  i18n: Translations;
}

const IncludeInterface: React.FC<IncludeInterfaceProps> = (props) => {
  const { t } = props.i18n;

  return (
    <>
      <p>{t['Include']}</p>
      <div className='include-buttons'>
        <Button
          className={props.include.includes('media') ? 'primary' : 'outline'}
          type='button'
          onClick={() => props.toggleInclude('media')}
        >
          {props.include.includes('media') && <Check color='white' />}
          {t['Media']}
        </Button>
        <Button
          className={
            props.include.includes('annotations') ? 'primary' : 'outline'
          }
          type='button'
          onClick={() => props.toggleInclude('annotations')}
        >
          {props.include.includes('annotations') && <Check color='white' />}
          {t['Annotations']}
        </Button>
        <Button
          className={props.include.includes('label') ? 'primary' : 'outline'}
          type='button'
          onClick={() => props.toggleInclude('label')}
        >
          {props.include.includes('label') && <Check color='white' />}
          {t['Label']}
        </Button>
        <Button
          className={
            props.include.includes('description') ? 'primary' : 'outline'
          }
          type='button'
          onClick={() => props.toggleInclude('description')}
        >
          {props.include.includes('description') && <Check color='white' />}
          {t['Description']}
        </Button>
      </div>
    </>
  );
};

interface InsertModalProps {
  i18n: Translations;
  clearModal: () => void;
  project: ProjectData;
  onSubmit: (
    uuid: string,
    includes: string[],
    timeRange?: [number, number]
  ) => void;
}

const SingleEventModal: React.FC<InsertModalProps> = (props) => {
  const [event, setEvent] = useState<string>(
    Object.keys(props.project.events).length > 0
      ? Object.keys(props.project.events)[0]
      : ''
  );
  const [duration, setDuration] = useState<'full' | 'clip'>('full');
  const [include, setInclude] = useState<string[]>([]);
  const [start, setStart] = useState<number | undefined>(undefined);
  const [end, setEnd] = useState<number | undefined>(undefined);

  const { t } = props.i18n;

  const toggleInclude = useCallback(
    (type: string) => {
      if (include.includes(type)) {
        setInclude(include.filter((i) => i !== type));
      } else {
        setInclude([...include, type]);
      }
    },
    [include]
  );

  return (
    <Dialog.Root open>
      <Dialog.Overlay className='slate-dialog-overlay' />
      <Dialog.Content className='slate-dialog-content'>
        <Dialog.Title>{t['Insert event']}</Dialog.Title>
        <div>
          {Object.keys(props.project.events).length === 0 ? (
            <p>{t['This project has no events.']}</p>
          ) : (
            <>
              <label>
                {t['Audiovisual event']}
                <select
                  className='formic-form-select'
                  onChange={(ev) => setEvent(ev.target.value)}
                  value={event}
                >
                  {Object.keys(props.project.events).map((uuid) => (
                    <option key={uuid} value={uuid}>
                      {props.project.events[uuid].label}
                    </option>
                  ))}
                </select>
              </label>
              <DurationInterface
                duration={duration}
                setDuration={setDuration}
                i18n={props.i18n}
              />
              {duration === 'clip' && (
                <ClipInterface
                  start={start}
                  end={end}
                  setStart={setStart}
                  setEnd={setEnd}
                  i18n={props.i18n}
                />
              )}
              <IncludeInterface
                include={include}
                toggleInclude={toggleInclude}
                i18n={props.i18n}
              />
            </>
          )}
        </div>
        <div className='slate-dialog-close-bar'>
          <Dialog.Close asChild>
            <Button
              className='outline'
              onClick={props.clearModal}
              role='button'
            >
              {t['cancel']}
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button
              className='primary'
              role='button'
              onClick={() =>
                start && end
                  ? props.onSubmit(event, include, [start, end])
                  : props.onSubmit(event, include)
              }
            >
              {t['Insert']}
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

const CompareEventsModal: React.FC<InsertModalProps> = (props) => {
  const [duration, setDuration] = useState<'full' | 'clip'>('full');

  const { t } = props.i18n;

  return (
    <Dialog.Root open>
      <Dialog.Overlay className='slate-dialog-overlay' />
      <Dialog.Content className='slate-dialog-content'>
        <Dialog.Title>{t['Event comparison']}</Dialog.Title>
        <DurationInterface
          duration={duration}
          setDuration={setDuration}
          i18n={props.i18n}
        />

        <div className='slate-dialog-close-bar'>
          <Dialog.Close asChild>
            <Button
              className='outline'
              onClick={props.clearModal}
              role='button'
            >
              {t['cancel']}
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button
              className='primary'
              role='button'
              onClick={() => console.log('todo')}
            >
              {t['Embed']}
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

interface InsertButtonProps {
  i18n: Translations;
  project: ProjectData;
}

export const InsertButton: React.FC<InsertButtonProps> = (props) => {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<InsertButtonModalTypes | null>(null);

  const editor = useSlate();

  const { t } = props.i18n;

  const clearModal = useCallback(() => setModal(null), []);

  const updateModal = useCallback((newModal: InsertButtonModalTypes) => {
    setModal(newModal);
    setOpen(false);
  }, []);

  const updateColumnLayout = useCallback((newLayout: ColumnLayout) => {
    insertColumns(editor, newLayout);
    setOpen(false);
  }, []);

  return (
    <>
      {modal === 'single-event' && (
        <SingleEventModal
          i18n={props.i18n}
          clearModal={clearModal}
          project={props.project}
          onSubmit={(uuid, includes, timeRange) => {
            insertEvent(editor, uuid, includes, timeRange);
            setModal(null);
          }}
        />
      )}
      {modal === 'event-compare' && (
        <CompareEventsModal
          i18n={props.i18n}
          clearModal={clearModal}
          project={props.project}
          onSubmit={() => console.log('todo')}
        />
      )}
      <Dropdown.Root modal={false} open={open}>
        <Dropdown.Trigger asChild>
          <Button
            className='insert-button primary'
            onClick={() => setOpen(!open)}
          >
            {t['Insert']}
            {open ? <TriangleUpIcon /> : <TriangleDownIcon />}
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content className='dropdown-content meatball-dropdown-content'>
            <Dropdown.Sub>
              <Dropdown.SubTrigger className='dropdown-item dropdown-subtrigger'>
                {t['Column']}
                <ChevronRightIcon />
              </Dropdown.SubTrigger>
              <Dropdown.Portal>
                <Dropdown.SubContent className='dropdown-content meatball-dropdown-content'>
                  <Dropdown.Item
                    className='dropdown-item'
                    onClick={() => updateColumnLayout([2, 4])}
                  >
                    {t['1/3 + 2/3']}
                  </Dropdown.Item>
                  <Dropdown.Item
                    className='dropdown-item'
                    onClick={() => updateColumnLayout([3, 3])}
                  >
                    {t['1/2 + 1/2']}
                  </Dropdown.Item>
                  <Dropdown.Item
                    className='dropdown-item'
                    onClick={() => updateColumnLayout([4, 2])}
                  >
                    {t['2/3 + 1/3']}
                  </Dropdown.Item>
                </Dropdown.SubContent>
              </Dropdown.Portal>
            </Dropdown.Sub>
            <Dropdown.Item
              className='dropdown-item'
              onClick={() => updateModal('single-event')}
            >
              {t['Single event']}
            </Dropdown.Item>
            <Dropdown.Item
              className='dropdown-item'
              onClick={() => updateModal('event-compare')}
            >
              {t['Event comparison']}
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
    </>
  );
};
