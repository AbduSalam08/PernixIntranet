/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import styles from "./TicketForm.module.scss"; // SCSS for styling
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import CustomInput from "../../../../components/common/CustomInputFields/CustomInput";
import CustomDropDown from "../../../../components/common/CustomInputFields/CustomDropDown";
import DefaultButton from "../../../../components/common/Buttons/DefaultButton";
import CustomPeoplePicker from "../../../../components/common/CustomInputFields/CustomPeoplePicker";
import CustomMultipleFileUpload from "../../../../components/common/CustomInputFields/CustomMultipleFileUpload";
import FloatingLabelTextarea from "../../../../components/common/CustomInputFields/CustomTextArea";
import CustomAutocomplete from "../../../../components/common/CustomInputFields/CustomAutoComplete";
import { getAllTicketLocations } from "../../../../utils/helpdeskUtils";

interface TicketFormProps {
  openNewTicketSlide: any;
  setOpenNewTicketSlide: any;
  type: any;
  formData: any;
  setFormData: (data: any) => void;
  handleSubmit: () => void;
  validateField: (
    field: string,
    value: any,
    validationRule: any
  ) => { isValid: boolean; errorMsg: string };
  handleInputChange: (
    field: string,
    value: any,
    isValid: boolean,
    errorMsg: string
  ) => void;
  TicketCategories: any[];
  TicketPriority: any[];
  TicketStatus: any[];
  priorityLevelIntimations: Record<string, string>;
  currentUserDetails: any;
  initialData: any;
  loadingSubmit: boolean;
  isTicketManager?: boolean;
  isITOwner?: boolean;
  infoRed?: any;
  fileIcon?: any;
}

