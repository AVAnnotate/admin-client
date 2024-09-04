import type { Translations } from '@ty/Types.ts';
import { useState } from 'react';
import { Button } from '@radix-ui/themes';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import { ToastProvider, Toast } from '@components/Toast/Toast.tsx';
import type { ToastContent } from '@components/Toast/ToastContent.ts';
import type { ImportManifestResults } from '@lib/iiif/import.ts';

import './ImportManifest.css';
import { ImportForm } from '@components/ImportForm/ImportForm.tsx';

interface ImportManifestProps {
  i18n: Translations;

  projectSlug: string;
}

export const ImportManifest = (props: ImportManifestProps) => {
  const [manifestUrl, setManifestUrl] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastContent | undefined>();
  const [valid, setValid] = useState(true);
  const [analysis, setAnalysis] = useState<ImportManifestResults | undefined>();

  const { t, lang } = props.i18n;

  const handleAnalyze = async () => {
    if (manifestUrl) {
      setBusy(true);

      const resp = await fetch(
        `/api/projects/${props.projectSlug}/events/analyze-manifest`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ manifest_url: manifestUrl }),
        }
      );

      if (!resp.ok) {
        setToast({
          title: t['Problem!'],
          description: t['Manifest Analysis failed'],
          type: 'error',
        });

        setValid(false);
        setAnalysis(undefined);
        setBusy(false);
      } else {
        setToast({
          title: t['Success!'],
          description: t['Analysis complete'],
          type: 'success',
        });
        setValid(true);
        resp.json().then((data) => {
          setAnalysis(data);
          setBusy(false);
        });
      }
    }
  };

  const handleSubmit = async (data: any) => {
    setBusy(true);

    const resp = await fetch(
      `/api/projects/${props.projectSlug}/events/import-manifest`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    if (!resp.ok) {
      setToast({
        title: t['Problem!'],
        description: t['Manifest import failed'],
        type: 'error',
      });

      setValid(false);
      setAnalysis(undefined);
      setBusy(false);
    } else {
      setToast({
        title: t['Success!'],
        description: t['Import complete'],
        type: 'success',
      });
      setValid(true);
      window.location.pathname = `/${lang}/projects/${props.projectSlug}`;
    }
  };

  return (
    <ToastProvider>
      <div className='import-mani-container'>
        {busy && <LoadingOverlay />}
        <div className='av-label-bold import-mani-url-label'>
          {t['IIIF Manifest URL']}
          <div className='import-mani-required'>*</div>
        </div>
        <div className='import-mani-url-input-container'>
          <input
            className='import-mani-url-input'
            type='text'
            onChange={(e) => setManifestUrl(e.target.value)}
          />
          <Button
            className='primary'
            disabled={!manifestUrl || manifestUrl.length === 0}
            onClick={handleAnalyze}
          >
            {t['Analyze']}
          </Button>
        </div>
        {manifestUrl && valid && analysis && (
          <ImportForm
            i18n={props.i18n}
            events={analysis.events}
            manifestURL={manifestUrl}
            onSubmit={handleSubmit}
          />
        )}
      </div>
      <Toast
        content={toast}
        onOpenChange={(open) => !open && setToast(undefined)}
      />
    </ToastProvider>
  );
};
