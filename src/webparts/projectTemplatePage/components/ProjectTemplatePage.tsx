/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-empty-function */
/* eslint-disable   @typescript-eslint/no-use-before-define */

import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import styles from "./ProjectTemplatePage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
import { Add } from "@mui/icons-material";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import DataTable from "../../../components/common/DataTable/DataTable";
import { Avatar } from "primereact/avatar";
import ViewComponent from "./ViewComponents/ViewComponet";
import Popup from "../../../components/common/Popups/Popup";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import { useDispatch } from "react-redux";

import { resetFormData, validateField } from "../../../utils/commonUtils";
import CustomPeoplePicker from "../../../components/common/CustomInputFields/CustomPeoplePicker";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import { setMainSPContext } from "../../../redux/features/MainSPContextSlice";
import SpServices from "../../../services/SPServices/SpServices";
import moment from "moment";

const ProjectTemplatePage = (props: any): JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const dispatch = useDispatch();

  const projectData = [
    {
      id: 1,
      projectName: "Project 1",
      Status: "In Progress",
      contractNo: "C-00012",
      projectAdmin: {
        id: 1,
        name: "kumaresan",
        email: "kumaresan@technorucs.com",
      },
      location: "New York",
      clientName: "Courtney Henry",
      address: "123 Main St, NY",
      team: [
        { id: 1, name: "John Doe", email: "kumaresan@technorucs.com" },
        { id: 2, name: "Jane Smith", email: "kumaresan@technorucs.com" },
      ], // People Picker: Array of selected team members
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      description: "Project 1 description",
      images:
        "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsX29mZmljZV80X3Bob3RvX29mX2FfY2l0eV9idWlsZGluZ19pc29sYXRlZF9vbl9hX3doaXRlX18zOGE1NjFhNC1iYzY0LTQwMGUtOTYyYS1lOTczMTU1NjhlODVfMS5wbmc.png",
    },
    {
      id: 2,
      projectName: "Project 2",
      status: "Completed",
      contractNo: "C-00013",
      projectAdmin: "Mitchell",
      location: "Los Angeles",
      clientName: "Esther Howard",
      address: "456 Elm St, LA",
      team: [
        { id: 3, name: "Mike Johnson" },
        { id: 4, name: "Emily Davis" },
      ],
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      description: "Project 2 description",
      images:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlsAVTh5E64YxZakNrK4EnEI-0wRE9tHYTTg&s",
    },
  ];

  const columns = [
    {
      sortable: true,
      field: "projectName",
      headerName: "projectName",
      width: 170,
    },
    {
      sortable: false,
      field: "contractNo",
      headerName: "Contract no",
      width: 170,
    },

    {
      sortable: false,
      field: "projectAdmin.name",
      headerName: "projectAdmin",
      width: 150,
      renderCell: (params: any) => {
        return (
          <div>
            <Avatar
              image={`/_layouts/15/userphoto.aspx?size=S&username=${
                params.row.projectAdmin.email || params.Email
              }`}
              shape="circle"
              size="normal"
              style={{
                margin: "0 !important",
                border: "3px solid #fff",
                width: "25px",
                height: "25px",
                // marginLeft: data?.length > 1 ? "-10px" : "0",
                // position: "absolute",
                // left: `${positionLeft ? positionLeft * index : 0}px`,
                // top: `${positionTop ? positionTop : 0}px`,
                // zIndex: index,
              }}
              label={params.row.projectAdmin.name}
            />
          </div>
        );
      },
    },

    {
      sortable: false,
      field: "clientName",
      headerName: "clientName",
      width: 150,
    },

    {
      sortable: false,
      field: "team.name",
      headerName: "Team",
      width: 200,
      renderCell: (params: any) => {
        const teamMembers = params?.row.team || []; // Assume 'team' is an array of team member objects

        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            {teamMembers.map((member: any, index: number) => (
              <Avatar
                key={index}
                image={`/_layouts/15/userphoto.aspx?size=S&username=${
                  member.email || member.Email
                }`}
                shape="circle"
                size="normal"
                style={{
                  margin: "0",
                  border: "3px solid #fff",
                  width: "25px",
                  height: "25px",
                  marginLeft: index > 0 ? "-10px" : "0", // Overlap avatars slightly
                  zIndex: teamMembers.length - index, // Ensure higher index appears on top
                }}
                label={member.name}
              />
            ))}
          </div>
        );
      },
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
        return (
          <div>
            <i
              onClick={() => {
                setIsEdit(true);
                setSelectedProject(params.row);
              }}
              className="pi pi-pen-to-square"
              style={{ fontSize: "1.5rem", color: "#E0803D" }}
            ></i>
          </div>
        );
      },
    },
  ];

  const initialPopupController: any = [
    {
      open: false,
      popupTitle: "Add New project",
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
        success: "New Project added successfully!",
        error: "Something went wrong!",
        successDescription: "The new 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding new project, please try again later.",
        inprogress: "Adding new Project, please wait...",
      },
    },
  ];

  const [popupController, setPopupController] = useState<any>(
    initialPopupController
  );
  const [formData, setFormData] = useState<any>({
    projectName: {
      value: "",
      isValid: true,
      errorMsg: "Invalid Project Name",
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
    contractNo: {
      value: null,
      isValid: true,
      errorMsg: "Invalid ContractNo",
      validationRule: { required: true, type: "string" },
    },
    Description: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: true, type: "string" },
    },

    projectAdmin: {
      ID: null,
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "array" },
    },
    clientName: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "string" },
    },
    location: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "string" },
    },
    address: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "string" },
    },
    team: {
      value: [],
      isValid: true,
      errorMsg: "This field is required",
      validationRule: { required: false, type: "array" },
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
            value={formData.projectName.value}
            placeholder="Enter title"
            isValid={formData.projectName.isValid}
            errorMsg={formData.projectName.errorMsg}
            onChange={(e) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                "projectName",
                value,
                formData.projectName.validationRule
              );
              handleInputChange("projectName", value, isValid, errorMsg);
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

          <CustomInput
            value={formData.contractNo.value}
            placeholder="Enter contractNo"
            isValid={formData.contractNo.isValid}
            errorMsg={formData.contractNo.errorMsg}
            onChange={(e) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                "contractNo",
                value,
                formData.contractNo.validationRule
              );
              handleInputChange("contractNo", value, isValid, errorMsg);
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
          <div style={{ display: "flex", gap: "20px" }}>
            <div>
              <div style={{ width: "100%" }}>
                <CustomPeoplePicker
                  labelText="projectAdmin"
                  isValid={formData.projectAdmin.isValid}
                  errorMsg={formData.projectAdmin.errorMsg}
                  // selectedItem={[formData.SendTowards.value]}
                  selectedItem={[formData.projectAdmin.value]}
                  onChange={(item: any) => {
                    const value = item?.[0];
                    const { isValid, errorMsg } = validateField(
                      "projectAdmin",
                      item,
                      formData.projectAdmin.validationRule
                    );
                    handleInputChange("projectAdmin", value, isValid, errorMsg);
                  }}
                />
              </div>
              <CustomInput
                value={formData.clientName.value}
                placeholder="Enter clientName"
                isValid={formData.clientName.isValid}
                errorMsg={formData.clientName.errorMsg}
                onChange={(e) => {
                  const value = e.trimStart();
                  const { isValid, errorMsg } = validateField(
                    "clientName",
                    value,
                    formData.clientName.validationRule
                  );
                  handleInputChange("clientName", value, isValid, errorMsg);
                }}
              />
            </div>

            <div>
              <CustomDropDown
                width={"100%"}
                value={formData.location.value}
                options={["india", "USA", "UK"]}
                placeholder="location"
                isValid={formData.location.isValid}
                errorMsg={formData.location.errorMsg}
                onChange={(value) => {
                  const { isValid, errorMsg } = validateField(
                    "location",
                    value,
                    formData.location.validationRule
                  );
                  handleInputChange("location", value, isValid, errorMsg);
                }}
              />

              <div style={{ width: "100%" }}>
                <CustomPeoplePicker
                  labelText="Team"
                  isValid={formData.team.isValid}
                  errorMsg={formData.team.errorMsg}
                  selectedItem={[formData.team.value]}
                  onChange={(item: any) => {
                    const value = item?.[0];
                    const { isValid, errorMsg } = validateField(
                      "team",
                      item,
                      formData.team.validationRule
                    );
                    handleInputChange("team", value, isValid, errorMsg);
                  }}
                />
              </div>
            </div>
          </div>

          <FloatingLabelTextarea
            textAreaWidth={"100%"}
            customBorderColor="#0B4D53"
            readOnly
            value={formData.address.value}
            placeholder="Address"
            rows={6}
            isValid={formData?.address?.isValid}
            errorMsg={formData?.address.errorMsg}
            noBorderInput={false}
            onChange={(e: any) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                "address",
                value,
                formData?.address?.validationRule
              );
              handleInputChange("address", value, isValid, errorMsg);
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

          <FloatingLabelTextarea
            textAreaWidth={"100%"}
            customBorderColor="#0B4D53"
            readOnly
            value={formData.Description.value}
            placeholder="Description"
            rows={6}
            isValid={formData?.Description?.isValid}
            errorMsg={formData?.Description.errorMsg}
            noBorderInput={false}
            onChange={(e: any) => {
              const value = e.trimStart();
              const { isValid, errorMsg } = validateField(
                "Description",
                value,
                formData?.Description?.validationRule
              );
              handleInputChange("Description", value, isValid, errorMsg);
            }}
          />
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
        text: "Submit",
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
      handleAddNewProject();
    } else {
      console.log("Form contains errors");
    }
  };

  const handleAddNewProject = async (): Promise<void> => {
    debugger;
    SpServices.SPAddItem({
      Listname: "ProjectDetails",
      RequestJSON: {
        Title: formData.projectName.value,
        Status: formData.Status.value,
        ContractNo: formData.contractNo.value,
        ProjectAdminId: formData.projectAdmin.value?.id,
        ClientName: formData.clientName.value,
        Location: formData.location.value,
        Address: formData.address.value,
        TeamId: formData.team.value?.id,
        StartDate: moment(formData.StartDate.value) || "",
        EndDate: moment(formData.EndDate.value) || "",
        ProjectDescription: formData.Description.value,
      },
    })
      .then((res: any) => {
        alert("Project added successfully");
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const onLoadingFUN = async (): Promise<void> => {
    setIsLoading(false);
    dispatch(setMainSPContext(props?.context));
  };

  useEffect(() => {
    onLoadingFUN();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : isEdit ? (
        <div>
          <ViewComponent selectedProject={selectedProject} />
        </div>
      ) : (
        // <div className={styles.LoaderContainer}>COMING SOON...</div>
        <>
          <div className={styles.headerContainer}>
            <div className={styles.leftSection}>
              <i
                className="pi pi-arrow-circle-left"
                style={{ fontSize: "1.5rem", color: "#E0803D" }}
              />
              <p>Project Template</p>
            </div>
            <div className={styles.rightSection}>
              <CustomDropDown
                value={"All"}
                options={["All", "Active", "inActive"]}
                placeholder="Category"
                onChange={(value: any) => {}}
                width="180px"
                floatingLabel={false}
                size="SM"
              />
              <CustomInput
                noErrorMsg
                value={""}
                placeholder="Search"
                onChange={(value: any) => {}}
                size="SM"
                secWidth="180px"
              />

              <DefaultButton
                text="New Project"
                btnType="primaryGreen"
                startIcon={<Add />}
                onClick={(_) => {
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

          <div>
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
        </>
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

export default ProjectTemplatePage;
