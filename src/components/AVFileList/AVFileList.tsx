import React, { useEffect, useMemo, useState } from 'react';
import './AVFileList.css';
import type { FormEvent, Translations } from '@ty/Types.ts';
import { Button } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import { BottomBar } from '@components/BottomBar/BottomBar.tsx';
import type { DraggedPage } from '@ty/ui.ts';
import { AVFileRow } from './AVFileRow.tsx';

interface Props {
  i18n: Translations;
  event: FormEvent;
  projectSlug: string;
}

export const AVFileList: React.FC<Props> = (props) => {
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<string[]>([]);
  const [event, setEvent] = useState(props.event);

  const { t } = props.i18n;

  const [pickedUp, setPickedUp] = useState<DraggedPage | null>(null);

  const isChanged = useMemo(() => {
    return (props.event.av_file_order || []) === order;
  }, [props.event]);

  useEffect(() => {
    if (props.event) {
      if (props.event.av_file_order && props.event.av_file_order.length > 0) {
        setOrder(props.event.av_file_order);
      } else {
        setOrder(Object.keys(props.event.audiovisual_files));
      }
    }
  }, [props.event]);

  const onDrop = async () => {
    if (pickedUp) {
      // ignore if we're dropping in the same spot it came from
      if (pickedUp.hoverIndex === pickedUp.originalIndex) {
        return setPickedUp(null);
      }

      let newArray = order.filter((k) => k !== pickedUp.uuid);

      newArray.splice(pickedUp.hoverIndex + 1, 0, pickedUp.uuid);

      setOrder(newArray);
    }
  };

  const onSubmit = async () => {
    setSaving(true);
    const res = await fetch(`/api/projects/${props.projectSlug}/pages/order`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: order }),
    });

    const data = await res.json();

    setOrder(data.order);
    setSaving(false);
  };

  const handleDeleteFile = async (uuid: string) => {};

  return (
    <>
      {saving && <LoadingOverlay />}
      <div className='av-file-list'>
        <div className='av-file-list-box-container'>
          {order!.map((uuid, idx) => (
            <AVFileRow
              event={event}
              uuid={uuid}
              index={idx}
              pickedUp={pickedUp}
              setPickedUp={setPickedUp}
              i18n={props.i18n}
              onDrop={onDrop}
              key={uuid}
              onDelete={() => handleDeleteFile(uuid)}
            />
          ))}
        </div>
        <BottomBar>
          <div className='av-file-list-bottom-bar'>
            <Button
              className='primary'
              disabled={!isChanged}
              onClick={onSubmit}
            >
              {t['save']}
            </Button>
          </div>
        </BottomBar>
      </div>
    </>
  );
};
