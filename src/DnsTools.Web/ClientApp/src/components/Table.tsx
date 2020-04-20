import * as React from 'react';
import {useMemo, useState} from 'react';
import {Sort} from './icons/Icons';

type SortValue = string | number | null | undefined;

export type Column = Readonly<{
  colSpan?: number;
  sortValue: SortValue;
  value: React.ReactNode;
}>;

export type Row = Readonly<{
  className?: string | undefined;
  columns: ReadonlyArray<Column>;
  id: string;
}>;

export type Section = Readonly<{
  title?: string;
  rows: ReadonlyArray<Row>;
}>;

export type Header = Readonly<{
  label: string;
  width?: string | number;
}>;

export type Props = Readonly<{
  defaultSortColumn?: string;
  headers: ReadonlyArray<Header>;
  isStriped?: boolean;
  sections: ReadonlyArray<Section>;
}>;

export enum SortOrder {
  NONE,
  ASC,
  DESC,
}

export default function Table(props: Props) {
  const [sortColumn, setSortColumn] = useState<number | null>(() => {
    if (props.defaultSortColumn == null) {
      return null;
    }
    const index = props.headers.findIndex(
      header => header.label === props.defaultSortColumn,
    );
    return index === -1 ? null : index;
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  function changeSortOrder(newSortColumn: number): void {
    const oldSortColumn = sortColumn;
    if (newSortColumn === oldSortColumn) {
      // Clicking the column it's already sorted by: Flip the order
      setSortOrder(
        sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
      );
    } else {
      // Sorting by a new column
      setSortColumn(newSortColumn);
      setSortOrder(SortOrder.ASC);
    }
  }

  const sortedData = useMemo(() => {
    if (sortColumn == null) {
      return props.sections;
    }
    return props.sections.map(section => ({
      ...section,
      rows: [...section.rows].sort((a, b) => {
        const aValue = getSortValue(a, sortColumn);
        const bValue = getSortValue(b, sortColumn);
        return compare(aValue, bValue, sortOrder);
      }),
    }));
  }, [props.sections, sortColumn, sortOrder]);

  return (
    <table className={`table${props.isStriped ? ' table-striped' : ''}`}>
      <thead>
        <tr>
          {props.headers.map((header, index) => (
            <th
              className="sortable-header"
              key={header.label}
              scope="col"
              style={{width: header.width}}
              title={`Sort by ${header.label}`}
              onClick={() => changeSortOrder(index)}>
              {header.label}&nbsp;&nbsp;
              <Sort state={sortColumn === index ? sortOrder : SortOrder.NONE} />
            </th>
          ))}
        </tr>
      </thead>
      {sortedData.map(section => (
        <>
          {section.title && (
            <thead>
              <tr>
                <th colSpan={4}>{section.title}</th>
              </tr>
            </thead>
          )}
          <tbody key={section.title || ''}>
            {section.rows.map(row => (
              <tr className={row.className} key={row.id}>
                {row.columns.map((column, colIndex) => (
                  <td
                    className="align-middle"
                    colSpan={column.colSpan}
                    key={colIndex}>
                    {column.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </>
      ))}
    </table>
  );
}

function getSortValue(row: Row, index: number): SortValue {
  const column = row.columns[index];
  return column == null ? null : column.sortValue;
}

function compare(a: SortValue, b: SortValue, order: SortOrder): number {
  if (a === b) {
    return 0;
  }
  // Always sort nulls to the end, regardless of ascending/descending
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }

  let result;
  if (typeof a === 'number' && typeof b === 'number') {
    result = a - b;
  } else if (a < b) {
    result = -1;
  } else {
    result = 1;
  }
  return order === SortOrder.DESC ? -result : result;
}
