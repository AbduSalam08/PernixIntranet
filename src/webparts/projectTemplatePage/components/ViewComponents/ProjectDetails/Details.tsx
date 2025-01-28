/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-empty-function */
/* eslint-disable   @typescript-eslint/no-use-before-define */

import { Add } from "@mui/icons-material";
import DefaultButton from "../../../../../components/common/Buttons/DefaultButton";
import styles from "./Details.module.scss";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import PersonIcon from "@mui/icons-material/Person";
import PlaceIcon from "@mui/icons-material/Place";
// import GroupsIcon from "@mui/icons-material/Groups";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Avatar } from "primereact/avatar";
import InfoIcon from "@mui/icons-material/Info";
import Popup from "../../../../../components/common/Popups/Popup";
import { useEffect, useState } from "react";
import {
  resetPopupController,
  togglePopupVisibility,
} from "../../../../../utils/popupUtils";
import { resetFormData, validateField } from "../../../../../utils/commonUtils";
import CustomInput from "../../../../../components/common/CustomInputFields/CustomInput";
import CustomDropDown from "../../../../../components/common/CustomInputFields/CustomDropDown";
import CustomPeoplePicker from "../../../../../components/common/CustomInputFields/CustomPeoplePicker";
import FloatingLabelTextarea from "../../../../../components/common/CustomInputFields/CustomTextArea";
import CustomDateInput from "../../../../../components/common/CustomInputFields/CustomDateInput";

