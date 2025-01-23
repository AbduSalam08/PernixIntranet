/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-debugger */
/* eslint-disable prefer-const */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import "./Style.css";
import styles from "./EmployeeDirectoryPage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import {
  fetchActiveUserDatas,
  fetchAzureAdmins,
  fetchAzureUsers,
} from "../../../services/EmployeeDirectory/EmployeeDirectory";
import {
  IActiveUserDatas,
  IEDSearch,
  IEmployeeDirectoryUsersData,
} from "../../../interface/interface";
import { CONFIG } from "../../../config/config";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import {
  FilterAltOutlined,
  Info,
  OpenInNew,
  Visibility,
} from "@mui/icons-material";
import DataTable from "../../../components/common/DataTable/DataTable";
import { Icon, Persona, PersonaSize } from "@fluentui/react";
import { InputSwitch } from "primereact/inputswitch";
import { sp } from "@pnp/sp/presets/all";
import SpServices from "../../../services/SPServices/SpServices";
import Popup from "../../../components/common/Popups/Popup";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import Edit from "@mui/icons-material/Edit";
import moment from "moment";
import { MSGraphClient } from "@microsoft/sp-http";

/* Interfaces creation */
interface IEDFormFields {
  BusinessPhones: string;
  Skills: string;
  Qualifications: string;
  Experience: string;
}

/* Global variable creation */
let searchField: IEDSearch = CONFIG.EDSearch;
let isAdmin: boolean = false;
let masterADUsers: IEmployeeDirectoryUsersData[] = [];
let masterAdmins: any[] = [];
let masterActiveUsers: IActiveUserDatas[] = [];
let curUserData: any;
const formFields: IEDFormFields = {
  BusinessPhones: "",
  Experience: "",
  Qualifications: "",
  Skills: "",
};

