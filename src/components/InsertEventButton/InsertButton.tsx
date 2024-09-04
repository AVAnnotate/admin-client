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
import { CompareEventsModal } from './CompareEventsModal.tsx';
import { SingleEventModal } from './SingleEventModal.tsx';
import type {
  ColumnLayout,
  InsertButtonModalTypes,
  SlateCompareEventData,
  SlateEventNodeData,
} from '../../types/slate.ts';
import { emptyParagraph } from '@lib/slate/index.tsx';

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
          children: [structuredClone(paragraph)],
        },
        {
          type: 'column',
          children: [structuredClone(paragraph)],
        },
      ],
    },
    structuredClone(paragraph),
  ];

  Transforms.insertNodes(editor, columns);
};

const insertEvent = (
  editor: BaseEditor & ReactEditor,
  event: SlateEventNodeData
) => {
  const paragraph = { type: 'paragraph', children: [{ text: '' }] };

  const eventObj: any = {
    type: 'event',
    ...event,
    children: [{ text: '' }],
  };

  Transforms.insertNodes(editor, [eventObj, paragraph]);
};

const insertEventComparison = (
  editor: BaseEditor & ReactEditor,
  data: SlateCompareEventData
) => {
  const eventObj: any = {
    type: 'event-comparison',
    ...data,
    children: [{ text: '' }],
  };

  const paragraph = { type: 'paragraph', children: [{ text: '' }] };

  Transforms.insertNodes(editor, [eventObj, paragraph]);
};

const insertHorizontalSeparator = (editor: BaseEditor & ReactEditor) => {
  const nodes = [
    {
      type: 'horizontal-separator',
      children: [{ text: '' }],
    },
    { ...emptyParagraph[0] },
  ];

  // @ts-ignore
  Transforms.insertNodes(editor, nodes);
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
          onSubmit={(event) => {
            insertEvent(editor, event);
            setModal(null);
          }}
        />
      )}
      {modal === 'event-compare' && (
        <CompareEventsModal
          i18n={props.i18n}
          clearModal={clearModal}
          project={props.project}
          onSubmit={(comparisonData) => {
            insertEventComparison(editor, comparisonData);
            setModal(null);
          }}
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
              onClick={() => insertHorizontalSeparator(editor)}
            >
              {t['Horizontal Separator']}
            </Dropdown.Item>
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
              {t['Compare Events']}
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
    </>
  );
};
