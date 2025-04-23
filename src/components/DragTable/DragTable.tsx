import React, { useState } from 'react';
import './DragTable.css';
import { Box } from '@radix-ui/themes';
import type { DraggedPage } from '@ty/ui.ts';
import { GripVertical } from 'react-bootstrap-icons';

interface Props {
  rows: { id: string; component: any }[];
  onDrop(pickedUp: DraggedPage | null): void;
  entries: { label: string; widthPct: number }[];
  addButton?: any;
}

export const DragTable: React.FC<Props> = (props) => {
  const [pickedUp, setPickedUp] = useState<DraggedPage | null>(null);

  return (
    <div className='drag-table'>
      <div className='drag-table-header'>
        <div style={{ width: 40, boxSizing: 'border-box' }} />
        {props.entries.map((entry, idx) => {
          return (
            <div
              className='drag-table-header-cell'
              style={{ width: `${entry.widthPct}%`, boxSizing: 'content-box' }}
              key={`header-${idx}`}
            >
              {entry.label}
            </div>
          );
        })}
      </div>
      {props.rows.map((row, idx) => {
        return (
          <Box
            className={`drag-table-box ${
              pickedUp?.hoverIndex === idx ? 'drad-table-box-hovered' : ''
            }`}
            draggable
            key={row.id}
            onDragStart={(_ev) => {
              setPickedUp({
                uuid: row.id,
                originalIndex: idx,
                hoverIndex: idx,
              });
            }}
            onDragOver={(ev) => {
              ev.preventDefault();
              if (pickedUp) {
                setPickedUp({
                  ...pickedUp,
                  hoverIndex: idx,
                });
              }
            }}
            onDrop={async () => await props.onDrop(pickedUp)}
            onDragEnd={() => setPickedUp(null)}
            height='56px'
            width='100%'
          >
            <GripVertical width={40} />
            {row.component}
          </Box>
        );
      })}
    </div>
  );
};