const EmployeeDirectoryPage = (props: any): JSX.Element => {
  /* popup properties */
  const initialPopupController: any[] = [
    {
      open: false,
      popupTitle: "",
      popupWidth: "1200px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "Folder created successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new folder 'ABC' has been created successfully.",
        errorDescription:
          "An error occured while adding folder, please try again later.",
        inprogress: "Adding new folder, please wait...",
      },
    },
  ];

  /* Data table columns creation */
  const columns: any[] = [
    {
      sortable: false,
      field: "Name",
      headerName: "Name",
      width: 150,
      renderCell: (params: any) => {
        return (
          <div
            title={params?.row?.Name}
            onClick={async () => {
              setPanelItem({ ...params?.row });
              togglePopupVisibility(
                setPopupController,
                initialPopupController[0],
                0,
                "open"
              );
            }}
            style={{ cursor: "pointer" }}
            className={styles.personabox}
          >
            <Persona
              imageUrl={`/_layouts/15/userphoto.aspx?username=${params?.row?.Email}`}
              size={PersonaSize.size24}
            />
            <span className={styles.tableCellSec}>{params?.row?.Name}</span>
          </div>
        );
      },
    },
    {
      sortable: false,
      field: "MobilePhone",
      headerName: "Mobile phone",
      width: 80,
      renderCell: (params: any) => {
        return (
          <div className={styles.detailphonebox}>
            {params?.row?.MobilePhone ? (
              <>
                <Icon
                  iconName="Phone"
                  style={{
                    color: "#e0803d",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                />
                <label className={styles.tableCellSec}>
                  {params?.row?.MobilePhone}
                </label>
              </>
            ) : (
              "-"
            )}
          </div>
        );
      },
    },
    {
      sortable: false,
      field: "BusinessPhones",
      headerName: "Office phone",
      width: 80,
      renderCell: (params: any) => {
        return (
          <div className={styles.detailphonebox}>
            {params?.row?.BusinessPhones ? (
              <>
                <Icon
                  iconName="Phone"
                  style={{
                    color: "#e0803d",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                />
                <label className={styles.tableCellSec}>
                  {params?.row?.BusinessPhones}
                </label>
              </>
            ) : (
              "-"
            )}
          </div>
        );
      },
    },
    {
      sortable: false,
      field: "Department",
      headerName: "Department",
      width: 120,
      renderCell: (params: any) => {
        return (
          <div title={params?.row?.Department}>
            <label className={styles.tableCellSec}>
              {params?.row?.Department || "-"}
            </label>
          </div>
        );
      },
    },
    {
      sortable: false,
      field: "OfficeLocation",
      headerName: "Office location",
      width: 120,
      renderCell: (params: any) => {
        return (
          <div title={params?.row?.OfficeLocation}>
            <label className={styles.tableCellSec}>
              {params?.row?.OfficeLocation || "-"}
            </label>
          </div>
        );
      },
    },
    {
      sortable: false,
      field: "JobTitle",
      headerName: "Job title",
      width: 120,
      renderCell: (params: any) => {
        return (
          <div title={params?.row?.JobTitle}>
            <label className={styles.tableCellSec}>
              {params?.row?.JobTitle || "-"}
            </label>
          </div>
        );
      },
    },
    {
      sortable: false,
      field: "Manager",
      headerName: "Manager",
      width: 150,
      renderCell: (params: any) => {
        return params?.row?.Manager?.Name ? (
          <div className={styles.personabox} title={params?.row?.Manager?.Name}>
            <Persona
              imageUrl={`/_layouts/15/userphoto.aspx?username=${params?.row?.Manager?.Email}`}
              size={PersonaSize.size24}
            />
            <span className={styles.tableCellSec}>
              {params?.row?.Manager?.Name}
            </span>
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      sortable: false,
      field: "Skills",
      headerName: "Skills",
      width: 150,
      renderCell: (params: any) => {
        return (
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
            title={params?.row?.Skills.toString()}
          >
            {params?.row?.Skills?.map((val: string, idx: number) => {
              return (
                <span key={idx} className={styles.tableSkillsTag}>
                  {val}
                </span>
              );
            }) || "-"}
          </div>
        );
      },
    },
    {
      sortable: false,
      field: "Action",
      headerName: "Action",
      width: 40,
      renderCell: (params: any) => {
        return (
          <div className={styles.twoiconbox}>
            <div
              style={{
                display: isAdmin ? "flex" : "none",
              }}
            >
              <InputSwitch
                style={{ verticalAlign: "middle" }}
                checked={params?.row?.IsActive}
                onChange={async () => {
                  showOrHideForUser(
                    !params?.row?.IsActive,
                    params?.row?.UserId,
                    params?.row?.id,
                    params?.row?.ListId
                  );
                }}
              />
            </div>

            <div
              className={styles.visibilityicon}
              onClick={async () => {
                setPanelItem({ ...params?.row });
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[0],
                  0,
                  "open"
                );
              }}
            >
              <Visibility
                sx={{
                  color: "#555",
                  fontSize: "24px",
                }}
              />
            </div>
          </div>
        );
      },
    },
  ];

  /* State creation */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilter, setIsFilter] = useState<boolean>(false);
  const [arrMasterUsers, setArrMasterUsers] = useState<
    IEmployeeDirectoryUsersData[]
  >([]);
  const [arrUsers, setArrUsers] = useState<IEmployeeDirectoryUsersData[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [searchData, setSearchData] = useState<IEDSearch>({
    ...CONFIG.EDSearch,
  });
  const [panelItem, setPanelItem] = useState<IEmployeeDirectoryUsersData>({
    ...CONFIG.EmployeeDirectoryUsersData,
  });
  const [popupController, setPopupController] = useState<any[]>(
    initialPopupController
  );
  const [formData, setFormData] = useState<IEDFormFields>({ ...formFields });
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  /* Functions creation */
  const serachFunction = async (
    isTablePageination: boolean,
    masterUsers: IEmployeeDirectoryUsersData[] = arrMasterUsers
  ): Promise<void> => {
    let temp: IEmployeeDirectoryUsersData[] = [...masterUsers];

    if (searchField?.Status !== CONFIG.EDDrop[0]) {
      temp =
        temp?.filter((val: IEmployeeDirectoryUsersData) =>
          searchField?.Status === CONFIG.EDDrop[1]
            ? val?.IsActive
            : !val?.IsActive
        ) || [];
    }
    if (searchField?.CommonSearch) {
      temp =
        temp?.filter(
          (val: IEmployeeDirectoryUsersData) =>
            val?.Name.toLowerCase().includes(
              searchField?.CommonSearch.toLowerCase()
            ) ||
            val?.MobilePhone.toLowerCase().includes(
              searchField?.CommonSearch.toLowerCase()
            ) ||
            val?.OfficeLocation.toLowerCase().includes(
              searchField?.CommonSearch.toLowerCase()
            ) ||
            val?.JobTitle.toLowerCase().includes(
              searchField?.CommonSearch.toLowerCase()
            ) ||
            val?.Manager?.Name.toLowerCase().includes(
              searchField?.CommonSearch.toLowerCase()
            )
        ) || [];
    }
    if (searchField?.Name) {
      temp =
        temp?.filter((val: IEmployeeDirectoryUsersData) =>
          val?.Name.toLowerCase().includes(searchField?.Name.toLowerCase())
        ) || [];
    }
    if (searchField?.Phone) {
      temp =
        temp?.filter((val: IEmployeeDirectoryUsersData) =>
          val?.MobilePhone.toLowerCase().includes(
            searchField?.Phone.toLowerCase()
          )
        ) || [];
    }
    if (searchField?.Email) {
      temp =
        temp?.filter((val: IEmployeeDirectoryUsersData) =>
          val?.Email.toLowerCase().includes(searchField?.Email.toLowerCase())
        ) || [];
    }

    if (isTablePageination) {
      setPageNumber(1);
    } else {
      setPageNumber(pageNumber);
    }

    setArrUsers([...temp]);
    setIsEdit(false);
    setIsSubmit(false);
    setIsLoading(false);
  };

  const showOrHideForUser = async (
    isActive: boolean,
    userId: string,
    idx: number,
    listid: number
  ): Promise<void> => {
    try {
      if (listid) {
        await SpServices.SPUpdateItem({
          Listname: CONFIG.ListNames.EmployeeDirectory_Config,
          ID: listid,
          RequestJSON: { isActive: isActive, Userid: userId },
        });

        arrMasterUsers[idx].IsActive = isActive;
        setArrMasterUsers([...arrMasterUsers]);
        await serachFunction(false, [...arrMasterUsers]);
      } else {
        const res: any = await SpServices.SPAddItem({
          Listname: CONFIG.ListNames.EmployeeDirectory_Config,
          RequestJSON: {
            isActive: isActive,
            Userid: userId,
          },
        });

        arrMasterUsers[idx].ListId = res?.data?.ID;
        arrMasterUsers[idx].IsActive = isActive;
        setArrMasterUsers([...arrMasterUsers]);
        await serachFunction(false, [...arrMasterUsers]);
      }
    } catch (error) {
      console.error("Fetching error in active and inactive:", error);
    }
  };

  const filterFunction = async (
    Datas: IEmployeeDirectoryUsersData[]
  ): Promise<void> => {
    let temp: IEmployeeDirectoryUsersData[] = Datas;

    if (!isAdmin) {
      temp = temp?.filter((val: IEmployeeDirectoryUsersData) => val?.IsActive);
    }

    setArrMasterUsers(temp);
    setArrUsers(temp);
    setIsLoading(false);
  };

  const updateExtension = async (): Promise<void> => {
    const client: MSGraphClient =
      await props.context.msGraphClientFactory.getClient();

    const extension = {
      Experience: formData?.Experience,
      Qualifications: formData?.Qualifications,
    };

    try {
      await client
        .api(`/users/${panelItem?.UserId}/extensions/${panelItem?.UserId}`)
        .version("v1.0")
        .header("Content-Type", "application/json")
        .update(extension);

      togglePopupVisibility(
        setPopupController,
        initialPopupController[0],
        0,
        "close"
      );

      const idx: number = Number(panelItem?.id);
      arrMasterUsers[idx].BusinessPhones = formData.BusinessPhones;
      arrMasterUsers[idx].Skills = formData.Skills.split(",");
      arrMasterUsers[idx].Experience = formData.Experience;
      arrMasterUsers[idx].Qualifications = formData.Qualifications;
      setArrMasterUsers([...arrMasterUsers]);
      await serachFunction(false, [...arrMasterUsers]);
    } catch (err) {
      setIsSubmit(false);
      console.log("updateExtension err: ", err);
    }
  };

  const addExtension = async (): Promise<void> => {
    const client: MSGraphClient =
      await props.context.msGraphClientFactory.getClient();

    const extension = {
      "@odata.type": "microsoft.graph.openTypeExtension",
      extensionName: panelItem?.UserId,
      Experience: formData?.Experience,
      Qualifications: formData?.Qualifications,
    };

    try {
      await client
        .api(`/users/${panelItem?.UserId}/extensions`)
        .version("v1.0")
        .header("Content-Type", "application/json")
        .post(extension);

      togglePopupVisibility(
        setPopupController,
        initialPopupController[0],
        0,
        "close"
      );

      const idx: number = Number(panelItem?.id);
      arrMasterUsers[idx].BusinessPhones = formData.BusinessPhones;
      arrMasterUsers[idx].Skills = formData.Skills.split(",");
      arrMasterUsers[idx].Experience = formData.Experience;
      arrMasterUsers[idx].Qualifications = formData.Qualifications;
      setArrMasterUsers([...arrMasterUsers]);
      await serachFunction(false, [...arrMasterUsers]);
    } catch (err) {
      setIsSubmit(false);
      console.log("addExtension err: ", err);
    }
  };

  const updateSkills = async (): Promise<void> => {
    const client: MSGraphClient =
      await props.context.msGraphClientFactory.getClient();

    const payload: any = {
      skills: formData?.Skills?.split(",") || [],
    };

    try {
      await client
        .api(`/users/${panelItem?.UserId}`)
        .version("v1.0")
        .header("Content-Type", "application/json")
        .update({ ...payload });

      !panelItem.IsExtension ? await addExtension() : await updateExtension();
    } catch (err) {
      setIsSubmit(false);
      console.log("skills err: ", err);
    }
  };

  const updateBusinessPhone = async (): Promise<void> => {
    setIsLoading(true);
    setIsSubmit(true);

    const client: MSGraphClient =
      await props.context.msGraphClientFactory.getClient();

    const payload: any = {
      businessPhones: formData.BusinessPhones ? [formData.BusinessPhones] : [],
    };

    try {
      await client
        .api(`/users/${panelItem?.UserId}`)
        .version("v1.0")
        .header("Content-Type", "application/json")
        .update({ ...payload });

      await updateSkills();
    } catch (err) {
      setIsSubmit(false);
      console.log("businessPhones err: ", err);
    }
  };

  const handleEdit = async (
    val: IEmployeeDirectoryUsersData
  ): Promise<void> => {
    setFormData((prev: IEDFormFields) => ({
      ...prev,
      BusinessPhones: val?.BusinessPhones ?? "",
      Skills: val?.Skills.join(",") ?? "",
      Qualifications: val?.Qualifications ?? "",
      Experience: val?.Experience ?? "",
    }));

    setIsEdit(true);
  };

  const popupInputs: any[] = [
    [
      <div key={0}>
        <div className={styles.popupFirstRow}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div className={styles.avatarSection}>
              <Persona
                styles={{
                  root: {
                    ".ms-Persona-coin": {
                      boxShadow: `0px 0px 10px rgba(0,0,0,0.08)`,
                      borderRadius: "50%",
                    },
                  },
                }}
                title={panelItem?.Name || ""}
                imageUrl={`/_layouts/15/userphoto.aspx?username=${
                  panelItem?.Email || ""
                }`}
                size={PersonaSize.size100}
              />
              <div
                className={styles.editIcon}
                style={{
                  display: isEdit ? "flex" : "none",
                }}
                title="Go to My Microsoft 365 profile"
                onClick={() => {
                  window.open(
                    "https://www.microsoft365.com/search/overview?origin=ProfileAboutMe",
                    "_blank"
                  );
                }}
              >
                <Edit />
              </div>
            </div>
            <div className={styles.detailsSec}>
              <div className={styles.nameSec}>{panelItem?.Name || "-"}</div>
              <div className={styles.emailSec}>{panelItem?.Email || "-"}</div>
              <div className={styles.jobTitleSec}>
                {panelItem?.JobTitle || "-"}
              </div>
              <div>
                <DefaultButton
                  btnType="primaryGreen"
                  title="Update profile"
                  text="Update profile"
                  startIcon={<Edit />}
                  style={{
                    display:
                      panelItem?.Email?.toLowerCase() ===
                        curUserData?.Email?.toLowerCase() && !isEdit
                        ? "flex"
                        : "none",
                  }}
                  onClick={async () => {
                    await handleEdit({ ...panelItem });
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: isAdmin ? "flex" : "none",
            }}
          >
            <DefaultButton
              btnType="primaryGreen"
              title="Go to azure profile"
              text="Go to azure profile"
              startIcon={<OpenInNew />}
              onClick={() => {
                window.open(
                  `https://portal.azure.com/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/${panelItem?.UserId}/hidePreviewBanner~/true`,
                  "_blank"
                );
              }}
            />
          </div>
        </div>

        <div className={styles.popSecondRow}>
          <div className={styles.leftSec}>
            <div>
              <label>Department</label>
              <p>{panelItem?.Department || "-"}</p>
            </div>
            <div>
              <label>Office location</label>
              <p>{panelItem?.OfficeLocation || "-"}</p>
            </div>
            <div>
              <label>Managers name</label>
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Persona
                  title={panelItem?.Manager?.Name}
                  imageUrl={`/_layouts/15/userphoto.aspx?username=${panelItem?.Manager?.Email}`}
                  size={PersonaSize.size24}
                />
                {panelItem?.Manager?.Name}
              </p>
            </div>
            <div>
              <label>Mobile phone number</label>
              <p>{panelItem?.MobilePhone || "-"}</p>
            </div>
            <div>
              <label className={styles.flexSection}>
                Birthday
                <div
                  style={{
                    display: isEdit ? "flex" : "none",
                  }}
                  title="Please update your birthday details in Microsoft 365 profile"
                >
                  <Info
                    style={{
                      color: "#555",
                      fontSize: "22px",
                    }}
                  />
                </div>
              </label>
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                {panelItem?.Birthday
                  ? moment(panelItem.Birthday).format("MMM Do")
                  : "-"}

                <div
                  title="Go to My Microsoft 365 profile"
                  style={{
                    display: isEdit ? "flex" : "none",
                    cursor: "pointer",
                    color: "#2d4b51",
                    fontSize: "22px",
                  }}
                  onClick={() => {
                    window.open(
                      "https://www.microsoft365.com/search/overview?origin=ProfileAboutMe",
                      "_blank"
                    );
                  }}
                >
                  <Edit />
                </div>
              </p>
            </div>
          </div>

          <div className={styles.rightSec}>
            <div className={styles.rowData}>
              <label className={styles.rowHeading}>Office phone number</label>
              {!isEdit ? (
                <p className={styles.rowValue}>
                  {panelItem?.BusinessPhones || "-"}
                </p>
              ) : (
                <div className={styles.inputFieldsSec}>
                  <CustomInput
                    disabled={isSubmit}
                    noErrorMsg
                    size="SM"
                    value={formData?.BusinessPhones}
                    onChange={(value: string) => {
                      setFormData((prev: IEDFormFields) => ({
                        ...prev,
                        BusinessPhones: value.trimStart(),
                      }));
                    }}
                  />
                </div>
              )}
            </div>
            <div className={styles.rowData}>
              <label className={styles.rowHeading}>
                Skills{" "}
                {isEdit && (
                  <div
                    style={{
                      fontSize: "12px",
                      paddingTop: "10px",
                      color: "#aeaeae",
                    }}
                  >
                    {`( Enter your values using commas )`}
                  </div>
                )}
              </label>
              {!isEdit ? (
                <p
                  className={styles.rowValue}
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  {panelItem?.Skills?.length
                    ? panelItem?.Skills?.map((val: string, idx: number) => {
                        return (
                          <span key={idx} className={styles.rowTag}>
                            {val}
                          </span>
                        );
                      })
                    : "-"}
                </p>
              ) : (
                <div className={styles.inputFieldsSec}>
                  <CustomInput
                    disabled={isSubmit}
                    noErrorMsg
                    size="SM"
                    value={formData?.Skills}
                    onChange={(value: string) => {
                      setFormData((prev: IEDFormFields) => ({
                        ...prev,
                        Skills: value.trimStart(),
                      }));
                    }}
                  />
                </div>
              )}
            </div>
            <div className={styles.rowData}>
              <label className={styles.rowHeading}>Qualifications</label>
              {!isEdit ? (
                <p className={styles.rowValue} title={formData?.Qualifications}>
                  {panelItem?.Qualifications || "-"}
                </p>
              ) : (
                <div className={styles.inputFieldsSec}>
                  <CustomInput
                    disabled={isSubmit}
                    noErrorMsg
                    size="SM"
                    value={formData?.Qualifications}
                    onChange={(value: string) => {
                      setFormData((prev: IEDFormFields) => ({
                        ...prev,
                        Qualifications: value.trimStart(),
                      }));
                    }}
                  />
                </div>
              )}
            </div>
            <div className={styles.rowData}>
              <label className={styles.rowHeading}>Experience</label>
              {!isEdit ? (
                <p className={styles.rowValue} title={formData?.Qualifications}>
                  {panelItem?.Experience || "-"}
                </p>
              ) : (
                <div className={styles.inputFieldsSec}>
                  <CustomInput
                    disabled={isSubmit}
                    noErrorMsg
                    size="SM"
                    value={formData?.Experience}
                    onChange={(value: string) => {
                      setFormData((prev: IEDFormFields) => ({
                        ...prev,
                        Experience: value.trimStart(),
                      }));
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>,
    ],
  ];

  const popupActions: any[] = [
    isEdit
      ? [
          {
            text: "Cancel",
            btnType: "darkGreyVariant",
            disabled: isSubmit,
            endIcon: false,
            startIcon: false,
            size: "large",
            onClick: () => {
              setIsEdit(false);
            },
          },
          {
            text: "Submit",
            btnType: "primaryGreen",
            disabled: isSubmit,
            endIcon: false,
            startIcon: false,
            size: "large",
            onClick: async () => {
              await updateBusinessPhone();
            },
          },
        ]
      : [
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
                initialPopupController[0],
                0,
                "close"
              );
              setIsEdit(false);
            },
          },
        ],
  ];

  const updateFunction = async (): Promise<void> => {
    const updatedDatas: IEmployeeDirectoryUsersData[] =
      masterADUsers?.map((item: IEmployeeDirectoryUsersData) => {
        const matchingItem = masterActiveUsers?.find(
          (newitem: IActiveUserDatas) => newitem.UserId === item.UserId
        );

        if (matchingItem) {
          return {
            ...item,
            ListId: matchingItem?.ID,
            IsActive: matchingItem?.IsActive,
          };
        }

        return item;
      }) || [];

    await filterFunction(updatedDatas);
  };

  const initialFetchData = async (): Promise<void> => {
    curUserData = await sp.web.currentUser.get();
    const azureUsers: Promise<IEmployeeDirectoryUsersData[]> = fetchAzureUsers(
      props.context
    );
    const azureAdmins: Promise<any[]> = fetchAzureAdmins(props.context);
    const activeUserDatas: Promise<IActiveUserDatas[]> = fetchActiveUserDatas();

    const [users, admins, activeUsers] = await Promise.all([
      azureUsers,
      azureAdmins,
      activeUserDatas,
    ]);

    masterADUsers = users;
    masterAdmins = admins;
    masterActiveUsers = activeUsers;

    isAdmin = masterAdmins?.some(
      (val: any) =>
        val?.userPrincipalName?.toLowerCase() ===
        curUserData?.Email?.toLowerCase()
    );

    await updateFunction();
  };

  useEffect(() => {
    initialFetchData();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : (
        <>
          {/* Header section */}
          <div className={styles.headerContainer}>
            <div className={styles.backContainer}>
              <div
                style={{
                  cursor: "pointer",
                }}
                onClick={(_) => {
                  window.open(
                    props.context.pageContext.web.absoluteUrl +
                      CONFIG.NavigatePage.PernixIntranet,
                    "_self"
                  );
                }}
              >
                <i
                  className="pi pi-arrow-circle-left"
                  style={{
                    fontSize: "26px",
                    color: "#e0803d",
                  }}
                />
              </div>
              <div className={styles.backHeader}>Employee Directory</div>
            </div>

            <div className={styles.searchContainer}>
              <div
                style={{
                  display: isAdmin ? "flex" : "none",
                }}
              >
                <CustomDropDown
                  noErrorMsg
                  width="180px"
                  floatingLabel={false}
                  size="SM"
                  options={[...CONFIG.EDDrop]}
                  value={searchData?.Status}
                  onChange={(e: any) => {
                    searchField.Status = e;
                    setSearchData((prev: IEDSearch) => ({
                      ...prev,
                      Status: e,
                    }));
                    serachFunction(true);
                  }}
                />
              </div>
              <div>
                <CustomInput
                  noErrorMsg
                  secWidth="180px"
                  size="SM"
                  value={searchData?.CommonSearch}
                  placeholder="Search"
                  onChange={(e: any) => {
                    searchField.CommonSearch = e;
                    setSearchData((prev: IEDSearch) => ({
                      ...prev,
                      CommonSearch: e,
                    }));
                    serachFunction(true);
                  }}
                />
              </div>
              <div
                style={{
                  display: !isFilter ? "flex" : "none",
                }}
                className={styles.refreshBTN}
                onClick={(_) => {
                  searchField.Status = CONFIG.EDDrop[0];
                  searchField.CommonSearch = "";
                  setSearchData({ ...searchField });
                  serachFunction(true);
                }}
              >
                <i className="pi pi-refresh" />
              </div>
              <div>
                <DefaultButton
                  text="Filter"
                  btnType="primaryGreen"
                  startIcon={<FilterAltOutlined />}
                  onClick={(_) => {
                    searchField.CommonSearch = "";
                    searchField.Email = "";
                    searchField.Name = "";
                    searchField.Phone = "";
                    searchField.Status = CONFIG.EDDrop[0];
                    setSearchData({ ...searchField });
                    serachFunction(true);
                    setIsFilter(!isFilter);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Filters section */}
          <div
            style={{ display: isFilter ? "flex" : "none" }}
            className={styles.filterContainer}
          >
            <div>
              <CustomInput
                noErrorMsg
                secWidth="180px"
                size="SM"
                value={searchData?.Name}
                placeholder="Name"
                onChange={(e: any) => {
                  searchField.Name = e;
                  setSearchData((prev: IEDSearch) => ({
                    ...prev,
                    Name: e,
                  }));
                  serachFunction(true);
                }}
              />
            </div>
            <div>
              <CustomInput
                noErrorMsg
                secWidth="180px"
                size="SM"
                value={searchData?.Phone}
                placeholder="Phone"
                onChange={(e: any) => {
                  searchField.Phone = e;
                  setSearchData((prev: IEDSearch) => ({
                    ...prev,
                    Phone: e,
                  }));
                  serachFunction(true);
                }}
              />
            </div>
            <div>
              <CustomInput
                noErrorMsg
                secWidth="180px"
                size="SM"
                value={searchData?.Email}
                placeholder="Email"
                onChange={(e: any) => {
                  searchField.Email = e;
                  setSearchData((prev: IEDSearch) => ({
                    ...prev,
                    Email: e,
                  }));
                  serachFunction(true);
                }}
              />
            </div>
            <div
              className={styles.refreshBTN}
              onClick={(_) => {
                searchField.CommonSearch = "";
                searchField.Email = "";
                searchField.Name = "";
                searchField.Phone = "";
                searchField.Status = CONFIG.EDDrop[0];
                setSearchData({ ...searchField });
                serachFunction(true);
              }}
            >
              <i className="pi pi-refresh" />
            </div>
          </div>

          {/* DataTable section */}
          <div className={styles.dbWrapper}>
            <DataTable
              rows={[...arrUsers]}
              columns={columns}
              CurrentPageNumber={pageNumber}
              setCurrentPageNumber={(pageNo: number) => {
                setPageNumber(pageNo);
              }}
              emptyMessage="No results found!"
              pageSize={10}
              headerBgColor={"#e5e9e570"}
              checkboxSelection={false}
            />
          </div>

          {/* add and edit popup section */}
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
                togglePopupVisibility(
                  setPopupController,
                  initialPopupController[0],
                  index,
                  "close"
                );
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
                popupData.popupType !== "custom" ? popupData.popupTitle : ""
              }
              popupHeight={index === 0 ? true : false}
              noActionBtn={true}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default EmployeeDirectoryPage;
