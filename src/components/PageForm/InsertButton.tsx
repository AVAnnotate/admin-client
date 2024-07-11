import { type Event, type ProjectData, type Translations } from '@ty/Types.ts';
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

type InsertButtonModalTypes = 'single-event' | 'event-compare';

type ColumnLayout = [2, 4] | [3, 3] | [4, 2];

const insertColumns = (
  editor: BaseEditor & ReactEditor,
  newLayout: ColumnLayout
) => {
  const paragraph = { type: 'paragraph', children: [{ text: '' }] };

  const columns = [
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

interface InsertModalProps {
  i18n: Translations;
  clearModal: () => void;
  project: ProjectData;
}

const SingleEventModal: React.FC<InsertModalProps> = (props) => {
  const [event, setEvent] = useState<string>(
    Object.keys(props.project.events).length > 0
      ? Object.keys(props.project.events)[0]
      : ''
  );
  const [duration, setDuration] = useState<'full' | 'clip'>('full');
  const [include, setInclude] = useState<string[]>([]);
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
              <p>{t['Duration']}</p>
              <div className='duration-buttons'>
                <Button
                  className={duration === 'full' ? 'primary' : 'outline'}
                  onClick={() => setDuration('full')}
                  type='button'
                >
                  {t['Full Recording']}
                </Button>
                <Button
                  className={duration === 'clip' ? 'primary' : 'outline'}
                  onClick={() => setDuration('clip')}
                  type='button'
                >
                  {t['Clip']}
                </Button>
              </div>
              <p>{t['Include']}</p>
              <div className='include-buttons'>
                <Button
                  className={include.includes('media') ? 'primary' : 'outline'}
                  type='button'
                  onClick={() => toggleInclude('media')}
                >
                  {include.includes('media') && <Check color='white' />}
                  {t['Media']}
                </Button>
                <Button
                  className={
                    include.includes('annotations') ? 'primary' : 'outline'
                  }
                  type='button'
                  onClick={() => toggleInclude('annotations')}
                >
                  {include.includes('annotations') && <Check color='white' />}
                  {t['Annotations']}
                </Button>
                <Button
                  className={
                    include.includes('description') ? 'primary' : 'outline'
                  }
                  type='button'
                  onClick={() => toggleInclude('description')}
                >
                  {include.includes('description') && <Check color='white' />}
                  {t['Description']}
                </Button>
              </div>
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
              onClick={() => console.log('todo')}
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
  const { t } = props.i18n;

  return (
    <Dialog.Root open>
      <Dialog.Overlay className='slate-dialog-overlay' />
      <Dialog.Content className='slate-dialog-content'>
        <Dialog.Title>{t['Event comparison']}</Dialog.Title>
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
        />
      )}
      {modal === 'event-compare' && (
        <CompareEventsModal
          i18n={props.i18n}
          clearModal={clearModal}
          project={props.project}
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
