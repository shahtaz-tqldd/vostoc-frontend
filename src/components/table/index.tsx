import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Skeleton } from "../ui/skeleton";
import { FilterBar } from "./filter";
import type { FilterSelect } from "./filter";
import type { FilterDate } from "./filter";
import { Pagination } from "./pagination";
import NoDataFound from "../layout/NoDataFound";

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => ReactNode;
}

type TableFilters = {
  search?: {
    value: string;
    placeholder?: string;
    onChange: (v: string) => void;
  };
  selects?: FilterSelect[];
  date?: FilterDate;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
};

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  description?: string;
  filters?: TableFilters;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  totalItems?: number;
  isLoading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  title,
  description,
  filters,
  currentPage,
  totalPages,
  setCurrentPage,
  totalItems = 0,
  isLoading = false,
}: DataTableProps<T>) {
  const skeletonRows = 6;

  return (
    <>
      <Card>
        <div className="flex justify-between">
          {(title || description) && (
            <CardHeader>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
          )}
          {filters && (
            <FilterBar
              className={filters.className ?? "pt-2"}
              search={filters.search}
              selects={filters.selects}
              date={filters.date}
              onReset={filters.onReset}
              resetLabel={filters.resetLabel}
            />
          )}
        </div>

        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={String(column.accessorKey)}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-row-${rowIndex}`}>
                    {columns.map((column, colIndex) => (
                      <TableCell key={`${String(column.accessorKey)}-${colIndex}`}>
                        <Skeleton className="h-4 w-full max-w-[220px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!isLoading && !totalItems && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="!py-14">
                    <NoDataFound />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                data.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={String(column.accessorKey)}>
                        {column.cell
                          ? column.cell(row)
                          : String(row[column.accessorKey])}{" "}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-4"
      />
    </>
  );
}
