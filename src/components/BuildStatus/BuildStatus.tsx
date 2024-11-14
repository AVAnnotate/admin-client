import { Spinner } from '@components/Spinner/Spinner.tsx';
import type { Translations } from '@ty/Types.ts';
import { useState, useEffect, useMemo } from 'react';
import './BuildStatus.css';

interface BuildStatusProps {
  projectSlug: string;
  i18n: Translations;
}

export const BuildStatus = (props: BuildStatusProps) => {
  const [building, setBuilding] = useState(false);

  const { t } = props.i18n;

  const sendStatusRequest = () => {
    fetch(`/api/projects/${props.projectSlug}/status`).then((result) => {
      if (result.ok) {
        return result.json().then((data) => {
          if (data.running_count > 0) {
            setBuilding(true);
          } else {
            setBuilding(false);
          }
        });
      }
      setBuilding(false);
    });
  };

  const interval = useMemo(() => {
    return setInterval(sendStatusRequest, 10000);
  }, []);

  useEffect(() => {
    sendStatusRequest();
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (building) {
    return (
      <div className='build-status-container'>
        <Spinner className='build-status-spinner' />
        <div className='av-label-bold rightTI li'>{t['Site Building']}</div>
      </div>
    );
  } else {
    return <div />;
  }
};
