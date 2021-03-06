import * as React from 'react';
import {useMemo, useState} from 'react';
import {Sort, ExpandChevron} from './icons/Icons';
import ExpandTransition from './ExpandTransition';

type SortValue = string | number | null | undefined;

export type Column = Readonly<{
  className?: string;
  colSpan?: number;
  expandOnClick?: boolean;
  onlyShowForLarge?: boolean;
  onClick?: () => void;
  sortValue: SortValue;
  value: React.ReactNode;
}>;

export type Row = Readonly<{
  className?: string | undefined;
  columns: ReadonlyArray<Column>;
  getExpandedContent?: () => React.ReactNode;
  id: string;
}>;

export type Section = Readonly<{
  title?: string;
  rows: ReadonlyArray<Row>;
}>;

export type Header = Readonly<{
  isSortable?: boolean;
  label: string;
  onlyShowForLarge?: boolean;
  width?: string | number;
}>;

export type Props = Readonly<{
  areRowsExpandable?: boolean;
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

  function changeSortColumn(newSortColumn: number): void {
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
    <table className="table">
      <TableHeaderRow
        areRowsExpandable={!!props.areRowsExpandable}
        headers={props.headers}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onChangeSortColumn={changeSortColumn}
      />
      {sortedData.map((section, index) => (
        <TableSection
          areRowsExpandable={!!props.areRowsExpandable}
          isStriped={!!props.isStriped}
          key={section.title || index}
          section={section}
        />
      ))}
    </table>
  );
}

type TableHeaderRowProps = Readonly<{
  areRowsExpandable: boolean;
  headers: ReadonlyArray<Header>;
  sortColumn: number | null;
  sortOrder: SortOrder;

  onChangeSortColumn: (index: number) => void;
}>;
function TableHeaderRow(props: TableHeaderRowProps) {
  return (
    <thead>
      <tr>
        {props.areRowsExpandable && <th style={{width: 10}}> </th>}
        {props.headers.map((header, index) => {
          const isSortable =
            header.isSortable == null ? true : header.isSortable;
          let className = isSortable ? 'sortable-header' : '';
          if (header.onlyShowForLarge) {
            className += ' d-none d-lg-table-cell';
          }
          return (
            <th
              className={className}
              key={header.label}
              scope="col"
              style={{width: header.width}}
              title={isSortable ? `Sort by ${header.label}` : ''}
              onClick={
                isSortable ? () => props.onChangeSortColumn(index) : undefined
              }>
              {header.label}
              {isSortable && (
                <>
                  &nbsp;&nbsp;
                  <Sort
                    state={
                      props.sortColumn === index
                        ? props.sortOrder
                        : SortOrder.NONE
                    }
                  />
                </>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

type TableSectionProps = Readonly<{
  areRowsExpandable: boolean;
  isStriped: boolean;
  section: Section;
}>;
function TableSection(props: TableSectionProps) {
  const {section} = props;
  return (
    <>
      {section.title && (
        <thead>
          <tr>
            <th colSpan={4}>{section.title}</th>
          </tr>
        </thead>
      )}
      <tbody key={section.title || ''}>
        {section.rows.map((row, rowIndex) => (
          <TableRow
            isExpandable={props.areRowsExpandable}
            isStriped={props.isStriped}
            key={row.id}
            row={row}
            rowIndex={rowIndex}
          />
        ))}
      </tbody>
    </>
  );
}

type TableRowProps = Readonly<{
  isExpandable: boolean;
  isStriped: boolean;
  row: Row;
  rowIndex: number;
}>;
function TableRow(props: TableRowProps) {
  const {row, rowIndex} = props;
  let className = row.className || '';
  if (props.isStriped) {
    className += rowIndex % 2 === 0 ? ' table-row-odd' : '';
  }

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const onToggle = () => setIsExpanded(value => !value);

  return (
    <>
      <tr className={className} key={row.id}>
        {props.isExpandable && row.getExpandedContent && (
          <td className="align-middle expand-cell" onClick={onToggle}>
            <ExpandChevron isExpanded={isExpanded} />
          </td>
        )}
        {row.columns.map((column, colIndex) => {
          let className = 'align-middle';
          if (column.className) {
            className += ' ' + column.className;
          }
          if (column.onlyShowForLarge) {
            className += ' d-none d-lg-table-cell';
          }
          let value = column.value;
          if (column.expandOnClick) {
            value = <div onClick={onToggle}>{value}</div>;
          }
          return (
            <td
              className={className}
              colSpan={column.colSpan}
              onClick={column.onClick}
              key={colIndex}>
              {value}
            </td>
          );
        })}
      </tr>
      {props.isExpandable && (
        <tr
          aria-hidden={!isExpanded}
          className={`dns-detail-expanded ${className}`}>
          <td></td>
          <td colSpan={getColSpanForExpandedRow(row)}>
            <ExpandTransition isExpanded={isExpanded}>
              {row.getExpandedContent && row.getExpandedContent()}
            </ExpandTransition>
          </td>
        </tr>
      )}
    </>
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

function getColSpanForExpandedRow(row: Row): number {
  let colSpan = 0;
  row.columns.forEach(column => {
    colSpan += column.colSpan || 1;
  });
  return colSpan;
}
