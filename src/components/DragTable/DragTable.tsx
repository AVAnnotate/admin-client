import React, { useMemo, useState } from 'react';
import './DragTable.css';
import { Box } from '@radix-ui/themes';
import type { DraggedPage } from '@ty/ui.ts';
import { GripVertical } from 'react-bootstrap-icons';

interface Props {
  rows: { id: string; component: any }[];
  onDrop(pickedUp: DraggedPage | null): void;
  entries: { label: string; gridWidth: string }[];
  addButton?: any;
}

export const DragTable: React.FC<Props> = (props) => {
  const [pickedUp, setPickedUp] = useState<DraggedPage | null>(null);

  const gridSettings = useMemo(() => {
    let setting = '40px ';
    props.entries.forEach((entry) => {
      setting += entry.gridWidth;
      setting += ' ';
    });

    return setting;
  }, [props.entries]);

  console.log('Hover: ', pickedUp?.hoverIndex);
  return (
    <div className='drag-table'>
      <div
        className='drag-table-header'
        style={{ gridTemplateColumns: gridSettings }}
      >
        <div style={{ width: 40, boxSizing: 'border-box' }} />
        {props.entries.map((entry, idx) => {
          return (
            <div className='drag-table-header-cell' key={`header-${idx}`}>
              {entry.label}
            </div>
          );
        })}
      </div>
      {props.rows.map((row, idx) => {
        return (
          <Box
            className={`drag-table-box ${
              pickedUp?.hoverIndex === idx ? 'drag-table-box-hovered' : ''
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
            style={{ gridTemplateColumns: gridSettings }}
          >
            <GripVertical width={38} />
            {row.component}
          </Box>
        );
      })}
    </div>
  );
};
