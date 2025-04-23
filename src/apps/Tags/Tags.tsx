import type {
  ProjectData,
  Tag,
  TagGroup,
  Tags as TagsType,
  Translations,
  AnnotationCounts,
} from '@ty/Types.ts';
import { NoTags } from './NoTags.tsx';
import { Breadcrumbs } from '@components/Breadcrumbs/Breadcrumbs.tsx';
import { mapTagData } from '@lib/parse/index.ts';
import { useEffect, useMemo, useState } from 'react';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import { TagGroupCard } from './TagGroupCard.tsx';
import { AddTagGroupDialog } from './AddTagGroupDialog/AddTagGroupDialog.tsx';
import { ToastProvider, Toast } from '@components/Toast/Toast.tsx';
import { ConfirmationDialog } from '@components/ConfirmedAction/ConfirmedAction.tsx';

import './Tags.css';
import type { ToastContent } from '@components/Toast/ToastContent.ts';
import { PlusIcon, DownloadIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import { exportTags } from '@lib/tags/index.ts';
import { EmptyDashboard } from '@components/EmptyDashboard/EmptyDashboards.tsx';
import { ImportTagsDialog } from '@apps/Tags/ImportTagsDialog/ImportTagsDialog.tsx';

export interface TagsProps {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

export const Tags = (props: TagsProps) => {
  const { t, lang } = props.i18n;

  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<ProjectData | undefined>();
  const [addOpen, setAddOpen] = useState(false);
  const [groupName, setGroupName] = useState<string | undefined>();
  const [groupColor, setGroupColor] = useState<string | undefined>();
  const [toast, setToast] = useState<ToastContent | undefined>();
  const [totalTagsUsed, setTotalTagsUsed] = useState<number | undefined>();
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  useEffect(() => {
    if (props.project) {
      setProject(props.project);
    }
  }, [props.project]);

  const counts: AnnotationCounts = useMemo(() => {
    const ret: AnnotationCounts = {};
    if (project) {
      let cnt = 0;
      for (const key in project.annotations) {
        const annos = project.annotations[key];
        annos.annotations.forEach((annotation) => {
          annotation.tags.forEach((tag) => {
            if (!ret[tag.category]) {
              ret[tag.category] = {};
            }
            if (!ret[tag.category][tag.tag]) {
              ret[tag.category][tag.tag] = 0;
            }

            ret[tag.category][tag.tag]++;
            cnt++;
          });
        });
      }

      setTotalTagsUsed(cnt);
    }

    return ret;
  }, [project]);

  const handleDeleteGroup = async (group: TagGroup) => {
    setSaving(true);
    return fetch(`/api/projects/${props.projectSlug}/tag-groups`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tagGroup: group }),
    })
      .then((data) => {
        if (data.ok) {
          setToast({
            title: t['Success!'],
            description: t['Group deleted'],
            type: 'success',
          });
          return data.json();
        } else {
          setToast({
            title: t['Problem!'],
            description: t['Group not deleted'],
            type: 'error',
          });
          return undefined;
        }
      })
      .then((p) => {
        if (p) {
          setProject(p.project);
        }
        setSaving(false);
      });
  };

  const handleUpdateGroup = async (group: TagGroup) => {
    setGroupColor(group.color);
    setGroupName(group.category);
    setAddOpen(true);
  };

  const handleSaveTagGroup = async (group: TagGroup) => {
    setAddOpen(false);
    setSaving(true);
    return fetch(`/api/projects/${props.projectSlug}/tag-groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tagGroup: group }),
    })
      .then((data) => {
        if (data.ok) {
          setToast({
            title: t['Success!'],
            description: t['Tag group saved'],
            type: 'success',
          });
          return data.json();
        } else {
          setToast({
            title: t['Problem!'],
            description: t['Tag group not saved'],
            type: 'error',
          });
          return undefined;
        }
      })
      .then((p) => {
        if (p) {
          setProject(p.project);
        }
        setSaving(false);
      });
  };

  const handleUpdateTagGroup = async (
    oldGroup: TagGroup,
    newGroup: TagGroup
  ) => {
    setAddOpen(false);
    setSaving(true);
    return fetch(`/api/projects/${props.projectSlug}/tag-groups`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldTagGroup: oldGroup, newTagGroup: newGroup }),
    })
      .then((data) => {
        if (data.ok) {
          setToast({
            title: t['Success!'],
            description: t['Tag group saved'],
            type: 'success',
          });
          return data.json();
        } else {
          setToast({
            title: t['Problem!'],
            description: t['Tag group not saved'],
            type: 'error',
          });
          return undefined;
        }
      })
      .then((p) => {
        if (p) {
          setProject(p.project);
        }
        setSaving(false);
      });
  };

  const handleImportTags = async (
    data: any[],
    headerMap: { [key: string]: number }
  ) => {
    const proj: ProjectData = JSON.parse(JSON.stringify(props.project));

    proj.project.tags = mapTagData(data, headerMap);

    setSaving(true);
    const res = await fetch(`/api/projects/${props.projectSlug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...proj.project }),
    });

    if (res.ok) {
      setToast({
        title: t['Success!'],
        description: t['Tags imported'],
        type: 'success',
      });
      setProject(proj);
    } else {
      setToast({
        title: t['Problem!'],
        description: t['Tags failed to import'],
        type: 'error',
      });
    }
    setSaving(false);
  };

  const handleAddTagGroup = () => {
    setAddOpen(true);
    setGroupName(undefined);
    setGroupColor(undefined);
  };

  const handleDeleteTag = async (tag: Tag) => {
    setSaving(true);
    const res = await fetch(`/api/projects/${props.projectSlug}/tags`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag }),
    });
    if (res.ok) {
      setToast({
        title: t['Success!'],
        description: t['Tag deleted'],
        type: 'success',
      });
      const p = await res.json();
      setProject(p.project);
    } else {
      setToast({
        title: t['Problem!'],
        description: t['Tag not deleted'],
        type: 'error',
      });
    }
    setSaving(false);
  };

  const handleUpdateTag = async (oldTag: Tag, newTag: Tag) => {
    setSaving(true);
    const data = await fetch(`/api/projects/${props.projectSlug}/tags`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldTag, newTag }),
    });
    if (data.ok) {
      setToast({
        title: t['Success!'],
        description: t['Tag updated'],
        type: 'success',
      });
      const p = await data.json();
      setProject(p.project);
    } else {
      setToast({
        title: t['Problem!'],
        description: t['Tag not updated'],
        type: 'error',
      });
    }

    setSaving(false);
  };

  const handleAddTag = async (tag: Tag) => {
    setSaving(true);
    const data = await fetch(`/api/projects/${props.projectSlug}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag: tag }),
    });
    if (data.ok) {
      setToast({
        title: t['Success!'],
        description: t['Tag added'],
        type: 'success',
      });
      const p = await data.json();
      setProject(p.project);
    } else {
      setToast({
        title: t['Problem!'],
        description: t['Tag not added'],
        type: 'error',
      });
    }

    setSaving(false);
  };

  const handleRequestDeleteTags = () => {
    setDeleteAllOpen(true);
  };

  const handleDeleteAllTags = async () => {
    setSaving(true);
    setDeleteAllOpen(false);
    const data = await fetch(`/api/projects/${props.projectSlug}/all-tags`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (data.ok) {
      setToast({
        title: t['Success!'],
        description: t['All tags and tag categories deleted'],
        type: 'success',
      });
      const p = await data.json();
      setProject(p.project);
    } else {
      setToast({
        title: t['Problem!'],
        description: t['Failed to delete tags'],
        type: 'error',
      });
    }

    setSaving(false);
  };

  const handleDownloadTags = () => {
    exportTags(props.project.project.tags, props.project.project.slug);
  };

  const tags =
    project && project.project.tags ? project.project.tags : undefined;

  return (
    <ToastProvider>
      {saving && <LoadingOverlay />}
      <div className='tags-container'>
        <div className='tags-header-row'>
          <h1>{t['Tag Manager']}</h1>
          <div className='tags-header buttons'>
            {project &&
              project.project.tags.tags.length > 0 &&
              totalTagsUsed === 0 && (
                <Button
                  className='primary'
                  onClick={() => handleRequestDeleteTags()}
                >
                  <TrashIcon />
                  {t['Delete All Tags']}
                </Button>
              )}
            <Button
              className='outline tags-csv-button'
              onClick={() => handleDownloadTags()}
              type='button'
            >
              <DownloadIcon />
              {t['CSV']}
            </Button>
            <Button
              className='primary tags-create-tag-group-button'
              onClick={() => handleAddTagGroup()}
            >
              <PlusIcon />
              {t['Create Tag Group']}
            </Button>
          </div>
        </div>
        {!tags || tags?.tagGroups.length === 0 ? (
          <EmptyDashboard description={t['No tags have been added']}>
            <ImportTagsDialog i18n={props.i18n} onSave={handleImportTags} />
            <button
              type='button'
              className='outline av-label-bold tags-empty-button'
              onClick={handleAddTagGroup}
            >
              <PlusIcon />
              {t['Add Tag Group']}
            </button>
          </EmptyDashboard>
        ) : (
          <div className='tags-grid'>
            {tags.tagGroups.map((g) => (
              <TagGroupCard
                key={g.category}
                i18n={props.i18n}
                tagGroup={g}
                tags={tags.tags}
                tagGroups={tags.tagGroups}
                counts={counts[g.category] ? counts[g.category] : {}}
                onDeleteGroup={handleDeleteGroup}
                onUpdateGroup={handleUpdateGroup}
                onDeleteTag={handleDeleteTag}
                onUpdateTag={handleUpdateTag}
                onAddTag={handleAddTag}
              />
            ))}
            <TagGroupCard
              tagGroup={{ category: 'empty', color: 'white' }}
              empty={true}
              i18n={props.i18n}
              counts={{}}
              onAddTagGroup={handleAddTagGroup}
              tagGroups={tags.tagGroups}
            />
          </div>
        )}
      </div>
      {addOpen && (
        <AddTagGroupDialog
          i18n={props.i18n}
          name={groupName}
          color={groupColor}
          open={addOpen}
          tags={tags as TagsType}
          onSave={handleSaveTagGroup}
          onUpdate={handleUpdateTagGroup}
          onClose={() => setAddOpen(false)}
        />
      )}
      {deleteAllOpen && (
        <ConfirmationDialog
          i18n={props.i18n}
          open={deleteAllOpen}
          title={t['Confirm Delete All']}
          description={t['_delete_all_message_']}
          cancelLabel={t['cancel']}
          confirmLabel={t['Delete All Tags']}
          onClose={() => setDeleteAllOpen(false)}
          onConfirm={handleDeleteAllTags}
        />
      )}
      <Toast
        content={toast}
        onOpenChange={(open) => !open && setToast(undefined)}
      />
    </ToastProvider>
  );
};
