import type {
  DropdownOption,
  ParseAnnotationResults,
  Translations,
} from '@ty/Types.ts';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Required, ToggleInput } from './index.tsx';
import * as Separator from '@radix-ui/react-separator';
import './Formic.css';
import { ArrowRightIcon, CheckIcon, Cross1Icon } from '@radix-ui/react-icons';
import { parseSpreadsheetData } from '@lib/parse/index.ts';
import { useFormikContext, type FormikContextType } from 'formik';
import { Button, ChevronDownIcon, Table } from '@radix-ui/themes';
import * as Select from '@radix-ui/react-select';

interface BaseFormValues {
  contains_headers: boolean;
}

interface FormValues extends BaseFormValues {
  [key: string]: any;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface TableRowProps {
  header: string;
  example: string;
  importAsOptions: DropdownOption[];
  i18n: Translations;
  index: number;
}

// We have to do some tricky stuff here to make sure we clear
// any existing headers assigned to this index.
const setSelectValue = (
  val: string | undefined,
  index: number,
  ctx: FormikContextType<unknown>
) => {
  const newValues = Object.fromEntries(
    Object.entries((ctx.values as any).headerMap).filter(
      (ent) => ent[1] !== index
    )
  );

  if (val) {
    newValues[val] = index;
  }

  ctx.setFieldValue('headerMap', newValues);
};

const TableRow: React.FC<TableRowProps> = (props) => {
  const ctx = useFormikContext();

  const selectionValue = useMemo(() => {
    const match = Object.entries((ctx.values as any).headerMap).find(
      (ent) => ent[1] === props.index
    );

    if (match) {
      return match[0];
    }

    return undefined;
  }, [(ctx.values as any).headerMap]);

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
          onValueChange={(val) => setSelectValue(val, props.index, ctx)}
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
                      Object.keys((ctx.values as any).headerMap).includes(
                        item.value
                      ) &&
                      (ctx.values as any).headerMap[item.value] !== props.index
                    );
                  }, [ctx.values, item.value]);

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
        {Object.values((ctx.values as any).headerMap).includes(props.index) && (
          <Button
            className='remove-value-button'
            onClick={() => setSelectValue(undefined, props.index, ctx)}
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
}

export const SpreadsheetInput = (props: SpreadsheetInputProps) => {
  const { t } = props.i18n;
  const { setFieldValue, values }: { [key: string]: any; values: FormValues } =
    useFormikContext();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const parseData = useCallback(
    async (file: File, containsHeaders: boolean) => {
      const parsed = await parseSpreadsheetData(file, containsHeaders);

      setFieldValue(props.name, parsed);
    },
    []
  );

  const onFileChange = async (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      await parseData(event.target.files[0], values.contains_headers);
    } else {
      setFieldValue(props.name, null);
    }
  };

  // Re-parse when the user toggles the headers option
  useEffect(() => {
    if (fileInputRef.current?.files && fileInputRef.current?.files.length > 0) {
      // note: `await` is intentionally left off here.
      //       calling async functions in useEffect is ANNOYING.
      parseData(fileInputRef.current?.files[0], values.contains_headers);
    }
  }, [values.contains_headers]);

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
          i18n={props.i18n}
          index={idx}
          importAsOptions={props.importAsOptions}
          key={idx}
        />
      ));
    } else if (firstItem) {
      return firstItem.map((value, idx) => (
        <TableRow
          header={alphabet[idx]}
          example={value}
          i18n={props.i18n}
          index={idx}
          importAsOptions={props.importAsOptions}
          key={idx}
        />
      ));
    }
  }, [values[props.name]]);

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
            onChange={onFileChange}
            ref={fileInputRef}
            type='file'
          />
        </label>
      </div>
      <Separator.Root className='SeparatorRoot' decorative />
      <div className='spreadsheet-input-headers-switch'></div>
      <h2>{t['File configuration']}</h2>
      <ToggleInput
        label={t['Import file contains column headers?']}
        name='contains_headers'
      />
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
    </div>
  );
};
