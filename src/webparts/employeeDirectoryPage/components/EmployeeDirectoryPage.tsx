/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-dupe-else-if */
/* eslint-disable no-unused-expressions */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import "./Style.css";
import styles from "./EmployeeDirectoryPage.module.scss";
import { MSGraphClient } from "@microsoft/sp-http";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import DataTable from "../../../components/common/DataTable/DataTable";
import { Icon, Persona, PersonaSize } from "@fluentui/react";
import { Edit, MailOutline, Visibility } from "@mui/icons-material";
import { TextField } from "office-ui-fabric-react";
import { Drawer } from "@mui/material";
import moment from "moment";
import { InputSwitch } from "primereact/inputswitch";
import SpServices from "../../../services/SPServices/SpServices";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
import { useDispatch, useSelector } from "react-redux";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { sp } from "@pnp/sp/presets/all";
import {
  getuserdetails,
  skillUpdate,
} from "../../../services/EmployeeDirectory/EmployeeDirectory";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import Popup from "../../../components/common/Popups/Popup";
import { ToastContainer } from "react-toastify";
import { IEDMonthDrop } from "../../../interface/interface";

/* Interfaces creation */
interface IEDFormFields {
  Month: string;
  Date: string;
  Skills: string;
  Qualifications: string;
  Experience: string;
}

/* Global variable creation */
let isAdmin: boolean = false;
const formFields: IEDFormFields = {
  Date: "",
  Experience: "",
  Month: "",
  Qualifications: "",
  Skills: "",
};

