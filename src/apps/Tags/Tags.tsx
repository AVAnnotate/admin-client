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

import './Tags.css';
import type { ToastContent } from '@components/Toast/ToastContent.ts';

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

  useEffect(() => {
    if (props.project) {
      setProject(props.project);
    }
  }, [props.project]);

  const counts: AnnotationCounts = useMemo(() => {
    let ret: AnnotationCounts = {};
    if (project) {
      for (let key in project.annotations) {
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
          });
        });
      }
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
    fetch(`/api/projects/${props.projectSlug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...proj.project }),
    }).then((data) => {
      if (data.ok) {
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
    });
  };

  const handleAddTagGroup = () => {
    setAddOpen(true);
    setGroupName(undefined);
    setGroupColor(undefined);
  };

  const handleDeleteTag = (tag: Tag) => {
    setSaving(true);
    return fetch(`/api/projects/${props.projectSlug}/tags`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag }),
    })
      .then((data) => {
        if (data.ok) {
          setToast({
            title: t['Success!'],
            description: t['Tag deleted'],
            type: 'success',
          });
          return data.json();
        } else {
          setToast({
            title: t['Problem!'],
            description: t['Tag not deleted'],
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

  const handleUpdateTag = (oldTag: Tag, newTag: Tag) => {
    setSaving(true);
    return fetch(`/api/projects/${props.projectSlug}/tags`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldTag, newTag }),
    })
      .then((data) => {
        if (data.ok) {
          setToast({
            title: t['Success!'],
            description: t['Tag updated'],
            type: 'success',
          });
          return data.json();
        } else {
          setToast({
            title: t['Problem!'],
            description: t['Tag not updated'],
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

  const handleAddTag = (tag: Tag) => {
    setSaving(true);
    return fetch(`/api/projects/${props.projectSlug}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag: tag }),
    })
      .then((data) => {
        if (data.ok) {
          setToast({
            title: t['Success!'],
            description: t['Tag added'],
            type: 'success',
          });
          return data.json();
        } else {
          setToast({
            title: t['Problem!'],
            description: t['Tag not added'],
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

  const tags =
    project && project.project.tags ? project.project.tags : undefined;

  return (
    <ToastProvider>
      {saving && <LoadingOverlay />}
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          {
            label: props.project.project.title,
            link: `/${lang}/projects/${props.projectSlug}`,
          },
          { label: t['Tags'], link: '' },
        ]}
      />
      <div className='tags-container'>
        <h1>{t['Tags']}</h1>
        {!tags || tags?.tagGroups.length === 0 ? (
          <NoTags
            i18n={props.i18n}
            onAddTagGroup={handleAddTagGroup}
            onImportTags={handleImportTags}
          />
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
      <Toast
        content={toast}
        onOpenChange={(open) => !open && setToast(undefined)}
      />
    </ToastProvider>
  );
};
