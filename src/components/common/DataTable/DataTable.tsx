/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Pagination } from "@mui/material";
import "./DataTable.css";

interface DataTableProps {
  rows: any[]; // Array of data rows
  columns: GridColDef[]; // Define columns with GridColDef type for better type safety
  pageSize?: number; // Optional pageSize prop
  checkboxSelection?: boolean; // Enable checkbox selection
  disableSelectionOnClick?: boolean; // Disable selection on click
}

const DataTable: React.FC<DataTableProps> = ({
  rows,
  columns,
  pageSize = 5, // Default pageSize
  checkboxSelection = false,
  disableSelectionOnClick = true,
}) => {
  // Add state for page and page size
  const [currentPage, setCurrentPage] = useState(1); // Start from page 1
  const [pageSizeState, setPageSizeState] = useState(pageSize);

  // Calculate total pages based on rows and page size
  const totalPages = Math.ceil(rows.length / pageSizeState);

  // Handle page change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ): void => {
    setCurrentPage(value);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number): void => {
    setPageSizeState(newPageSize);
    setCurrentPage(1); // Reset to the first page on page size change
  };

  // Calculate the rows to display based on the current page and page size
  const paginatedRows = rows.slice(
    (currentPage - 1) * pageSizeState,
    currentPage * pageSizeState
  );

  return (
    <div
      style={{
        height: "calc(100vh - 250px)",
        width: "100%",
        paddingBottom: "40px",
      }}
    >
      <DataGrid
        headerHeight={45}
        rowHeight={45}
        rows={paginatedRows} // Display paginated rows
        columns={columns.map((col) => ({
          ...col,
          flex: 1,
          resizable: true,
          renderHeader: (params: any) => (
            <span
              style={{
                fontSize: "14px",
                fontFamily: "osSemiBold",
                color: "#0B4D53",
                // height:'45px',
                width:
                  params.colDef.headerName?.toLowerCase() === "actions"
                    ? "100%"
                    : "auto",
                textAlign:
                  params.colDef.headerName?.toLowerCase() === "actions"
                    ? "center"
                    : "left",
              }}
            >
              {params.colDef.headerName}
            </span>
          ),
          headerClassName: "header", // Add a class to the header for custom styles
        }))} // Set flex and resizable
        hideFooter
        hideFooterPagination
        hideFooterSelectedRowCount
        checkboxSelection={checkboxSelection}
        disableSelectionOnClick={disableSelectionOnClick}
        pageSize={pageSizeState} // Set page size
        onPageSizeChange={handlePageSizeChange} // Listen for page size change
        paginationMode="client"
        rowCount={rows.length} // Use total number of rows for pagination calculation
        columnBuffer={2}
        disableColumnMenu
        sx={{
          ":root": {
            ".MuiDataGrid-root": {
              border: "0 !important",
            },
          },
          "& .MuiDataGrid-row": {
            borderBottom: "1px solid #eeeeee90", // Set body rows to light grey
            "& .MuiDataGrid-cell:nth-child(1)": {
              paddingLeft: "20px", // Adjust padding for the first header cell
            },
          },
          "& .MuiDataGrid-columnHeaders": {
            border: "none", // Remove border from column headers
            backgroundColor: "#0B4D5310",
            borderBottom: "1px solid #eeeeee90", // Set body rows to light grey
            "& .MuiDataGrid-columnSeparator": {
              display: "none",
            },
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              width: "100%",
            },

            "& .MuiDataGrid-columnHeaderTitleContainerContent": {
              width: "100%",
            },
          },
          "& .header": {
            "&:nth-child(1)": {
              paddingLeft: "20px", // Adjust padding for the first header cell
            },
            "&:focus": {
              outline: "none", // Remove focus outline
              border: "none",
            },
            border: "none", // Remove border for header cells
          },
          "& .MuiDataGrid-cell": {
            border: "none", // Remove borders from cell
            "&:focus": {
              outline: "none", // Remove focus outline
              border: "none",
            },
          },
          "& .MuiDataGrid-virtualScroller": {
            "& .MuiDataGrid-virtualScrollerContent": {
              height: "auto !important",
            },
          },
        }}
      />
      {/* MUI Pagination Component */}
      <Pagination
        count={totalPages} // Total number of pages
        page={currentPage} // Current page
        onChange={handlePageChange} // Handle page change
        color="primary"
        showFirstButton
        showLastButton
        sx={{
          display: "flex",
          justifyContent: "center",
          padding: "10px",
          fontFamily: "osRegular, sans-serif",
          fontSize: "14px", // Set font size for pagination
          "& .MuiPaginationItem-root": {
            fontSize: "14px", // Apply font size to pagination items
          },
          "& .Mui-selected": {
            backgroundColor: "#0B4D53 !important", // Change background color for the selected page
            color: "#fff !important", // Change text color for the selected page
            fontFamily: "osSemiBold, sans-serif",
          },
          "& .MuiPaginationItem-root:hover": {
            backgroundColor: "#f1f1f1", // Add hover effect to page buttons
          },
          "& .MuiPaginationItem-previousNext": {
            color: "#0B4D53", // Set color for enabled prev/next buttons
          },
          "& .MuiPaginationItem-firstLast": {
            color: "#0B4D53", // Set color for enabled first/last buttons
          },
          "& .MuiPaginationItem-previousNext.Mui-disabled, & .MuiPaginationItem-firstLast.Mui-disabled":
            {
              color: "#BDBDBD", // Set color for disabled prev/next/first/last buttons
            },
        }}
      />
    </div>
  );
};

export default DataTable;
