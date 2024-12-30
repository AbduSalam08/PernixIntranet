/* eslint-disable  @typescript-eslint/no-empty-function */

import { useState } from "react";
import DataTable from "../../../../../components/common/DataTable/DataTable";
import DefaultButton from "../../../../../components/common/Buttons/DefaultButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import styles from "./Checkpoints.module.scss";
import { Add } from "@mui/icons-material";
import CustomInput from "../../../../../components/common/CustomInputFields/CustomInput";

const Checkpoints = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = (): void => {
    setIsOpen(!isOpen);
  };

  const projectData = [
    {
      id: 1,
      Checkpoints: "Project 1",
      status: "In Progress",

      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
    {
      id: 2,
      Checkpoints: "Project 2",
      status: "Completed",

      startDate: "2023-01-01",
      endDate: "2023-12-31",
    },
  ];

  const columns = [
    {
      sortable: true,
      field: "Checkpoints",
      headerName: "Checkpoints",
      width: 170,
    },
    {
      sortable: false,
      field: "startDate",
      headerName: "startDate",
      width: 170,
    },

    {
      sortable: false,
      field: "endDate",
      headerName: "endDate",
      width: 150,
    },

    {
      sortable: false,
      field: "status",
      headerName: "Status",
      width: 200,
    },

    {
      sortable: false,
      // field: "action",
      field: "",
      headerName: "Action",
      width: 100,
      renderCell: (params: any) => {
        return (
          <div>
            <i
              onClick={() => {}}
              className="pi pi-pen-to-square"
              style={{ fontSize: "1.5rem", color: "#E0803D" }}
            ></i>
          </div>
        );
      },
    },
  ];
  return (
    <div>
      <div className={styles.accordion}>
        <div className={styles.accordionheader} onClick={toggleAccordion}>
          <p className={styles.accordionheading}>Checkpoints</p>
          <DefaultButton
            text={isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            btnType="primaryGreen"
            onlyIcon
          />
          {/* <span className="accordion-icon">{isOpen ? "-" : "+"}</span> */}
        </div>
        {isOpen && (
          <div className={styles.accordioncontent}>
            <div className={styles.headerContainer}>
              <div className={styles.leftSection}>
                {/* <i
                  className="pi pi-arrow-circle-left"
                  style={{ fontSize: "1.5rem", color: "#E0803D" }}
                /> */}
                <p>Checkpoint Details</p>
              </div>
              <div className={styles.rightSection}>
                <CustomInput
                  noErrorMsg
                  value={""}
                  placeholder="Search"
                  onChange={(value: any) => {}}
                  size="SM"
                  secWidth="180px"
                />

                <DefaultButton
                  text="Add New"
                  btnType="primaryGreen"
                  startIcon={<Add />}
                  onClick={(_) => {}}
                />
              </div>
            </div>
            <DataTable
              rows={projectData || []}
              // rows={dataGridProps?.sortedBy==="Asc (Old)"? currentRoleBasedData?.data:dataGridProps?.sortedBy==="Desc (Latest)"?DescData:[]}
              columns={columns}
              emptyMessage="No results found!"
              // isLoading={HelpDeskTicktesData?.isLoading}
              pageSize={10}
              headerBgColor={"#e5e9e570"}
              checkboxSelection={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default Checkpoints;
