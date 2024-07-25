import type {
  DropdownOption,
  ParseAnnotationResults,
  Translations,
} from '@ty/Types.ts';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Required } from '../index.tsx';
import * as Separator from '@radix-ui/react-separator';
import '../Formic.css';
import { ArrowRightIcon, CheckIcon, Cross1Icon } from '@radix-ui/react-icons';
import { parseSpreadsheetData } from '@lib/parse/index.ts';
import { useFormikContext } from 'formik';
import { Button, ChevronDownIcon, Table } from '@radix-ui/themes';
import * as Select from '@radix-ui/react-select';
import * as Switch from '@radix-ui/react-switch';
import { SpreadsheetInputContext } from './SpreadsheetInputContext.tsx';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface TableRowProps {
  header: string;
  example: string;
  importAsOptions: DropdownOption[];
  i18n: Translations;
  index: number;
  headerMap: any;
  setHeaderMap: (val: any) => void;
}

// We have to do some tricky stuff here to make sure we clear
// any existing headers assigned to this index.
const setSelectValue = (
  val: string | undefined,
  index: number,
  headerMap: any,
  setHeaderMap: (val: any) => void
) => {
  const newValues = Object.fromEntries(
    Object.entries(headerMap).filter((ent: any) => ent[1] !== index)
  );

  if (val) {
    newValues[val] = index;
  }

  setHeaderMap(newValues);
};

const TableRow: React.FC<TableRowProps> = (props) => {
  const selectionValue = useMemo(() => {
    const match = Object.entries(props.headerMap).find(
      (ent) => ent[1] === props.index
    );

    if (match) {
      return match[0];
    }

    return undefined;
  }, [props.headerMap]);

  return (
    <Table.Row>
      <Table.RowHeaderCell>{props.header}</Table.RowHeaderCell>
      <Table.Cell className='preview-data-cell'>
        <span>{props.example}</span>
        <ArrowRightIcon />
      </Table.Cell>
      <Table.Cell className='import-as-cell'>
        <Select.Root
          // Without this key prop, the Select won't re-render when
          // the value is set to undefined.
          key={selectionValue}
          onValueChange={(val) =>
            setSelectValue(
              val,
              props.index,
              props.headerMap,
              props.setHeaderMap
            )
          }
          value={selectionValue}
        >
          <Select.Trigger className='select-trigger'>
            <Select.Value placeholder={props.i18n.t['Ignore this field']} />
            <Select.Icon>
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className='select-content' position='popper'>
              <Select.Viewport className='select-viewport'>
                {props.importAsOptions.map((item) => {
                  const disabled = useMemo(() => {
                    return (
                      Object.keys(props.headerMap).includes(item.value) &&
                      props.headerMap[item.value] !== props.index
                    );
                  }, [props.headerMap, item.value]);

                  return (
                    <Select.Item
                      className='select-item'
                      disabled={disabled}
                      key={item.value}
                      value={item.value}
                    >
                      <Select.ItemText>
                        {item.label}
                        {item.required && !disabled && (
                          <span className='required-asterisk'>*</span>
                        )}
                      </Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  );
                })}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        {Object.values(props.headerMap).includes(props.index) && (
          <Button
            className='remove-value-button'
            onClick={() =>
              setSelectValue(
                undefined,
                props.index,
                props.headerMap,
                props.setHeaderMap
              )
            }
            type='button'
            variant='ghost'
          >
            <Cross1Icon />
          </Button>
        )}
      </Table.Cell>
    </Table.Row>
  );
};

interface SpreadsheetInputProps {
  accept?: string;
  label?: string;
  helperText?: string;
  i18n: Translations;
  name: string;
  importAsOptions: DropdownOption[];
  isValid?(valid: boolean): void;
}