const Details = ({ value }: any) => {
  const [viewData, setViewData] = useState<any>({
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
            options={["Active", "Inactive"]}
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
                    const value = item;
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
          //handleSubmit();
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

  useEffect(() => {
    setViewData({
      projectName: {
        value: value.projectName,
        isValid: true,
        errorMsg: "Invalid Project Name",
        validationRule: { required: true, type: "string" },
      },
      StartDate: {
        value: new Date(value.startDate),
        isValid: true,
        errorMsg: "Invalid input",
        validationRule: { required: true, type: "date" },
      },
      EndDate: {
        value: new Date(value.endDate),
        isValid: true,
        errorMsg: "Invalid input",
        validationRule: { required: true, type: "date" },
      },
      Status: {
        value: value.status,
        isValid: true,
        errorMsg: "Status is required",
        validationRule: { required: true, type: "string" },
      },
      contractNo: {
        value: value.contractNo,
        isValid: true,
        errorMsg: "Invalid ContractNo",
        validationRule: { required: true, type: "string" },
      },
      Description: {
        value: value.description,
        isValid: true,
        errorMsg: "This field is required",
        validationRule: { required: true, type: "string" },
      },

      projectAdmin: {
        ID: value.projectAdmin.id,
        value: value.projectAdmin,
        isValid: true,
        errorMsg: "This field is required",
        validationRule: { required: false, type: "array" },
      },
      clientName: {
        value: value.clientName,
        isValid: true,
        errorMsg: "This field is required",
        validationRule: { required: false, type: "string" },
      },
      location: {
        value: value.location,
        isValid: true,
        errorMsg: "This field is required",
        validationRule: { required: false, type: "string" },
      },
      address: {
        value: value.address,
        isValid: true,
        errorMsg: "This field is required",
        validationRule: { required: false, type: "string" },
      },
      team: {
        value: value.team,
        isValid: true,
        errorMsg: "This field is required",
        validationRule: { required: false, type: "array" },
      },
    });
  }, [value]);
  return (
    <>
      <div className={styles.container}>
        <div className={styles.heading}>
          <p>{value.contractNo + value.projectName}</p>

          <DefaultButton
            text={<Add />}
            btnType="primaryGreen"
            onlyIcon
            onClick={() => {
              setFormData({
                projectName: {
                  value: value.projectName,
                  isValid: true,
                  errorMsg: "Invalid Project Name",
                  validationRule: { required: true, type: "string" },
                },
                StartDate: {
                  value: new Date(value.startDate),
                  isValid: true,
                  errorMsg: "Invalid input",
                  validationRule: { required: true, type: "date" },
                },
                EndDate: {
                  value: new Date(value.endDate),
                  isValid: true,
                  errorMsg: "Invalid input",
                  validationRule: { required: true, type: "date" },
                },
                Status: {
                  value: value.status,
                  isValid: true,
                  errorMsg: "Status is required",
                  validationRule: { required: true, type: "string" },
                },
                contractNo: {
                  value: value.contractNo,
                  isValid: true,
                  errorMsg: "Invalid ContractNo",
                  validationRule: { required: true, type: "string" },
                },
                Description: {
                  value: value.description,
                  isValid: true,
                  errorMsg: "This field is required",
                  validationRule: { required: true, type: "string" },
                },

                projectAdmin: {
                  ID: value.projectAdmin.id,
                  value: value.projectAdmin,
                  isValid: true,
                  errorMsg: "This field is required",
                  validationRule: { required: false, type: "array" },
                },
                clientName: {
                  value: value.clientName,
                  isValid: true,
                  errorMsg: "This field is required",
                  validationRule: { required: false, type: "string" },
                },
                location: {
                  value: value.location,
                  isValid: true,
                  errorMsg: "This field is required",
                  validationRule: { required: false, type: "string" },
                },
                address: {
                  value: value.address,
                  isValid: true,
                  errorMsg: "This field is required",
                  validationRule: { required: false, type: "string" },
                },
                team: {
                  value: value.team,
                  isValid: true,
                  errorMsg: "This field is required",
                  validationRule: { required: false, type: "array" },
                },
              });
              togglePopupVisibility(
                setPopupController,
                initialPopupController[0],
                0,
                "open"
              );
            }}
          />
        </div>

        <div className={styles.content}>
          <div className={styles.leftContent}>
            <PersonIcon
              sx={{
                width: "20px",
                //   fontSize: "24px",
              }}
            />
            <p>{viewData.clientName.value}</p>
          </div>
          <div className={styles.rigthContent}>
            <MilitaryTechIcon
              sx={{
                width: "20px",
              }}
            />
            <p>{viewData.Status.value}</p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.leftContent}>
            <CalendarMonthIcon
              sx={{
                width: "20px",
                //   fontSize: "24px",
              }}
            />
            <p>{`${viewData.StartDate.value} - ${viewData.EndDate.value}`}</p>
          </div>
          <div className={styles.rigthContent}>
            <Avatar
              image={`/_layouts/15/userphoto.aspx?size=S&username=${
                viewData.projectAdmin.value?.email || ""
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
            />

            <p>{viewData.projectAdmin.value?.name}</p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.leftContent}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {viewData?.team?.value?.map((member: any, index: number) => (
                <Avatar
                  key={index}
                  image={`/_layouts/15/userphoto.aspx?size=S&username=${
                    member.email || ""
                  }`}
                  shape="circle"
                  size="normal"
                  style={{
                    margin: "0",
                    border: "3px solid #fff",
                    width: "25px",
                    height: "25px",
                    marginLeft: index > 0 ? "-10px" : "0", // Overlap avatars slightly
                    zIndex: value.team?.length - index, // Ensure higher index appears on top
                  }}
                  label={member.name}
                />
              ))}
            </div>
            {/* <p>{value.clientName}</p> */}
          </div>
          <div className={styles.rigthContent}>
            <PlaceIcon
              sx={{
                width: "20px",
              }}
            />
            <p>{viewData.location.value}</p>
          </div>
        </div>

        <div className={styles.description}>
          <InfoIcon sx={{ width: "25px" }} />
          <p>{viewData.Description.value}</p>
        </div>

        <div className={styles.map}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3124.6899180579053!2d-90.50354882498863!3d30.068551017429154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8620d3d8ddbb2477%3A0xf28f7015b84ecec5!2s456%20Elm%20St%2C%20Laplace%2C%20LA%2070068%2C%20USA!5e1!3m2!1sen!2sin!4v1735215903603!5m2!1sen!2sin"
            width="100%"
            height="150"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

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
    </>
  );
};
export default Details;