const TicketForm: React.FC<TicketFormProps> = ({
  openNewTicketSlide,
  setOpenNewTicketSlide,
  infoRed,
  fileIcon,
  formData,
  setFormData,
  handleSubmit,
  validateField,
  handleInputChange,
  TicketCategories,
  TicketPriority,
  TicketStatus,
  priorityLevelIntimations,
  currentUserDetails,
  initialData,
  loadingSubmit,
  isTicketManager,
  isITOwner,
}) => {
  const [allTicketLocation, setAllTicketLocation] = useState<any[]>([]);

  console.log("allTicketLocation: ", allTicketLocation);
  console.log("formData: ", formData);

  useEffect(() => {
    const fetchTicketLocations = async (): Promise<any> => {
      try {
        const ticketLocations = await getAllTicketLocations();
        setAllTicketLocation(
          ticketLocations?.map((item: any) => item?.LocationName)
        );
      } catch (error) {
        console.error("Error fetching ticket locations:", error);
      }
    };
    console.log("rendering...");
    fetchTicketLocations();
  }, [formData?.TicketNumber?.value !== ""]);
  return (
    <Drawer
      anchor={"right"}
      open={openNewTicketSlide.open}
      onClose={() => {
        setOpenNewTicketSlide({ open: false, type: "add", data: [] });
        setFormData(initialData);
      }}
      sx={{
        "& .MuiPaper-root.MuiPaper-elevation": {
          borderTopLeftRadius: "10px",
          borderBottomLeftRadius: "10px",
          backgroundColor: "#F7F7F7",
        },
      }}
    >
      <div className={styles.newTicketSlide}>
        <>
          <PageHeader
            title={
              openNewTicketSlide?.type === "add"
                ? "New ticket"
                : "Update ticket details"
            }
            headerClick={() => {
              setOpenNewTicketSlide({ open: false, type: "add", data: [] });
              setFormData(initialData);
            }}
            centered
            underlined
          />
          <div className={styles.inputs}>
            <>
              <CustomInput
                value={formData?.TicketNumber?.value}
                // disabled
                readOnly
                placeholder="Ticket number"
                isValid={formData?.TicketNumber?.isValid}
                errorMsg={formData?.TicketNumber?.errorMsg}
                onChange={(e) => {
                  const value = e;
                  const { isValid, errorMsg } = validateField(
                    "TicketNumber",
                    value,
                    formData?.TicketNumber?.validationRule
                  );
                  handleInputChange("TicketNumber", value, isValid, errorMsg);
                }}
              />

              <CustomPeoplePicker
                labelText="Employee Name"
                isValid={formData?.EmployeeNameId?.isValid}
                errorMsg={formData?.EmployeeNameId?.errorMsg}
                noErrorMsg
                readOnly
                selectedItem={[formData?.EmployeeNameId?.value?.email]}
                onChange={(item: any) => {
                  const value = item[0];
                  const { isValid, errorMsg } = validateField(
                    "EmployeeNameId",
                    value,
                    formData?.EmployeeNameId?.validationRule
                  );
                  handleInputChange("EmployeeNameId", value, isValid, errorMsg);
                }}
              />

              {isTicketManager && (
                <CustomPeoplePicker
                  labelText="IT Owner"
                  groupName={"HelpDesk_IT_Owners"}
                  isValid={formData?.ITOwnerId?.isValid}
                  errorMsg={formData?.ITOwnerId?.errorMsg}
                  selectedItem={[formData?.ITOwnerId?.value?.email]}
                  onChange={(item: any) => {
                    const value = item[0];
                    const { isValid, errorMsg } = validateField(
                      "ITOwnerId",
                      value,
                      formData?.ITOwnerId?.validationRule
                    );
                    handleInputChange("ITOwnerId", value, isValid, errorMsg);
                  }}
                />
              )}

              <CustomDropDown
                value={formData?.Category?.value}
                options={TicketCategories}
                placeholder="Category"
                isValid={formData?.Category?.isValid}
                errorMsg={formData?.Category?.errorMsg}
                onChange={(value) => {
                  const { isValid, errorMsg } = validateField(
                    "Category",
                    value,
                    formData?.Category?.validationRule
                  );
                  handleInputChange("Category", value, isValid, errorMsg);
                }}
              />

              <div className={styles.priorityWrapper}>
                <div className={styles.priorityInputWrapper}>
                  <CustomDropDown
                    value={formData?.Priority?.value}
                    options={TicketPriority}
                    placeholder="Priority"
                    width={"100%"}
                    isValid={formData?.Priority?.isValid}
                    errorMsg={formData?.Priority?.errorMsg}
                    onChange={(value) => {
                      const { isValid, errorMsg } = validateField(
                        "Priority",
                        value,
                        formData?.Priority?.validationRule
                      );
                      handleInputChange("Priority", value, isValid, errorMsg);
                    }}
                  />
                  {priorityLevelIntimations[formData?.Priority?.value] && (
                    <img src={infoRed} />
                  )}
                </div>
                {priorityLevelIntimations[formData?.Priority?.value] ? (
                  <span className={styles.priorityIntimation}>
                    Note:{" "}
                    {priorityLevelIntimations[formData?.Priority?.value] ?? ""}
                  </span>
                ) : (
                  ""
                )}
              </div>

              {(isTicketManager || isITOwner) &&
                openNewTicketSlide?.type === "update" &&
                openNewTicketSlide?.data?.ITOwnerId !== null && (
                  <CustomDropDown
                    disabled={
                      openNewTicketSlide?.data?.Status === "Closed" &&
                      openNewTicketSlide?.type === "update"
                    }
                    value={formData?.Status?.value}
                    options={
                      openNewTicketSlide?.data?.Status === "In Progress" ||
                      openNewTicketSlide?.data?.ITOwnerId !== null
                        ? TicketStatus.filter((item: any) => item !== "Open")
                        : TicketStatus
                    }
                    placeholder="Status"
                    isValid={formData?.Status?.isValid}
                    errorMsg={formData?.Status?.errorMsg}
                    onChange={(value) => {
                      const { isValid, errorMsg } = validateField(
                        "Status",
                        value,
                        formData?.Status?.validationRule
                      );
                      handleInputChange("Status", value, isValid, errorMsg);
                    }}
                  />
                )}

              <CustomAutocomplete
                options={allTicketLocation}
                value={formData.TicketLocation?.value}
                onChange={(e: string) => {
                  const value = e?.trimStart();
                  console.log("value: ", value);
                  const { isValid, errorMsg } = validateField(
                    "TicketLocation",
                    value,
                    formData.TicketLocation.validationRule
                  );
                  handleInputChange("TicketLocation", value, isValid, errorMsg);
                }}
                placeholder="Select location"
                label="Select location"
                size="MD"
                isValid={formData.TicketLocation?.isValid}
                errorMsg={formData.TicketLocation?.errorMsg}
              />

              <FloatingLabelTextarea
                value={formData.TicketDescription.value}
                placeholder="Description"
                rows={5}
                isValid={formData.TicketDescription.isValid}
                errorMsg={formData.TicketDescription.errorMsg}
                readOnly={currentUserDetails?.role !== "user"}
                onChange={(e: any) => {
                  const value = e.trimStart();
                  const { isValid, errorMsg } = validateField(
                    "TicketDescription",
                    value,
                    formData.TicketDescription.validationRule
                  );
                  handleInputChange(
                    "TicketDescription",
                    value,
                    isValid,
                    errorMsg
                  );
                }}
              />

              {openNewTicketSlide?.type === "add" ||
              (openNewTicketSlide?.type === "update" &&
                openNewTicketSlide?.data?.EmployeeName?.EMail ===
                  currentUserDetails?.email) ? (
                <CustomMultipleFileUpload
                  accept="image/svg, image/png, image/jpg"
                  placeholder="Click/drag & drop to upload attachment(s)"
                  multiple
                  customFileNameWidth={"370px"}
                  // value={formData?.Attachment?.value?.name || null}
                  value={formData?.Attachment?.value || []}
                  onFileSelect={(file) => {
                    const { isValid, errorMsg } = validateField(
                      "Attachment",
                      file ? file?.[0]?.name : "",
                      formData?.Attachment
                    );
                    handleInputChange("Attachment", file, isValid, errorMsg);
                  }}
                  isValid={formData.Attachment.isValid}
                  errMsg={formData.Attachment.errorMsg}
                />
              ) : formData?.Attachment?.value?.length > 0 ? (
                <>
                  <p>Attachments ({formData?.Attachment?.value?.length})</p>
                  <div className={styles.attachmentsWrapper}>
                    {Array.isArray(formData?.Attachment?.value)
                      ? formData?.Attachment?.value?.map(
                          (item: any, idx: number) => (
                            <a
                              key={idx}
                              href={`${window.location.origin}${item?.ServerRelativeUrl}?web=1`}
                              download
                              className={styles.fileSource}
                              onClick={() => {
                                window.open(
                                  `${window.location.origin}${item?.ServerRelativeUrl}?web=1`
                                );
                              }}
                            >
                              <div
                                className={styles.fileName}
                                title={item?.name}
                              >
                                <img src={fileIcon} />
                                <span>{item?.name}</span>
                              </div>
                            </a>
                          )
                        )
                      : ""}
                  </div>
                </>
              ) : (
                <span className={styles.fileSource}>
                  <p>Attachment</p>
                  <div className={styles.fileName}>
                    <span>No attachment found.</span>
                  </div>
                </span>
              )}
            </>
          </div>
        </>

        <div className={styles.actions}>
          <DefaultButton
            btnType="darkGreyVariant"
            text={"Cancel"}
            onClick={() => {
              setOpenNewTicketSlide({ open: false, type: "add", data: [] });
              setFormData(initialData);
            }}
          />
          <DefaultButton
            btnType="primaryGreen"
            text={"Submit"}
            disabled={loadingSubmit}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Drawer>
  );
};

export default TicketForm;