const EmployeeDirectoryPage = (props: any): JSX.Element => {
  /* Local variable creation */
  const dispatch = useDispatch();

  const currentUserDetails: any = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  isAdmin = currentUserDetails?.role === CONFIG.RoleDetails.user ? false : true;

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

  /* State creation */
  const [popupController, setPopupController] = useState<any[]>(
    initialPopupController
  );
  const [filterkey, setfilterkey] = useState({
    _status: "",
    _gsearch: "",
    Name: "",
    Phone: "",
    Dropdown: "All",
    Skills: "",
    Email: "",
  });
  const [panelItem, setPanelItem] = useState<any>([]);
  const [panelPopupFlag, setPanelPopupFlag] = useState({
    isopen: false,
    popupedit: false,
  });
  const [filterFlag, setFilterFlag] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<any>([]);
  const [userDuplicateData, setUserDuplicateData] = useState<any>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [formData, setFormData] = useState<IEDFormFields>({ ...formFields });
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  /* Styles creation */
  const textFieldStyle = {
    fieldGroup: {
      ".ms-TextField-fieldGroup": {
        border: "none !important",
        width: "220px !important",
        "::after": {
          border: "none",
        },
      },
    },
    root: {
      textarea: {
        resize: "none",
      },
      ".ms-Label": {
        color: "#0b4d53 !important",
      },
      ".ms-TextField-field": {
        background: "transparent !important",
        color: "#323130 !important",
        borderRadius: "5px",
        border: "none !important",
        "::after": {
          border: "none !important",
        },
      },
      ".ms-TextField > span": {
        display: "none",
      },
      ".ms-TextField-fieldGroup": {
        width: "200px !important",
        border: "none !important",
        height: "35px !important",
        minHeight: "0 !important",
        "::after": {
          border: "none !important",
        },
      },
    },
  };

  /* Data table columns creation */
  const columns = [
    {
      sortable: true,
      field: "Name",
      headerName: "Name",
      width: 170,
      renderCell: (params: any) => {
        return (
          <div
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
              title={params.row.Name}
              imageUrl={`/_layouts/15/userphoto.aspx?username=${params.row.Email}`}
              size={PersonaSize.size24}
            />
            {params?.value}
          </div>
        );
      },
    },
    {
      sortable: false,
      field: "Phone",
      headerName: "Phone number",
      width: 170,
      renderCell: (params: any) => {
        return params.row.Phone ? (
          <div className={styles.detailphonebox}>
            <Icon
              iconName="Phone"
              style={{
                color: "orange",
                fontSize: "20px",
                fontWeight: "700",
              }}
            />
            <label>{params.row.Phone || "-"}</label>
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      sortable: false,
      field: "officeLocation",
      headerName: "Location",
      width: 150,
      renderCell: (params: any) => {
        return (
          <div>
            <label>{params.row.officeLocation || "-"}</label>
          </div>
        );
      },
    },
    {
      sortable: false,
      field: "JobTitle",
      headerName: "Job title",
      width: 150,
      renderCell: (params: any) => {
        return (
          <div>
            <label>{params.row.JobTitle || "-"}</label>
          </div>
        );
      },
    },
    {
      sortable: false,
      field: "Manager.name",
      headerName: "Manager",
      width: 200,
      renderCell: (params: any) => {
        return params?.row?.Manager.name ? (
          <div className={styles.personabox}>
            <Persona
              title={params.row.Manager?.name}
              imageUrl={`/_layouts/15/userphoto.aspx?username=${params.row.Manager.email}`}
              size={PersonaSize.size24}
            />
            {params?.row?.Manager.name}
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      sortable: false,
      field: "Action",
      headerName: "Action",
      width: 80,
      renderCell: (params: any) => {
        return (
          <div className={styles.twoiconbox}>
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
            {isAdmin && (
              <div>
                <InputSwitch
                  style={{ verticalAlign: "middle" }}
                  checked={params?.row?.isActive || false}
                  onChange={async (e: any) => {
                    setUserData((prevItems: any) =>
                      prevItems.map((val: any, idx: number) =>
                        params.row?.Id === val?.Id
                          ? { ...val, isActive: e.value }
                          : val
                      )
                    );
                    showandHideuser(
                      e.value,
                      params.row?.Id,
                      params.row?.ListId
                    );
                  }}
                />
              </div>
            )}
          </div>
        );
      },
    },
  ];

  // This function is Filterfunction
  const filterfunction = async (_filterkey: any, text: string) => {
    let _data: any = [...userDuplicateData];

    if (_filterkey.Name !== "") {
      _data = _data.filter(
        (item: any) =>
          item.Name &&
          item.Name.toLowerCase()
            .trim()
            .includes(_filterkey.Name.trim().toLowerCase())
      );
    }
    if (_filterkey.Phone !== "") {
      _data = _data.filter(
        (item: any) =>
          item.Phone &&
          item.Phone.toLowerCase()
            .trim()
            .toString()
            .includes(_filterkey.Phone.trim())
      );
    }
    if (_filterkey.Skills !== "") {
      _data = _data.filter(
        (item: any) =>
          item.Skills &&
          item.Skills?.toString()
            .toLowerCase()
            .includes(_filterkey.Skills.trim().toLowerCase())
      );
    }
    if (_filterkey.Email !== "") {
      _data = _data.filter(
        (item: any) =>
          item.Email &&
          item.Email.toLowerCase()
            .trim()
            .includes(_filterkey.Email.trim().toLowerCase())
      );
    }

    setfilterkey({ ..._filterkey });
    setUserData([..._data]);
  };

  // This function is FilterOnchangehandlerfunction
  const filterOnchangehandler = async (key: any, text: any) => {
    const _filterkey: any = { ...filterkey };
    _filterkey[key] = text;
    filterfunction(_filterkey, text);
  };

  //  This function deletepillfunction
  const deletepill = (index: number): void => {
    const panelfilterskills = [...panelItem.Skills];
    const filterdata =
      panelfilterskills &&
      panelfilterskills.filter(
        (newitem: any, findindex: number) => findindex !== index
      );

    setPanelItem({
      ...panelItem,
      Skills: [...filterdata],
    });
  };

  const handleSearch = (val: any): void => {
    const searchDropdown = val?.Dropdown || "All";
    const searchTerm = val?._gsearch?.trim().toLowerCase() || "";

    let filteredResults = userDuplicateData.filter((item: any) => {
      return (
        item.Skills?.toString().toLowerCase().includes(searchTerm) ||
        item.Name?.toLowerCase().includes(searchTerm) ||
        item.Phone?.toLowerCase().includes(searchTerm) ||
        item.Phone?.toLowerCase().includes(searchTerm) ||
        item.officeLocation?.toLowerCase().includes(searchTerm) ||
        item.Manager?.email?.toLowerCase().includes(searchTerm) ||
        item.Manager?.name?.toLowerCase().includes(searchTerm)
      );
    });

    filteredResults = filteredResults.filter((item: any) => {
      if (searchDropdown === "All") {
        return true;
      } else if (searchDropdown === "Active") {
        return item.isActive === true;
      } else if (searchDropdown === "inActive") {
        return item.isActive === false;
      }
      return true;
    });

    setUserData([...filteredResults]);
  };

  const showandHideuser = async (
    isActive: boolean,
    id: any,
    listid: any
  ): Promise<void> => {
    try {
      if (listid) {
        await SpServices.SPUpdateItem({
          Listname: CONFIG.ListNames.EmployeeDirectory_Config,
          ID: listid,
          RequestJSON: { isActive: isActive, Userid: id },
        });

        await fetchInitialList();
      } else {
        // Add a new item
        await SpServices.SPAddItem({
          Listname: CONFIG.ListNames.EmployeeDirectory_Config,
          RequestJSON: {
            isActive: isActive,
            Userid: id,
          },
        });

        await fetchInitialList();
      }
    } catch (error) {
      console.error("Fetching error in active and inactive:", error);
    }
  };

  // This function is Skill Update function
  const skillupdatefunc = async (Id: number, Skills: any): Promise<any> => {
    await skillUpdate(Id, Skills)
      .then((item) => {
        onLoadingFUN();
      })
      .catch((arr) => {
        console.log(arr);
      });
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
        .api(`/users/${panelItem?.Id}/extensions/${panelItem?.Id}`)
        .version("v1.0")
        .header("Content-Type", "application/json")
        .update(extension);

      togglePopupVisibility(
        setPopupController,
        initialPopupController[0],
        0,
        "close"
      );
      setIsLoading(true);
      await fetchInitialList();
    } catch (err) {
      setIsSubmit(false);
      console.log("err: ", err);
    }
  };

  const addExtension = async (): Promise<void> => {
    const client: MSGraphClient =
      await props.context.msGraphClientFactory.getClient();

    const extension = {
      "@odata.type": "microsoft.graph.openTypeExtension",
      extensionName: panelItem?.Id,
      Experience: formData?.Experience,
      Qualifications: formData?.Qualifications,
    };

    try {
      await client
        .api(`/users/${panelItem?.Id}/extensions`)
        .version("v1.0")
        .header("Content-Type", "application/json")
        .post(extension);

      togglePopupVisibility(
        setPopupController,
        initialPopupController[0],
        0,
        "close"
      );
      setIsLoading(true);
      await fetchInitialList();
    } catch (err) {
      setIsSubmit(false);
      console.log("err: ", err);
    }
  };

  const updateUser = async (): Promise<void> => {
    const monthNumber: string = moment().month(formData?.Month).format("MM");

    const updateJSON: any = {
      birthday: `1999-${monthNumber}-${formData?.Date}T00:00:00Z`,
      skills: formData?.Skills?.split(","),
    };

    const client: MSGraphClient =
      await props.context.msGraphClientFactory.getClient();

    try {
      await client
        .api(`/users/${panelItem?.Id}`)
        .version("v1.0")
        .header("Content-Type", "application/json")
        .update(updateJSON);

      !panelItem.isExtension ? addExtension() : updateExtension();
    } catch (err) {
      setIsSubmit(false);
      console.log("err: ", err);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setIsSubmit(true);
    updateUser();
  };

  const handleEdit = async (val: any): Promise<void> => {
    setFormData((prev: IEDFormFields) => ({
      ...prev,
      Date: val?.birthday ? moment(val?.birthday).format("DD") : "",
      Month: val?.birthday ? moment(val?.birthday).format("MMMM") : "",
      Skills: val?.Skills.join(",") || "",
      Qualifications: val?.Qualifications || "",
      Experience: val?.Experience || "",
    }));
    setIsEdit(true);
  };

  // This function is userskillupdatefunction
  const updatefunction = async (tempdata: any, listdata: any) => {
    const updatedList = tempdata.map((item: any) => {
      const matchingItem = listdata?.find(
        (newitem: any) => newitem.Userid === item.Id
      );

      if (matchingItem) {
        return {
          ...item,
          ListId: matchingItem?.ListId,
          isActive: matchingItem?.isActive || false,
        };
      }
      return item;
    });

    const additionaldata: { _listId: any; Searchstring: string }[] = [];
    updatedList.map((_reitem: any) => {
      let newstring = "";
      for (const newitem in _reitem) {
        if (
          typeof _reitem[newitem] === "string" ||
          typeof _reitem[newitem] === "number"
        ) {
          newstring += `  ${_reitem[newitem]}`;
        } else if (Array.isArray(_reitem[newitem]) && _reitem[newitem]) {
          newstring += ` ${_reitem[newitem].join(" ")}`;
        }
      }
      additionaldata.push({
        _listId: _reitem.Id,
        Searchstring: newstring.toLowerCase(),
      });
    });

    const temp = isAdmin
      ? updatedList
      : updatedList.filter((val: any) => val.isActive);

    setUserData(temp);
    setUserDuplicateData(temp);
    setIsEdit(false);
    setIsSubmit(false);
    setIsLoading(false);
  };

  // get all user from Azure
  const fetchUser = async (context: any, filterSuffix: string) => {
    const client: MSGraphClient =
      await context.msGraphClientFactory.getClient();

    let allUsers: any[] = [];
    let nextPageUrl: string | undefined = undefined;

    try {
      do {
        const response: any = nextPageUrl
          ? await client
              .api(nextPageUrl)
              .version("v1.0")
              .top(999)
              .select(
                "department, skill, accountEnabled, Country, mail, id, displayName, Country, jobTitle, mobilePhone, manager, ext, givenName, surname, userPrincipalName, userType, businessPhones, officeLocation, identities"
              )
              .expand("manager, extensions")
              .get()
          : await client
              .api("/users")
              .version("v1.0")
              .top(999)
              .select(
                "department, skill, accountEnabled, Country, mail, id, displayName, Country, jobTitle, mobilePhone, manager, ext, givenName, surname, userPrincipalName, userType, businessPhones, officeLocation, identities"
              )
              .expand("manager, extensions")
              .get();

        allUsers = allUsers.concat(response.value);

        nextPageUrl = response["@odata.nextLink"];
      } while (nextPageUrl);

      //  Fetch birthday extension for each user
      const usersWithBirthdays: any[] = await Promise.all(
        allUsers?.map(async (user: any, index: number) => {
          try {
            // Fetch extensions for the user
            const userDetails = await client
              .api(`/users/${user.id}?$select=birthday,skills`)
              .version("v1.0")
              .get();

            if (userDetails?.birthday && userDetails.skills) {
              return {
                id: index,
                Skills:
                  userDetails?.skills?.length > 0
                    ? userDetails.skills.toString()?.split(",")
                    : [],
                ListId: null,
                isActive: false,
                officeLocation: user.officeLocation ? user.officeLocation : "",
                Phone: user.mobilePhone ? user.mobilePhone : "",
                Name: user.displayName ? user.displayName : "",
                Id: user.id ? user.id : null,
                JobTitle: user.jobTitle ? user.jobTitle : "",
                SureName: user.surname ? user.surname : "",
                Language: user.preferredLanguage ? user.preferredLanguage : "",
                Email: user.userPrincipalName ? user.userPrincipalName : "",
                Manager: {
                  email: user.manager ? user.manager.mail : "",
                  name: user.manager ? user.manager.displayName : "",
                },
                birthday:
                  moment(userDetails?.birthday).format("YYYYMMDD") !==
                  "00010101"
                    ? moment(userDetails?.birthday).format()
                    : "",
                Department: user?.department || "",
                BusinessPhones: user?.businessPhones?.length
                  ? user?.businessPhones?.[0]
                  : "",
                Experience: user?.extensions?.[0]?.Experience || "",
                Qualifications: user?.extensions?.[0]?.Qualifications || "",
                isExtension: user?.extensions?.length ? true : false,
              };
            }

            return null;
          } catch (error) {
            console.log("Error fetching user data: ", error);

            return null;
          }
        }) || []
      );

      // Filter results based on email suffix and remove null entries
      const filteredUsers = usersWithBirthdays.filter(
        (user) => user && user.Email?.endsWith(filterSuffix)
      );

      return filteredUsers;
    } catch (error) {
      console.error("Error fetching user birthdays: ", error);

      return [];
    }
  };

  // this function is tenentlevelallUsergetFunction
  const getallusers = async (listdata: any[]) => {
    const curUser: any = await sp.web.currentUser.get();
    const userMailStructure: string = `@${curUser?.Email?.split("@")[1]}`;
    const users = await fetchUser(props.context, userMailStructure);

    await updatefunction(users, listdata);
  };

  // This function is UsersSkill function
  const getuserskills = async () => {
    await getuserdetails().then(async (item) => {
      const tempdata: any[] = [];
      item?.forEach((useritem: any) => {
        tempdata.push({
          Userid: useritem.Userid ? useritem.Userid : "",
          Skills: useritem.Skills ? useritem.Skills : [],
          ListId: useritem.Id ? useritem.Id : null,
          isActive: useritem.isActive ? useritem.isActive : false,
        });
      });

      await getallusers(tempdata);
    });
  };

  const onLoadingFUN = async (): Promise<void> => {
    setFilterFlag(false);
    setfilterkey({
      _status: "",
      _gsearch: "",
      Name: "",
      Phone: "",
      Skills: "",
      Dropdown: "All",
      Email: "",
    });
    setPanelPopupFlag({
      isopen: false,
      popupedit: false,
    });

    await getuserskills();
  };

  const fetchInitialList = async () => {
    setIsLoading(true);

    await RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      { highPriorityGroups: [CONFIG.SPGroupName.EmployeeDirectory_Admin] },

      dispatch
    );

    await onLoadingFUN();
  };

  const popupInputs: any[] = [
    [
      <div key={0}>
        <div className={styles.popupFirstRow}>
          <Persona
            title={panelItem?.Name || ""}
            imageUrl={`/_layouts/15/userphoto.aspx?username=${
              panelItem?.Email || ""
            }`}
            size={PersonaSize.size100}
          />
          <div className={styles.detailsSec}>
            <div className={styles.nameSec}>{panelItem?.Name || "-"}</div>
            <div className={styles.jobTitleSec}>
              {panelItem?.JobTitle || "-"}
            </div>
            <DefaultButton
              btnType="primaryGreen"
              title="Edit profile"
              text="Edit profile"
              startIcon={<Edit />}
              style={{
                display:
                  // (isAdmin && !isEdit) ||
                  (false && !isEdit) ||
                  (panelItem?.Email?.toLowerCase() ===
                    currentUserDetails?.email?.toLowerCase() &&
                    !isEdit)
                    ? "flex"
                    : "none",
              }}
              onClick={async () => {
                await handleEdit({ ...panelItem });
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
              <p>{panelItem?.officeLocation || "-"}</p>
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
                  title={panelItem?.Manager?.name}
                  imageUrl={`/_layouts/15/userphoto.aspx?username=${panelItem?.Manager?.email}`}
                  size={PersonaSize.size24}
                />
                {panelItem?.Manager?.name}
              </p>
            </div>
            <div>
              <label>Office phone number</label>
              <p>{panelItem?.BusinessPhones || "-"}</p>
            </div>
            <div>
              <label>Mobile phone number</label>
              <p>{panelItem?.Phone || "-"}</p>
            </div>
          </div>
          <div className={styles.rightSec}>
            <div className={styles.rowData}>
              <label className={styles.rowHeading}>Birthday</label>
              {!isEdit ? (
                <p className={styles.rowValue}>
                  {panelItem?.birthday
                    ? moment(panelItem.birthday).format("MMM Do")
                    : "-"}
                </p>
              ) : (
                <div
                  className={styles.inputFieldsSec}
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "48%",
                    }}
                  >
                    <CustomDropDown
                      disabled={isSubmit}
                      options={CONFIG.Months}
                      value={formData?.Month}
                      size="SM"
                      onChange={(value: string) => {
                        setFormData((prev: IEDFormFields) => ({
                          ...prev,
                          Month: value,
                          Date: "",
                        }));
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: "48%",
                    }}
                  >
                    <CustomDropDown
                      options={
                        !formData?.Month
                          ? []
                          : CONFIG.EDMonthDrop?.filter(
                              (val: IEDMonthDrop) =>
                                val?.Month === formData?.Month
                            )?.[0]?.Date
                      }
                      value={formData?.Date}
                      size="SM"
                      disabled={
                        isSubmit ? true : formData?.Month ? false : true
                      }
                      onChange={(value: string) => {
                        setFormData((prev: IEDFormFields) => ({
                          ...prev,
                          Date: value,
                        }));
                      }}
                    />
                  </div>
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
                <p className={styles.rowValue}>
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
                <p className={styles.rowValue}>
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
              await handleSubmit();
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

  useEffect(() => {
    setIsLoading(true);
    fetchInitialList();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
          {/* <button
            onClick={() => {
              let isClick: boolean = false;

              if (!isClick) {
                updateUser();
              }
            }}
          >
            Click
          </button> */}
        </div>
      ) : (
        <div>
          <div className={styles.employeebox}>
            <div className={styles.blog}>
              <div
                onClick={() => {
                  window.open(
                    props.context.pageContext.web.absoluteUrl +
                      CONFIG.NavigatePage.PernixIntranet,
                    "_self"
                  );
                }}
                className={styles.roundiconbutton}
                style={{ cursor: "pointer" }}
              >
                <i
                  className="pi pi-arrow-circle-left"
                  style={{ fontSize: "1.5rem", color: "#E0803D" }}
                />

                <p>Employee Directory</p>
              </div>

              <div className={styles.filterbox}>
                <div
                  style={{
                    display: isAdmin ? "flex" : "none",
                  }}
                >
                  <CustomDropDown
                    value={filterkey?.Dropdown || "All"}
                    options={["All", "Active", "inActive"]}
                    placeholder="Category"
                    onChange={(value) => {
                      setfilterkey({
                        ...filterkey,
                        Dropdown: value,
                      });
                      handleSearch({ ...filterkey, Dropdown: value });
                    }}
                    floatingLabel={false}
                    size="SM"
                  />
                </div>

                <div>
                  <CustomInput
                    noErrorMsg
                    value={filterkey._gsearch}
                    placeholder="Search"
                    onChange={(value: any) => {
                      setfilterkey({
                        ...filterkey,
                        _gsearch: value,
                      });
                      handleSearch({ ...filterkey, _gsearch: value });
                    }}
                    size="SM"
                  />
                </div>
                <div>
                  <div
                    className={styles["new-blog-button"]}
                    onClick={() => {
                      setFilterFlag(!filterFlag);
                    }}
                  >
                    <Icon
                      iconName="Filter"
                      style={{
                        fontSize: "16px",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: '"osSemiBold",sans-serif',
                      }}
                    >
                      Filter
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {filterFlag === true ? (
              <div className={styles.textfieldbox}>
                <div>
                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <TextField
                      onChange={(e, value) => {
                        filterOnchangehandler("Name", value);
                      }}
                      value={filterkey.Name}
                      label="Name"
                      multiline
                      styles={textFieldStyle}
                      placeholder="Name"
                    />
                    <Icon
                      iconName="Filter"
                      style={{
                        position: "absolute",
                      }}
                      className={styles.filtericon}
                    />
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <TextField
                      onChange={(e, value) => {
                        filterOnchangehandler("Phone", value);
                      }}
                      value={filterkey.Phone}
                      placeholder="Phone"
                      label="Phone"
                      multiline
                      styles={textFieldStyle}
                    />
                    <Icon
                      iconName="Filter"
                      style={{
                        position: "absolute",
                      }}
                      className={styles.filtericon}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "none",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <TextField
                      onChange={(e, value) => {
                        filterOnchangehandler("Skills", value);
                      }}
                      value={filterkey.Skills}
                      placeholder="Skills"
                      label="Skills"
                      multiline
                      styles={textFieldStyle}
                    />
                    <Icon
                      iconName="Filter"
                      style={{
                        position: "absolute",
                      }}
                      className={styles.filtericon}
                    />
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <TextField
                      onChange={(e, value) => {
                        filterOnchangehandler("Email", value);
                      }}
                      value={filterkey.Email}
                      placeholder="Email"
                      label="Email"
                      multiline
                      styles={textFieldStyle}
                    />
                    <Icon
                      iconName="Filter"
                      style={{
                        position: "absolute",
                      }}
                      className={styles.filtericon}
                    />
                  </div>
                </div>
                <div
                  className={styles.refreshBTN}
                  onClick={() => {
                    const obj: any = {
                      _status: "",
                      _gsearch: "",
                      Name: "",
                      Phone: "",
                      Skills: "",
                      Email: "",
                    };
                    filterfunction(obj, "Test");
                  }}
                >
                  <i className="pi pi-refresh" />
                </div>
              </div>
            ) : null}
            <div className={styles.dbWrapper}>
              <DataTable
                rows={userData}
                columns={columns}
                emptyMessage="No results found!"
                pageSize={10}
                headerBgColor={"#e5e9e570"}
                checkboxSelection={false}
              />
            </div>
          </div>
        </div>
      )}

      <Drawer
        anchor={"right"}
        open={panelPopupFlag.isopen}
        onClose={() => {
          setPanelItem([]);
          setPanelPopupFlag({
            ...panelPopupFlag,
            isopen: false,
            popupedit: false,
          });
        }}
        sx={{
          "& .MuiPaper-root.MuiPaper-elevation": {
            borderTopLeftRadius: "10px",
            borderBottomLeftRadius: "10px",
            backgroundColor: "#F7F7F7",
            width: "374px",
          },
        }}
      >
        <div className={styles.drawcontainer}>
          <div className={styles.drawerheading}>
            <div
              className={styles.drawericonbox}
              onClick={() => {
                setPanelPopupFlag({
                  ...panelPopupFlag,
                  isopen: false,
                  popupedit: false,
                });
              }}
            >
              <Icon iconName="ChevronLeftMed" className={styles.drawerionc} />
              <h4>Profile</h4>
            </div>
          </div>
          <div className={styles.drawerpersonabox}>
            <div className={styles.drawerinbox}>
              <div className={styles.personabox}>
                <Persona
                  title="shanmugaraj"
                  imageUrl={`/_layouts/15/userphoto.aspx?username=${
                    panelItem.Email && panelItem.Email
                  }`}
                  size={PersonaSize.size100}
                />
              </div>
              <div className={styles.namebox}>
                <h3>{panelItem.Name ? panelItem.Name : "-"}</h3>
                <h5>
                  {panelItem.officeLocation ? panelItem.officeLocation : ""}
                </h5>
                <span>{panelItem?.JobTitle ? panelItem?.JobTitle : ""}</span>
              </div>
            </div>
          </div>
          <div className={styles.userdetailbox}>
            <div className={styles.mailbox}>
              <MailOutline
                style={{
                  color: "#0b4d53",
                  fontSize: "20px",
                }}
              />
              <label>{panelItem.Email ? panelItem.Email : "-"}</label>
            </div>
            <div className={styles.phonebox}>
              <Icon
                iconName="Phone"
                style={{
                  color: "#0b4d53",
                  fontSize: "20px",
                }}
              />
              <label> {panelItem.Phone ? panelItem.Phone : "-"}</label>
            </div>
            <div className={styles.birthdaybox}>
              <Icon
                iconName="BirthdayCake"
                style={{
                  color: "#0b4d53",
                  fontSize: "20px",
                }}
              />
              <label>{moment(panelItem.birthday).format("MMM Do")}</label>
            </div>
            <div className={styles.locationbox}>
              <i
                className="pi pi-map-marker"
                style={{
                  color: "#0b4d53",
                  fontSize: "20px",
                }}
              />

              <label>
                {panelItem.officeLocation ? panelItem.officeLocation : "-"}
              </label>
            </div>
          </div>
          <div
            style={{
              width: "80%",
              marginLeft: "37PX",
            }}
          >
            <div className={styles.line} />
          </div>
          <div className={styles.skillbox}>
            <div className={styles.skillinbox}>
              <h5>Skills</h5>
            </div>
            <div
              className={styles.pillcontainer}
              style={{
                justifyContent:
                  panelItem.Skills && panelItem.Skills.length === 0
                    ? "center"
                    : "",
              }}
            >
              {panelItem.Skills && panelItem.Skills?.length > 0 ? (
                panelItem?.Skills?.map((item: string, index: number) => {
                  return (
                    <div key={index} className={styles.pill}>
                      {item}
                      {panelPopupFlag.popupedit === true && (
                        <Icon
                          iconName="Cancel"
                          onClick={() => {
                            deletepill(index);
                          }}
                          style={{
                            cursor: "pointer",
                          }}
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      color: "#adadad",
                    }}
                  >
                    No Skills
                  </label>
                </div>
              )}
            </div>
          </div>
          {panelPopupFlag.popupedit === true && panelItem.Skills.length > 0 ? (
            <div className={styles.buttonparentbox}>
              <div className={styles.buttoninbox}>
                <div
                  className={styles["new-blog-button"]}
                  onClick={() => {
                    setPanelPopupFlag({
                      ...panelPopupFlag,
                      isopen: false,
                      popupedit: false,
                    });
                  }}
                >
                  <button className={styles.cancelbutton}>Cancel</button>
                </div>
                <div className={styles["new-blog-button"]}>
                  <button
                    className={styles.submitbutton}
                    onClick={() => {
                      skillupdatefunc(panelItem.ListId, panelItem.Skills);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Drawer>

      {/* Toast message section */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

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
    </div>
  );
};

export default EmployeeDirectoryPage;
