import { mapAnnotationData, parseSpreadsheetData } from '@lib/parse/index.ts';
import './UploadTestApp.css';
import { useState } from 'react';
import type { AnnotationEntry, ParseAnnotationResults } from '@ty/Types.ts';
import { v4 as uuidv4 } from 'uuid';

export const UploadTestApp = (_props: any) => {
  const [output, setOutput] = useState<ParseAnnotationResults | undefined>();
  const [map, setMap] = useState<AnnotationEntry[]>([]);

  const handleParse = async () => {
    const selected: HTMLInputElement | null = document.getElementById(
      'file-selector'
    ) as HTMLInputElement;

    if (selected) {
      const file = selected.files ? selected.files[0] : undefined;

      if (file) {
        const results = await parseSpreadsheetData(file, true);

        setOutput(results);
      }
    }
  };

  const handleMap = () => {
    if (output) {
      const results = mapAnnotationData(
        output.data,
        {
          start_time: 0,
          end_time: 1,
          annotation: 2,
          tags: 3,
        },
        { tagGroups: [], tags: [] }
      ).map((anno) => ({ ...anno, uuid: uuidv4() }));

      setMap(results);
    }
  };

  return (
    <div className='upload-test-container'>
      <div className='centered'>
        <h1>Upload Test</h1>
      </div>

      <div className='centered'>
        <h2>XLSX</h2>
        <input type='file' id='file-selector' />
      </div>

      <div className='centered'>
        <button onClick={handleParse}>Parse</button>
        <button onClick={handleMap}>Map</button>
      </div>

      <div className='centered'>
        <h2>Results</h2>
      </div>
      <div className='output-container'>
        <div className='upload-test-output'>
          <pre className='centered results'>
            {output ? JSON.stringify(output, null, 4) : ''}
          </pre>
        </div>
        <div className='upload-test-output'>
          <pre className='centered results'>
            {map ? JSON.stringify(map, null, 2) : ''}
          </pre>
        </div>
      </div>
    </div>
  );
};