export const SpreadsheetInput = (props: SpreadsheetInputProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [containsHeaders, setContainsHeaders] = useState(true);
  const [displayPreview, setDisplayPreview] = useState(false);

  const { headerMap, setHeaderMap, requiredFieldsSet, setRequiredFieldsSet } =
    useContext(SpreadsheetInputContext);

  const { t } = props.i18n;

  const { setFieldValue, values }: { [key: string]: any; values: any } =
    useFormikContext();

  useEffect(() => {
    const requiredFields = props.importAsOptions.filter((f) => f.required);
    const selectedFields = Object.keys(headerMap);

    setRequiredFieldsSet(
      requiredFields.filter((f) => !selectedFields.includes(f.value)).length ===
        0
    );
  }, [values, headerMap]);

  const parseData = useCallback(
    async (file: File) => {
      const parsed = await parseSpreadsheetData(file, containsHeaders);

      setDisplayPreview(false);
      setFieldValue(props.name, parsed);
    },
    [containsHeaders]
  );

  useEffect(() => {
    const handleFile = async () => {
      if (file) {
        await parseData(file);
      } else {
        setFieldValue(props.name, null);
      }
    };

    handleFile();
  }, [file, containsHeaders]);

  const tableRows = useMemo(() => {
    const headers = (values[props.name] as ParseAnnotationResults)?.headers;
    const data = (values[props.name] as ParseAnnotationResults)?.data;
    const firstItem =
      Array.isArray(data) && data.length > 0 ? (data[0] as string[]) : null;

    if (Array.isArray(headers) && headers.length > 0 && firstItem) {
      return headers.map((fieldName, idx) => (
        <TableRow
          header={fieldName}
          example={firstItem[idx]}
          index={idx}
          key={idx}
          headerMap={headerMap}
          setHeaderMap={setHeaderMap}
          importAsOptions={props.importAsOptions}
          i18n={props.i18n}
        />
      ));
    } else if (firstItem) {
      return firstItem.map((value, idx) => (
        <TableRow
          header={alphabet[idx]}
          example={value}
          index={idx}
          key={idx}
          headerMap={headerMap}
          setHeaderMap={setHeaderMap}
          importAsOptions={props.importAsOptions}
          i18n={props.i18n}
        />
      ));
    }
  }, [values[props.name], headerMap]);

  if (props.isValid) {
    props.isValid(!!file && displayPreview);
  }
  return (
    <div className='formic-spreadsheet-input'>
      {props.label && (
        <div className='av-label-bold formic-form-label'>
          {props.label}
          <Required />
        </div>
      )}
      {props.helperText && (
        <div className='av-label formic-form-helper-text'>
          {props.helperText}
        </div>
      )}
      <div className='file-input-body'>
        <label className='av-label-bold formic-form-label'>
          {/* Styling a span like a button because an actual button
              won't trigger the upload dialog */}
          <div className='file-input-top-bar'>
            <span className='choose-file-button'>{t['choose file']}</span>
            {values[props.name] ? (
              <div className='file-input-done'>
                <CheckIcon height={16} width={16} />
                <span>{t['done']}</span>
              </div>
            ) : (
              <span>{t['No file selected']}</span>
            )}
          </div>
          <input
            accept={props.accept}
            className='formic-spreadsheet-input-el'
            onChange={(ev) =>
              setFile(
                ev.target.files && ev.target.files.length > 0
                  ? ev.target.files[0]
                  : null
              )
            }
            type='file'
          />
        </label>
      </div>
      {file && (
        <>
          <Separator.Root className='SeparatorRoot' decorative />
          <div className='spreadsheet-input-headers-switch'></div>
          <h2>{t['File configuration']}</h2>
          <div className='options-row'>
            <div>
              <div className='av-label-bold formic-form-label'>
                {t['Import file contains column headers?']}
              </div>
              {props.helperText && (
                <div className='av-label formic-form-helper-text'>
                  {props.helperText}
                </div>
              )}
              <Switch.Root
                checked={containsHeaders}
                onCheckedChange={(checked) => setContainsHeaders(checked)}
                className='formic-toggle-switch'
              >
                <CheckIcon className='formic-toggle-switch-icon' />
                <Switch.Thumb className='formic-toggle-switch-thumb' />
              </Switch.Root>
            </div>
            <Button
              className='formic-spreadsheet-display-preview-button primary'
              disabled={!requiredFieldsSet}
              onClick={() => setDisplayPreview(!displayPreview)}
              type='button'
            >
              {displayPreview ? t['Undo'] : t['import']}
            </Button>
          </div>
          {displayPreview && (
            <Table.Root className='spreadsheet-preview-table'>
              <Table.Header className='spreadsheet-input-table-header'>
                <Table.Row className='spreadsheet-input-table-row'>
                  {props.importAsOptions.map((opt) => (
                    <Table.ColumnHeaderCell key={opt.value}>
                      {opt.label}
                    </Table.ColumnHeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(values as any)[props.name].data.map(
                  (item: any, idx: number) => (
                    <Table.Row key={idx}>
                      {props.importAsOptions.map((opt) => (
                        <Table.Cell key={opt.value}>
                          {item[headerMap[opt.value]]}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  )
                )}
              </Table.Body>
            </Table.Root>
          )}
          {!displayPreview && (
            <Table.Root className='spreadsheet-input-table'>
              <Table.Header className='spreadsheet-input-table-header'>
                <Table.Row className='spreadsheet-input-table-row'>
                  <Table.ColumnHeaderCell className='spreadsheet-input-table-column'>
                    {t['Column']}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className='spreadsheet-input-table-column'>
                    {t['Preview Data']}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className='spreadsheet-input-table-column'>
                    {t['Import As']}
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>{tableRows}</Table.Body>
            </Table.Root>
          )}
        </>
      )}
    </div>
  );
};
