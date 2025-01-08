/* eslint-disable  @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-floating-promises */

import { useEffect, useState } from "react";
import DataTable from "../../../../../components/common/DataTable/DataTable";
import DefaultButton from "../../../../../components/common/Buttons/DefaultButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import styles from "./Checkpoints.module.scss";
import { Add } from "@mui/icons-material";
import CustomInput from "../../../../../components/common/CustomInputFields/CustomInput";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../../../utils/popupUtils";
import Popup from "../../../../../components/common/Popups/Popup";
import { resetFormData, validateField } from "../../../../../utils/commonUtils";
import CustomDropDown from "../../../../../components/common/CustomInputFields/CustomDropDown";
import CustomDateInput from "../../../../../components/common/CustomInputFields/CustomDateInput";
import {
  addCheckpoints,
  getAttachmentContent,
} from "../../../../../services/ProjectTemplate/ProjectTemplate";
import CircularSpinner from "../../../../../components/common/Loaders/CircularSpinner";

const Checkpoints = ({ value }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isedit, setIsEdit] = useState<boolean>(false);
  const [id, setId] = useState<any | number>(null);

  const toggleAccordion = (): void => {
    setIsOpen(!isOpen);
  };

  const initialPopupController = [
    {
      open: false,
      popupTitle: isedit ? "Update Checkpoint" : "New Checkpoint",
      popupWidth: "900px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Checkpoint added successfully!",
        error: "Something went wrong!",
        successDescription: "",
        errorDescription:
          "An error occured while adding Checkpoint, please try again later.",
        inprogress: "Adding new Checkpoint, please wait...",
      },
    },
  ];
  const [popupController, setPopupController] = useState<any>(
    initialPopupController
  );

  const [formData, setFormData] = useState<any>({
    Checkpoint: {
      value: "",
      isValid: true,
      errorMsg: "Invalid Checkpoint",
      validationRule: { required: true, type: "string" },
    },
    StartDate: {
      value: new Date(),
      isValid: true,
      errorMsg: "Invalid input",
      validationRule: { required: true, type: "date" },
    },
    EndDate: {
      value: "",
      isValid: true,
      errorMsg: "Invalid input",
      validationRule: { required: true, type: "date" },
    },
    Status: {
      value: "",
      isValid: true,
      errorMsg: "Status is required",
      validationRule: { required: true, type: "string" },
    },
  });

  const handleInputChange = (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string = ""
  ): void => {
    setFormData((prevData: any) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        value: value,
        isValid,
        errorMsg: isValid ? "" : errorMsg,
      },
    }));
  };

  const handleSubmit = async (): Promise<any> => {
    let hasErrors = false;

    // Validate each field and update the state with error messages
    const updatedFormData = Object.keys(formData).reduce((acc, key) => {
      const fieldData = formData[key as keyof FormData];
      const { isValid, errorMsg } = validateField(
        key,
        fieldData.value,
        fieldData?.validationRule
      );

      if (!isValid) {
        hasErrors = true;
      }

      return {
        ...acc,
        [key]: {
          ...fieldData,
          isValid,
          errorMsg,
        },
      };
    }, {} as typeof formData);

    setFormData(updatedFormData);
    if (!hasErrors) {
      isedit
        ? await addCheckpoints(
            formData,
            value.id,
            value.projectName,
            isedit,
            id
          )
        : await addCheckpoints(
            formData,
            value.id,
            value.projectName,
            false,
            null
          );

      resetFormData(formData, setFormData);
      togglePopupVisibility(
        setPopupController,
        initialPopupController[0],
        0,
        "close"
      );
    } else {
      console.log("Form contains errors");
    }
  };

  const popupInputs: any = [
    [
      <div key={1}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <CustomInput
            value={formData.Checkpoint.value}
            placeholder="Enter title"
            isValid={formData.Checkpoint.isValid}
            errorMsg={formData.Checkpoint.errorMsg}
            onChange={(e) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                "Checkpoint",
                value,
                formData.Checkpoint.validationRule
              );
              handleInputChange("Checkpoint", value, isValid, errorMsg);
            }}
          />

          <CustomDropDown
            width={"100%"}
            value={formData.Status.value}
            options={["Active", "In Active"]}
            placeholder="Status"
            isValid={formData.Status.isValid}
            errorMsg={formData.Status.errorMsg}
            onChange={(value) => {
              const { isValid, errorMsg } = validateField(
                "Status",
                value,
                formData.Status.validationRule
              );
              handleInputChange("Status", value, isValid, errorMsg);
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div
            style={{ display: "flex", gap: "20px", flexDirection: "column" }}
          >
            <CustomDateInput
              maxWidth="100%"
              minWidth="100%"
              value={formData.StartDate.value}
              label="Start date"
              error={!formData.StartDate.isValid}
              errorMsg={formData.StartDate.errorMsg}
              isDateController={true}
              // minimumDate={new Date()}
              // maximumDate={
              //   formData?.EndDate?.value
              //     ? new Date(formData?.EndDate?.value)
              //     : null
              // }

              onChange={(date: any) => {
                const { isValid, errorMsg } = validateField(
                  "StartDate",
                  date,
                  formData.StartDate.validationRule
                );
                handleInputChange("StartDate", date, isValid, errorMsg);
              }}
            />

            <CustomDateInput
              maxWidth="100%"
              minWidth="100%"
              // value=""
              value={formData.EndDate.value}
              label="End date"
              error={!formData.EndDate.isValid}
              errorMsg={formData.EndDate.errorMsg}
              isDateController={true}
              minimumDate={
                formData?.StartDate?.value
                  ? new Date(formData?.StartDate?.value)
                  : null
              }
              maximumDate={null}
              onChange={(date: any) => {
                const { isValid, errorMsg } = validateField(
                  "EndDate",
                  date,
                  formData.EndDate.validationRule
                );
                handleInputChange("EndDate", date, isValid, errorMsg);
              }}
            />
          </div>
        </div>
      </div>,
    ],
  ];
  const popupActions: any[] = [
    [
      {
        text: "Cancel",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "close"
          );
        },
      },
      {
        text: isedit ? "update" : "Submit",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          handleSubmit();
        },
      },
    ],
    [
      {
        text: "Cancel",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[1],
            1,
            "close"
          );
        },
      },
      {
        text: "Update",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {},
      },
    ],
    [
      {
        text: "Cancel",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[2],
            2,
            "close"
          );
        },
      },
      {
        text: "Delete",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {},
      },
    ],
    [
      {
        text: "Close",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[3],
            3,
            "close"
          );
        },
      },
    ],

    [
      {
        text: "Clear",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[4],
            4,
            "close"
          );
        },
      },
      {
        text: "Apply",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[4],
            4,
            "close"
          );
        },
      },
    ],
  ];
  // const projectData = [
  //   {
  //     id: 1,
  //     Checkpoints: "Project 1",
  //     status: "In Progress",

  //     startDate: "2024-01-01",
  //     endDate: "2024-12-31",
  //   },
  //   {
  //     id: 2,
  //     Checkpoints: "Project 2",
  //     status: "Completed",

  //     startDate: "2023-01-01",
  //     endDate: "2023-12-31",
  //   },
  // ];

  const columns = [
    {
      sortable: true,
      field: "Checkpoint",
      headerName: "Checkpoints",
      width: 170,
    },
    {
      sortable: false,
      field: "StartDate",
      headerName: "startDate",
      width: 170,
    },

    {
      sortable: false,
      field: "EndDate",
      headerName: "endDate",
      width: 150,
    },

    {
      sortable: false,
      field: "Status",
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
        console.log(params, "value");

        return (
          <div>
            <i
              onClick={() => {
                setId(params?.row?.id);
                setFormData({
                  Checkpoint: {
                    value: params?.row?.Checkpoint,
                    isValid: true,
                    errorMsg: "Invalid Checkpoint",
                    validationRule: { required: true, type: "string" },
                  },
                  StartDate: {
                    value: new Date(params?.row?.StartDate),
                    isValid: true,
                    errorMsg: "Invalid input",
                    validationRule: { required: true, type: "date" },
                  },
                  EndDate: {
                    value: new Date(params?.row?.EndDate),
                    isValid: true,
                    errorMsg: "Invalid input",
                    validationRule: { required: true, type: "date" },
                  },
                  Status: {
                    value: params?.row?.Status,
                    isValid: true,
                    errorMsg: "Status is required",
                    validationRule: { required: true, type: "string" },
                  },
                });
                setIsEdit(true);

                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[0],
                  0,
                  "open"
                );
              }}
              className="pi pi-pen-to-square"
              style={{ fontSize: "1.5rem", color: "#E0803D" }}
            ></i>
          </div>
        );
      },
    },
  ];

  const onLoadingFUN = async (): Promise<void> => {
    const fileName = `${value.projectName}.txt`;
    await getAttachmentContent("ProjectDetails", value.id, fileName)
      .then((content: any) => {
        console.log("Retrieved Content:", content);

        // If the content is JSON, parse it
        const checkpoints = JSON.parse(content);

        setCheckpoints([...checkpoints]);
        console.log("Parsed Checkpoints:", checkpoints);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Failed to retrieve attachment:", error);
      });
  };

  useEffect(() => {
    setIsLoading(true);
    onLoadingFUN();
  }, []);
  return (
    <div>
      {isLoading ? (
        <CircularSpinner />
      ) : (
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
                    onClick={(_) => {
                      resetFormData(formData, setFormData);
                      setIsEdit(false);
                      setId(null);
                      togglePopupVisibility(
                        setPopupController,
                        initialPopupController[0],
                        0,
                        "open"
                      );
                    }}
                  />
                </div>
              </div>
              <DataTable
                rows={checkpoints || []}
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
      )}

      {popupController?.map((popupData: any, index: number) => (
        <Popup
          key={index}
          isLoading={popupData?.isLoading}
          messages={popupData?.messages}
          resetPopup={() => {
            setPopupController((prev: any): any => {
              resetPopupController(prev, index, true);
            });
          }}
          PopupType={popupData.popupType}
          onHide={() => {
            resetFormData(formData, setFormData);
            togglePopupVisibility(
              setPopupController,
              initialPopupController[index],
              index,
              "close"
            );
            if (popupData?.isLoading?.success) {
            }
          }}
          popupTitle={
            popupData.popupType !== "confimation" && popupData.popupTitle
          }
          popupActions={popupActions[index]}
          visibility={popupData.open}
          content={popupInputs[index]}
          popupWidth={popupData.popupWidth}
          defaultCloseBtn={popupData.defaultCloseBtn || false}
          confirmationTitle={
            popupData?.confirmationTitle
            // popupData.popupType !== "custom" ? popupData.popupTitle : ""
          }
          popupHeight={index === 0 ? true : false}
          noActionBtn={true}
        />
      ))}
    </div>
  );
};
export default Checkpoints;
