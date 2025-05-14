import { MeatballMenu } from '@components/MeatballMenu/index.ts';
import { formatTimestamp } from '@lib/events/index.ts';
import { serialize } from '@lib/slate/index.tsx';
import { DotsThree } from '@phosphor-icons/react/dist/icons/DotsThree';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { Button, Table } from '@radix-ui/themes';
import type {
  AnnotationEntry,
  ProjectData,
  Tag,
  Translations,
} from '@ty/Types.ts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FileEarmarkArrowUp, Plus, Trash } from 'react-bootstrap-icons';
import useExpandHeight from 'src/hooks/useExpandHeight.tsx';

interface TagListProps {
  groups: {
    [key: string]: string;
  };
  maxWidth: number;
  tags: Tag[];
  // number of rows to allow the tags to wrap before truncating
  rows?: number;
}

const TagList: React.FC<TagListProps> = (props) => {
  // the last tag to display in the list before truncating
  const [displayIdx, setDisplayIdx] = useState(0);

  const tagCellEl = useRef<HTMLDivElement>(null);
  const tagHolderEl = useRef<HTMLDivElement>(null);

  const rows = props.rows || 1;

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
      } else if (widthTracker + tagEls[i].clientWidth > props.maxWidth * rows) {
        setDisplayIdx(i);
        break;
      } else {
        // account for the gap and margin
        widthTracker += tagEls[i].clientWidth + 30;
      }
    }
  }, [tagCellEl.current, tagHolderEl.current, props.maxWidth, rows]);

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
  eventUuid: string;
  hideHeader?: boolean;
  project: ProjectData;
  projectSlug: string;
  setDeleteAnnoUuid: (uuid: string) => void;
  setEditAnnoUuid: (uuid: string) => void;
  setAnnoPosition: (pos: number) => void;
  setShowAnnoCreateModal: (arg: boolean) => void;
  tagPosition?: 'below' | 'column';
  tagRows?: number;
}

const AnnotationTable: React.FC<AnnotationTableProps> = (props) => {
  const [tagCellWidth, setTagCellWidth] = useState(0);

  const { t, lang } = props.i18n;

  const tagPosition = props.tagPosition || 'column';

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

  const emptyNotice = useMemo(
    () => (
      <Table.Cell colSpan={4} className='empty-annos-note'>
        <p>{t['No annotations have been added.']}</p>
        <div className='empty-annos-buttons'>
          <Button
            className='primary'
            type='button'
            onClick={() => props.setShowAnnoCreateModal(true)}
          >
            <FileEarmarkArrowUp /> {t['Add']}
          </Button>
          <a
            href={`/${lang}/projects/${props.projectSlug}/events/${props.eventUuid}/import`}
          >
            <Button className='outline' type='button'>
              <Plus color='black' /> {t['Import']}
            </Button>
          </a>
        </div>
      </Table.Cell>
    ),
    []
  );

  const containerRef = useRef(null);

  useExpandHeight(containerRef);

  return (
    <div className='event-detail-table-container' ref={containerRef}>
      <Table.Root>
        {!props.hideHeader && (
          <Table.Header>
            <Table.Row className='header-row'>
              <Table.ColumnHeaderCell className='timestamp-column'>
                <div className='header-cell-container'>{t['Timestamp']}</div>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell
                className='text-column'
                ref={tagPosition === 'below' ? tagHeaderCell : undefined}
              >
                <div className='header-cell-container'>{t['Text']}</div>
              </Table.ColumnHeaderCell>
              {tagPosition === 'column' && (
                <Table.ColumnHeaderCell
                  className='tags-header-cell tags-column'
                  ref={tagPosition === 'column' ? tagHeaderCell : undefined}
                >
                  <div className='header-cell-container'>{t['Tags']}</div>
                </Table.ColumnHeaderCell>
              )}
              <Table.ColumnHeaderCell className='options-column'></Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
        )}
        <Table.Body className='annotation-table-body'>
          {props.displayAnnotations.length === 0 && !props.hideHeader && (
            <Table.Row>{emptyNotice}</Table.Row>
          )}
          {props.displayAnnotations.map((an) => (
            <Table.Row className='annotation-table-row' key={an.uuid}>
              <Table.Cell
                className='annotation-data-cell timestamp-cell'
                onClick={() => props.setAnnoPosition(an.start_time)}
              >
                <p>
                  {formatTimestamp(an.start_time, false)}&nbsp;-{' '}
                  {formatTimestamp(an.end_time, false)}
                </p>
              </Table.Cell>
              <Table.Cell
                className='annotation-data-cell annotation-cell'
                onClick={() => props.setAnnoPosition(an.start_time)}
              >
                {serialize(an.annotation)}
                {tagPosition === 'below' && (
                  <TagList
                    groups={tagGroups}
                    maxWidth={tagCellWidth}
                    rows={props.tagRows}
                    tags={an.tags}
                  />
                )}
              </Table.Cell>
              {tagPosition === 'column' && (
                <Table.Cell
                  className='annotation-data-cell tag-cell'
                  onClick={() => props.setAnnoPosition(an.start_time)}
                >
                  {tagCellWidth && (
                    <TagList
                      groups={tagGroups}
                      maxWidth={tagCellWidth}
                      rows={props.tagRows}
                      tags={an.tags}
                    />
                  )}
                </Table.Cell>
              )}
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
                    icon={DotsThree}
                    row={t}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      {props.displayAnnotations.length === 0 && props.hideHeader && (
        <>{emptyNotice}</>
      )}
    </div>
  );
};

export default AnnotationTable;
