import { MeatballMenu } from '@components/MeatballMenu/index.ts';
import { formatTimestamp } from '@lib/events/index.ts';
import { serialize } from '@lib/slate/index.tsx';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { Table } from '@radix-ui/themes';
import type {
  AnnotationEntry,
  ProjectData,
  Tag,
  Translations,
} from '@ty/Types.ts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Trash } from 'react-bootstrap-icons';

const formatTimestamps = (start: number, end: number) =>
  `${formatTimestamp(start, false)} - ${formatTimestamp(end, false)}`;

interface TagListProps {
  groups: {
    [key: string]: string;
  };
  maxWidth: number;
  tags: Tag[];
}

const TagList: React.FC<TagListProps> = (props) => {
  // the last tag to display in the list before truncating
  const [displayIdx, setDisplayIdx] = useState(0);

  const tagCellEl = useRef<HTMLDivElement>(null);
  const tagHolderEl = useRef<HTMLDivElement>(null);

  const tagComponents = useMemo(
    () =>
      props.tags.map((t, idx) => {
        return (
          <div
            className='tag-item'
            key={idx}
            style={{
              backgroundColor:
                props.groups[
                  t.category.toLowerCase() as keyof typeof props.groups
                ],
            }}
          >
            <span className='tag-content'>{t.tag}</span>
          </div>
        );
      }),
    [props.tags, props.groups]
  );

  useEffect(() => {
    if (!tagCellEl.current || !tagHolderEl.current) {
      return;
    }

    let widthTracker = 0;

    const tagEls = tagHolderEl.current.querySelectorAll('.tag-item');

    for (let i = 0; i < tagEls.length; i++) {
      // if we've made it to the last one, that means we
      // can show all the tags!
      if (i === tagEls.length - 1) {
        setDisplayIdx(i);
        break;
        // stop if the current tag would overflow the cell
      } else if (widthTracker + tagEls[i].clientWidth > props.maxWidth) {
        setDisplayIdx(i);
        break;
      } else {
        // account for the gap and margin
        widthTracker += tagEls[i].clientWidth + 30;
      }
    }
  }, [tagCellEl.current, tagHolderEl.current, props.maxWidth]);

  return (
    <>
      {/* use an invisible div to render all the tags in order to get their widths */}
      <div className='invisible-tag-holder' ref={tagHolderEl}>
        {tagComponents}
      </div>
      {/* then display them for real here */}
      <div className='tag-cell-container' ref={tagCellEl}>
        {tagComponents.slice(0, displayIdx + 1)}
        {tagComponents.length && displayIdx !== tagComponents.length - 1 ? (
          <div className='tag-cell-overflow'>
            &#43;{tagComponents.length - displayIdx - 1}
          </div>
        ) : (
          ''
        )}
      </div>
    </>
  );
};

interface AnnotationTableProps {
  i18n: Translations;
  displayAnnotations: AnnotationEntry[];
  project: ProjectData;
  setDeleteAnnoUuid: (uuid: string) => void;
  setEditAnnoUuid: (uuid: string) => void;
  setAnnoPosition: (pos: number) => void;
}

export const AnnotationTable: React.FC<AnnotationTableProps> = (props) => {
  const [tagCellWidth, setTagCellWidth] = useState(0);

  const { t } = props.i18n;

  const tagGroups = useMemo(() => {
    const obj: { [key: string]: string } = {};

    props.project.project.tags.tagGroups.forEach(
      (tg) => (obj[tg.category.toLowerCase()] = tg.color)
    );

    return obj;
  }, [props.project]);

  const tagHeaderCell = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (!tagHeaderCell.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      // allow for margins and for the + overflow icon on the right
      setTagCellWidth(entries[0].target.clientWidth - 170);
    });
    resizeObserver.observe(tagHeaderCell.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className='event-detail-table-container'>
      <Table.Root>
        <Table.Header>
          <Table.Row className='header-row'>
            <Table.ColumnHeaderCell className='timestamp-column'>
              <div className='header-cell-container'>{t['Timestamp']}</div>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='text-column'>
              <div className='header-cell-container'>{t['Text']}</div>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell
              className='tags-header-cell tags-column'
              ref={tagHeaderCell}
            >
              <div className='header-cell-container'>{t['Tags']}</div>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='options-header-cell options-column'></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {props.displayAnnotations.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={4} className='empty-annos-note'>
                <p>{t['No annotations have been added.']}</p>
              </Table.Cell>
            </Table.Row>
          )}
          {props.displayAnnotations.map((an) => (
            <Table.Row className='annotation-table-row' key={an.uuid}>
              <Table.Cell
                className='annotation-data-cell timestamp-cell'
                onClick={() => props.setAnnoPosition(an.start_time)}
              >
                <p>{formatTimestamps(an.start_time, an.end_time)}</p>
              </Table.Cell>
              <Table.Cell
                className='annotation-data-cell annotation-cell'
                onClick={() => props.setAnnoPosition(an.start_time)}
              >
                {serialize(an.annotation)}
              </Table.Cell>
              <Table.Cell
                className='annotation-data-cell tag-cell'
                onClick={() => props.setAnnoPosition(an.start_time)}
              >
                {tagCellWidth && (
                  <TagList
                    groups={tagGroups}
                    maxWidth={tagCellWidth}
                    tags={an.tags}
                  />
                )}
              </Table.Cell>
              <Table.Cell className='meatball-cell'>
                <div className='meatball-container'>
                  <MeatballMenu
                    buttons={[
                      {
                        label: t['Edit'],
                        icon: Pencil2Icon,
                        onClick: () => props.setEditAnnoUuid(an.uuid),
                      },
                      {
                        label: t['Delete'],
                        icon: Trash,
                        onClick: () => props.setDeleteAnnoUuid(an.uuid),
                      },
                    ]}
                    row={t}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};
