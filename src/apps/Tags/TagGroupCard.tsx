import type { Tag, TagGroup, Translations } from '@ty/Types.ts';
import { Trash } from '@phosphor-icons/react/dist/icons/Trash';
import { Pencil } from '@phosphor-icons/react/dist/icons/Pencil';
import { Plus } from '@phosphor-icons/react/dist/icons/Plus';
import { IconButton } from '@radix-ui/themes';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';
import { ConfirmationDialog } from '@components/ConfirmedAction/index.ts';
import { useMemo, useState, useEffect } from 'react';
import { Dialog } from '@radix-ui/react-dialog';
import { EditTagDialog } from './EditTagDialog/EditTagDialog.tsx';

export interface TagGroupCardProps {
  i18n: Translations;

  tagGroup: TagGroup;

  tags?: Tag[];

  tagGroups: TagGroup[];

  counts?: { [key: string]: number };

  empty?: boolean;

  onAddTagGroup?(): void;

  onUpdateGroup?(group: TagGroup): void;

  onDeleteGroup?(group: TagGroup): void;

  onUpdateTag?(oldTag: Tag, newTag: Tag): void;

  onDeleteTag?(tag: Tag): void;

  onAddTag?(tag: Tag): void;
}

export const TagGroupCard = (props: TagGroupCardProps) => {
  const { t } = props.i18n;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confimDescription, setConfirmDescription] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<Tag | undefined>();
  const [updateTarget, setUpdateTarget] = useState<Tag | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [group, setGroup] = useState<string | undefined>();

  const color = props.tagGroup!.color;

  useEffect(() => {
    if (props.tagGroup) {
      setGroup(props.tagGroup.category);
    }
  }, [props.tagGroup]);

  const availableGroups = useMemo(() => {
    return props.tagGroups.map((g) => g.category);
  }, [props.tagGroups]);

  const HandleEditGroup = () => {
    if (props.onUpdateGroup) {
      setEditOpen(true);
    }
  };

  const handleDeleteGroup = () => {
    setConfirmOpen(true);
    setConfirmTarget(undefined);
    setConfirmTitle(t['Confirm Group Deletion']);
    setConfirmDescription(t['delete-group-description']);
    setConfirmTarget(undefined);
  };

  const handleUpdateTag = (tag: Tag) => {
    if (props.onUpdateTag) {
      setUpdateTarget(tag);
      setEditOpen(true);
    }
  };

  const handleDeleteTag = (tag: Tag) => {
    if (props.onDeleteTag) {
      setConfirmOpen(true);
      setConfirmTitle(t['Confirm Tag Deletion']);
      setConfirmDescription(t['delete-tag-description']);
      setConfirmTarget(tag);
    }
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (confirmTarget && props.onDeleteTag) {
      props.onDeleteTag(confirmTarget);
    } else if (props.onDeleteGroup) {
      props.onDeleteGroup(props.tagGroup);
    }
  };

  const handleConfirmTagSave = (tag: Tag) => {
    setEditOpen(false);
    if (props.onUpdateTag && updateTarget) {
      props.onUpdateTag(updateTarget, tag);
    } else if (props.onAddTag) {
      props.onAddTag(tag);
    }
  };

  const handleAddTag = () => {
    if (props.onAddTag) {
      setUpdateTarget(undefined);
      setEditOpen(true);
    }
  };

  if (props.empty) {
    return (
      <div className='tag-group-card-empty'>
        <button
          className='primary tag-group-card-footer-button av-label-bold'
          onClick={() =>
            props.onAddTagGroup ? props.onAddTagGroup() : () => {}
          }
        >
          <Plus />
          {t['Tag Group']}
        </button>
      </div>
    );
  }
  return (
    <>
      <div className='tag-group-card-container'>
        <div className='tag-group-card-header'>
          <h3>
            {props.tagGroup.category === '_uncategorized_'
              ? t['Uncategorized']
              : props.tagGroup.category}
          </h3>
          <MeatballMenu
            row={props}
            buttons={[
              {
                label: t['Edit'],
                onClick: HandleEditGroup,
              },
              {
                label: t['Delete'],
                onClick: handleDeleteGroup,
              },
            ]}
          />
        </div>
        {props
          .tags!.filter((t) => t.category === props.tagGroup.category)
          .map((t) => (
            <div className='tag-group-card-row' key={t.tag}>
              <div
                className='tag-group-card-pill'
                style={{ backgroundColor: color }}
              >
                <div className='tag-group-card-pill-value'>
                  <div className='tag-group-card-pill-value-text av-label-bold'>
                    {t.tag}
                  </div>
                </div>
                <div className='tag-group-card-pill-count'>
                  {props.counts![t.tag] ? props.counts![t.tag] : 0}
                </div>
              </div>
              <div className='tag-group-card-row-actions'>
                <IconButton
                  className='tag-group-card-action-button'
                  onClick={() => handleDeleteTag(t)}
                >
                  <Trash />
                </IconButton>
                <IconButton
                  className='tag-group-card-action-button'
                  onClick={() => handleUpdateTag(t)}
                >
                  <Pencil />
                </IconButton>
              </div>
            </div>
          ))}
        <div className='tag-group-card-footer'>
          <button
            className='primary tag-group-card-footer-button av-label-bold'
            onClick={() => handleAddTag()}
          >
            <Plus size='16' color='white' />
            {t['Tag']}
          </button>
        </div>
      </div>
      <Dialog open={confirmOpen}>
        <ConfirmationDialog
          open={confirmOpen}
          i18n={props.i18n}
          title={confirmTitle}
          description={confimDescription}
          cancelLabel={t['cancel']}
          confirmLabel={t['confirm']}
          onConfirm={handleConfirm}
          onClose={() => setConfirmOpen(false)}
        />
      </Dialog>
      {editOpen && (
        <EditTagDialog
          i18n={props.i18n}
          open={editOpen}
          onSave={handleConfirmTagSave}
          onClose={() => setEditOpen(false)}
          name={updateTarget ? updateTarget.tag : undefined}
          category={props.tagGroup.category}
          existingTags={
            props.tags
              ? props.tags
                  .filter((t) => t.category === group)
                  .map((t) => t.tag.toLocaleLowerCase())
              : []
          }
          availableGroups={availableGroups}
          onChangeGroup={setGroup}
        />
      )}
    </>
  );
};
