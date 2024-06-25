import React, { useMemo } from 'react'
import './PageList.css'
import type { Page, ProjectData, Translations } from '@ty/Types.ts'
import { Box, Button, Text } from '@radix-ui/themes';
import { BoxArrowUpRight, GripVertical, Trash } from 'react-bootstrap-icons';
import { Pencil2Icon, PlusIcon } from '@radix-ui/react-icons';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';

interface PageWithUuid extends Page {
  uuid: string
}

interface Props {
  i18n: Translations;
  project: ProjectData
}

export const PageList: React.FC<Props> = (props) => {
  const { t } = props.i18n;

  // Add uuid fields to the event objects so we
  // can still use the onClick row handlers below.
  const pagesWithUuids = useMemo(() => Object.entries(props.project.pages).map((entry) => ({
    uuid: entry[0],
    ...entry[1]
  })), [props.project.pages])

  return (
    <div className='page-list'>
      <div className='page-list-top-bar'>
        <span>{t['All Pages']}</span>
        <Button
          className='primary'
        >
          <PlusIcon />
          {t['Add']}
        </Button>
      </div>
      <div className='page-list-box-container'>
        {pagesWithUuids.map(page => {
          const dateInfo = useMemo(() => {
            if (page.updated_at) {
              const dateStr = new Date(page.updated_at).toLocaleDateString()
              return `${t['Last edited at']} ${dateStr}`
            } else {
              const dateStr = new Date(page.created_at).toLocaleDateString()
              return `${t['Added']} ${dateStr}`
            }
          }, [page, t])

          return (
            <Box
              className='page-list-box'
              draggable
              height='56px'
              width='100%'
            >
              <GripVertical />
              <Text weight='bold'>{props.project.pages[page.uuid].title}</Text>
              <span>{dateInfo}</span>
              <MeatballMenu
                buttons={[
                  {
                    label: t['Open'],
                    icon: BoxArrowUpRight,
                    onClick: () => { }
                  },
                  {
                    label: t['Edit'],
                    icon: Pencil2Icon,
                    onClick: (item: PageWithUuid) => window.location.href = `${window.location.href}/pages/${item.uuid}`
                  },
                  {
                    label: t['Delete'],
                    icon: Trash,
                    onClick: async (item: PageWithUuid) => {
                      await fetch(`/api/projects/${props.project.project.gitHubOrg}+${props.project.project.slug}/events/${item.uuid}`, {
                        method: 'DELETE'
                      })

                      window.location.reload()
                    }
                  }
                ]}
                row={page}
              />
            </Box>
          )
        })}
      </div>
    </div>
  )
}
