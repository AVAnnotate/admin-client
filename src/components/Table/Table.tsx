import { Button, Table as RadixTable } from '@radix-ui/themes';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { SortAlphaDown, SortAlphaUp } from 'react-bootstrap-icons';

import './Table.css'
import React from 'react';
import { useCallback, useMemo, useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import type { MeatballMenuItem } from '@ty/ui.ts';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';

interface Row {
  title: string,
  property: string | ((...args: any) => string),
  sortable?: boolean
}

interface Props {
  emptyText?: string;
  title?: string;
  showHeaderRow?: boolean;
  items: { [key: string]: any }[],
  rows: Row[]
  searchAttribute?: string;
  headerButtons?: {
    label: string;
    icon: React.FC<any>;
    variant?: 'solid' | 'outline'
  }[],
  rowButtons?: MeatballMenuItem[]
}

interface Sort {
  direction: 'asc' | 'desc';
  row: Row;
}

const getCellValue = (item: any, row: Row) => {
  if (typeof row.property === 'string') {
    return item[row.property as keyof typeof row]
  }

  return row.property(item)
}

export const Table: React.FC<Props> = ({
  headerButtons,
  emptyText,
  title,
  items,
  rows,
  searchAttribute,
  rowButtons,
  showHeaderRow = true
}) => {
  const [currentSort, setCurrentSort] = useState<Sort>({ direction: 'asc', row: rows[0] });
  const [searchQuery, setSearchQuery] = useState<null | string>(null);

  const updateSearchQuery = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.currentTarget.value

    if (!value) {
      setSearchQuery(null)
    } else {
      setSearchQuery(value)
    }
  }, [])

  // Suppress the sort button if no rows are sortable
  const sortableRows = useMemo(() => rows.filter(row => row.sortable), rows)

  // Apply searching, sorting, and whatever other filtering is needed
  const sortedItems = useMemo(() => {
    let result = items

    if (searchAttribute && searchQuery) {
      result = items.filter(item => item[searchAttribute].toLowerCase().includes(searchQuery.toLowerCase()))
    }

    result = result.sort((a: any, b: any) => {
      const aValue = getCellValue(a, currentSort.row)
      const bValue = getCellValue(b, currentSort.row)

      if (aValue > bValue) {
        return currentSort.direction === 'asc'
          ? 1
          : -1
      } else if (aValue < bValue) {
        return currentSort.direction === 'asc'
          ? -1
          : 1
      }

      return 0
    })

    return result
  }, [items, currentSort, searchQuery])

  return (
    <div>
      <div className='table-header'>
        {title && <span className='table-title'>{title}</span>}
        <div className='right-header'>
          {sortableRows.length > 0 && (
            <Dropdown.Root>
              <Dropdown.Trigger className='sort-button'>
                {currentSort.direction === 'asc'
                  ? <SortAlphaUp color='black' />
                  : <SortAlphaDown color='black' />}
                <span>{currentSort.row.title}</span>
                <ChevronDownIcon />
              </Dropdown.Trigger>
              <Dropdown.Content className='dropdown-content'>
                {sortableRows.map(row => (
                  <React.Fragment key={row.title}>
                    <Dropdown.Item
                      className='dropdown-item'
                      onClick={() => setCurrentSort({
                        row,
                        direction: 'asc'
                      })}
                    >
                      <SortAlphaUp />
                      {row.title}
                    </Dropdown.Item>
                    <Dropdown.Item
                      className='dropdown-item'
                      onClick={() => setCurrentSort({
                        row,
                        direction: 'desc'
                      })}
                    >
                      <SortAlphaDown />
                      {row.title}
                    </Dropdown.Item>
                  </React.Fragment>
                ))}
              </Dropdown.Content>
            </Dropdown.Root>
          )}
          {searchAttribute && (
            <div className='table-search'>
              <input
                className='table-search-box'
                onChange={updateSearchQuery}
              />
              <MagnifyingGlassIcon className='table-search-icon' />
            </div>
          )}
          {headerButtons && (
            headerButtons.map(but => (
              <Button
                className={but.variant || 'primary'}
                key={but.label}
                variant={but.variant}
              >
                <but.icon />
                {but.label}
              </Button>
            ))
          )}
        </div>
      </div>
      <RadixTable.Root variant='surface'>
        <RadixTable.Header>
          {showHeaderRow && (
            <RadixTable.Row>
              {rows.map(row => (
                <RadixTable.ColumnHeaderCell key={row.title}>
                  {row.title}
                </RadixTable.ColumnHeaderCell>
              ))}
            </RadixTable.Row>
          )}
        </RadixTable.Header>
        {sortedItems.length > 0
          ? (
            <RadixTable.Body>
              {sortedItems.map((item, idx) => (
                <RadixTable.Row key={idx}>
                  {rows.map((row, rowIndex) => (
                    <RadixTable.Cell key={rowIndex}>
                      {getCellValue(item, row)}
                    </RadixTable.Cell>
                  ))}
                  {rowButtons && (
                    <RadixTable.Cell>
                      <MeatballMenu buttons={rowButtons} row={item} />
                    </RadixTable.Cell>
                  )}
                </RadixTable.Row>
              ))}
            </RadixTable.Body>
          )
          : <p className='table-empty-text'>{emptyText}</p>}
      </RadixTable.Root>
    </div>
  )
}
