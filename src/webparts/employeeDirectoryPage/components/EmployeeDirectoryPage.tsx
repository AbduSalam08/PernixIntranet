/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import "./Style.css";
import styles from "./EmployeeDirectoryPage.module.scss";
import { MSGraphClient } from "@microsoft/sp-http";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import DataTable from "../../../components/common/DataTable/DataTable";
import {
  Icon,
  ISearchBoxStyles,
  Persona,
  PersonaSize,
  SearchBox,
} from "@fluentui/react";
import { MailOutline, VisibilityOutlined } from "@mui/icons-material";
// import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { TextField } from "office-ui-fabric-react";
import { Drawer } from "@mui/material";
import {
  getuserdetails,
  skillUpdate,
} from "../../../services/EmployeeDirectory/EmployeeDirectory";
import { __metadata } from "tslib";
import moment from "moment";
import { InputSwitch } from "primereact/inputswitch";
import SpServices from "../../../services/SPServices/SpServices";
import { CONFIG } from "../../../config/config";
import { RoleAuth } from "../../../services/CommonServices";
import { useDispatch, useSelector } from "react-redux";

// import { Item } from "@pnp/sp/items";
// import { Button } from "primereact/button";
// import DataTable from "../../../components/common/DataTable/DataTable";

let isAdmin: boolean = false;

const EmployeeDirectoryPage = (props: any): JSX.Element => {
  const dispatch = useDispatch();

  const currentUserDetails: any = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  console.log("currentUserDetails: ", currentUserDetails);
  isAdmin = currentUserDetails?.role === CONFIG.RoleDetails.user ? false : true;

  const [filterkey, setfilterkey] = useState({
    _status: "",
    _gsearch: "",
    Name: "",
    Phone: "",
    Skills: "",
    Email: "",
  });
  const [panelItem, setPanelItem] = useState<any>([]);
  const [panelPopupFlag, setPanelPopupFlag] = useState({
    isopen: false,
    popupedit: false,
  });
  const [globalfilterdata, setglobalfilterdata] = useState<any>([]);
  console.log(panelPopupFlag, globalfilterdata);
  const [listData, setListData] = useState<any>([]);
  console.log(listData);
  const [filterFlag, setFilterFlag] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<any>([]);
  const [userDuplicateData, setUserDuplicateData] = useState<any>([]);
  const textFieldStyle = {
    fieldGroup: {
      ".ms-TextField-fieldGroup": {
        border: "1px solid rgb(228 222 217) !important",
        width: "220px !important",
        "::after": {
          border: "1px solid none",
        },
      },
    },
    root: {
      textarea: {
        resize: "none",
      },
      ".ms-Label": {
        color: "#0b4d53 !important",
        fontWeight: "bold",
      },
      ".ms-TextField-field": {
        background: "transparent !important",
        color: "#323130 !important",
        borderRadius: "5px",
        border: "1px solid rgb(211 207 203) !important",
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
  const searchBoxStyle: Partial<ISearchBoxStyles> = {
    root: {
      padding: "0 10px",
      fontSize: 16,
      width: "100%",
      borderRadius: "6px",
      border: "none !important",

      ".ms-SearchBox-icon": {
        fontWeight: 900,
        color: "rgb(151 144 155) !important",
      },
      ".ms-SearchBox": {
        border: "none !important",
      },
      "::after": {
        border: "none !important",
        backgrounColor: "white",
      },
      ".ms-Button-flexContainer": {
        background: "transparent",
      },
    },
  };
  const columns = [
    {
      sortable: true,
      field: "Name",
      headerName: "Name",
      width: 170,
      renderCell: (params: any) => {
        return (
          <div
            onClick={() => {
              //("shanmugraj");
            }}
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
        //(params);
        return (
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
            <label>{params.row.officeLocation || ""}</label>
          </div>
        );
      },
    },
    // {
    //   sortable: false,
    //   field: "Skills",
    //   headerName: "Skills",
    //   width: 200,
    //   renderCell: (params: any) => {
    //     return (
    //       <div>
    //         <label>
    //           {params.row.Skills.length > 0
    //             ? params.row.Skills.join(",")
    //             : "Software Developer"}
    //         </label>
    //       </div>
    //     );
    //   },
    // },
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
        return (
          <div
            onClick={() => {
              //("shanmugraj");
            }}
            className={styles.personabox}
          >
            <Persona
              title={params.row.Manager?.name}
              imageUrl={`/_layouts/15/userphoto.aspx?username=${params.row.Manager.email}`}
              size={PersonaSize.size24}
            />
            {params?.row?.Manager.name}
          </div>
        );
      },
    },
    // {
    //   sortable: false,
    //   field: "Email",
    //   headerName: "Email",
    //   width: 200,
    //   renderCell: (params: any) => {
    //     return (
    //       <div
    //         style={
    //           {
    //             // maxWidth: "200px",
    //           }
    //         }
    //       >
    //         <p
    //           style={{
    //             margin: 0,
    //             width: "190px",
    //             overflow: "hidden",
    //             textOverflow: "ellipsis",
    //             whiteSpace: "nowrap",
    //           }}
    //           title={params?.row?.Email || "-"}
    //         >
    //           {params.row.Email || "-"}
    //         </p>
    //       </div>
    //       // <div>
    //       //   <label>{params.row.Email || "-"}</label>
    //       // </div>
    //     );
    //   },
    // },
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
              onClick={() => {
                //;
                setPanelPopupFlag({
                  ...panelPopupFlag,
                  isopen: true,
                  popupedit: false,
                });
                setPanelItem(params.row);
              }}
            >
              <VisibilityOutlined
                style={{
                  color: "#1ab800",
                }}
              />
            </div>
            {isAdmin && (
              <div>
                <InputSwitch
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
            {/* <div className={styles.windowediticon}>
              <Icon
                style={{
                  fontWeight: "bold",
                  color: " #007ef2",
                }}
                iconName="WindowEdit"
                onClick={() => {
                  //;
                  setPanelPopupFlag({
                    ...panelPopupFlag,
                    popupedit: true,
                    isopen: true,
                  });
                  setPanelItem(params.row);
                }}
              />
            </div> */}
          </div>
        );
      },
    },
  ];
  const onLoadingFUN = async (): Promise<void> => {
    setFilterFlag(false);
    setfilterkey({
      _status: "",
      _gsearch: "",
      Name: "",
      Phone: "",
      Skills: "",
      Email: "",
    });
    setPanelPopupFlag({
      isopen: false,
      popupedit: false,
    });

    getuserskills();
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
          // Skills: [...matchingItem[0].Skills],
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
          //;
          newstring += ` ${_reitem[newitem].join(" ")}`;
        }
      }
      additionaldata.push({
        _listId: _reitem.Id,
        Searchstring: newstring.toLowerCase(),
      });
    });

    let temp = isAdmin
      ? updatedList
      : updatedList.filter((val: any) => val.isActive);

    setglobalfilterdata(additionaldata);
    console.log("temp: ", temp);

    setUserData(temp);
    // setUserData(updatedList);
    console.log("updatedList: ", updatedList);
    setUserDuplicateData(temp);
    // setUserDuplicateData(updatedList);
    setIsLoading(false);
  };
  // get all user from Azure
  async function fetchUser(context: any, filterSuffix: string) {
    const client: MSGraphClient =
      await context.msGraphClientFactory.getClient();

    let allUsers: any[] = [];
    let nextPageUrl: string | undefined = undefined;

    try {
      // Step 1: Fetch all users with basic details (ID, mail, displayName)
      do {
        const response: any = nextPageUrl
          ? await client
              .api(nextPageUrl)
              .version("v1.0")
              .top(999)
              .select(
                "department,skill,accountEnabled,Country,mail,id,displayName,Country,jobTitle,mobilePhone,manager,ext,givenName,surname,userPrincipalName,userType,businessPhones,officeLocation,identities"
              )
              .expand("manager")
              .get()
          : await client
              .api("/users")
              .version("v1.0")
              .top(999)
              .select(
                "department,skill,accountEnabled,Country,mail,id,displayName,Country,jobTitle,mobilePhone,manager,ext,givenName,surname,userPrincipalName,userType,businessPhones,officeLocation,identities"
              )
              .expand("manager")
              .get();

        allUsers = allUsers.concat(response.value);

        nextPageUrl = response["@odata.nextLink"];
      } while (nextPageUrl);

      console.log(allUsers, "Fetched all users");

      //  Fetch birthday extension for each user
      const usersWithBirthdays = await Promise.all(
        allUsers.map(async (user: any, index: number) => {
          try {
            // Fetch extensions for the user
            const userDetails = await client
              .api(`/users/${user.id}?$select=birthday,skills`)
              .version("v1.0")
              .get();
            console.log(userDetails, "userdetail");

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
                birthday: userDetails.birthday, // Directly map birthday
              };
            }

            return null;
          } catch (error) {
            console.error(
              `Error fetching birthday for user ${user.id}:`,
              error
            );
            return null;
          }
        })
      );

      // Filter results based on email suffix and remove null entries
      const filteredUsers = usersWithBirthdays.filter(
        (user) => user && user.Email?.endsWith(filterSuffix)
      );

      return filteredUsers;
    } catch (error) {
      console.error("Error fetching user birthdays:", error);
      return [];
    }
  }

  // this function is tenentlevelallUsergetFunction
  const getallusers = async (listdata: any[]) => {
    let users = await fetchUser(props.context, "@technorucs.com");

    await updatefunction(users, listdata);
    // setIsLoading(false);

    // props.context.msGraphClientFactory
    //   .getClient()
    //   .then((client: MSGraphClient) => {
    //     client
    //       .api("/users?$filter=userType eq 'Member'")
    //       .version("v1.0")
    //       .top(999)
    //       .select(
    //         "department,accountEnabled,Country,mail,id,displayName,Country,jobTitle,mobilePhone,manager,ext,givenName,surname,userPrincipalName,userType,businessPhones,officeLocation,identities"
    //       )
    //       .expand("manager")
    //       .get()
    //       .then((response) => {
    //         console.log("response: ", response);

    //         const tempdata: any = [];
    //         response.value.forEach((item: any, index: number) => {
    //           tempdata.push({
    //             id: index,
    //             Skills: [],
    //             ListId: null,
    //             officeLocation: item.officeLocation ? item.officeLocation : "",
    //             Phone: item.mobilePhone ? item.mobilePhone : "",
    //             Name: item.displayName ? item.displayName : "",
    //             Id: item.id ? item.id : null,
    //             JobTitle: item.JobTitle ? item.JobTitle : "",
    //             SureName: item.surname ? item.surname : "",
    //             Language: item.preferredLanguage ? item.preferredLanguage : "",
    //             Email: item.userPrincipalName ? item.userPrincipalName : "",
    //             Manager: {
    //               email: item.manager ? item.manager.mail : "",
    //               name: item.manager ? item.manager.displayName : "",
    //             },
    //           });
    //         });

    //         updatefunction(tempdata, listdata);
    //         setIsLoading(false);
    //       })
    //       .catch((error) => {
    //         console.error("Error fetching users: ", error);
    //       });
    //   });
  };

  // This function is UsersSkill function

  async function getuserskills() {
    await getuserdetails().then((item) => {
      const tempdata: any = [];
      item.forEach((useritem: any) => {
        tempdata.push({
          Userid: useritem.Userid ? useritem.Userid : "",
          Skills: useritem.Skills ? useritem.Skills : [],
          ListId: useritem.Id ? useritem.Id : null,
          isActive: useritem.isActive ? useritem.isActive : false,
        });
      });

      setListData([...tempdata]);
      getallusers(tempdata);
    });
  }
  // This function is Filterfunction
  const filterfunction = async (_filterkey: any, text: string) => {
    let _data: any = [...userDuplicateData];
    const searchtext = text.toLowerCase().trim();
    if (_filterkey.Name !== "") {
      _data = _data.filter(
        (item: any) =>
          item.Name && item.Name.toLowerCase().trim().includes(searchtext)
      );
    }
    if (_filterkey.Phone !== "") {
      _data = _data.filter(
        (item: any) =>
          item.Phone &&
          item.Phone.toLowerCase().trim().toString().includes(searchtext)
      );
    }

    if (_filterkey.Skills !== "") {
      _data = _data.filter(
        (item: any) =>
          item.Skills &&
          item.Skills.some((newitem: any) => newitem.toLos === searchtext)
      );
    }
    if (_filterkey.Email !== "") {
      _data = _data.filter(
        (item: any) =>
          item.Email && item.Email.toLowerCase().trim().includes(searchtext)
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
  const globalfiltersetdata = (_data: any) => {
    const newdata: any = [];
    const _duplicatedata = [...userDuplicateData];
    _duplicatedata.filter((arr) => {
      if (_data.some((newItem: any) => newItem._listId === arr.Id)) {
        newdata.push(arr);
      }
    });
    setUserData([...newdata]);
  };
  const globalfilterfunction = (value: any) => {
    let _data = [...globalfilterdata];
    if (value !== "") {
      const findtext = value.toLowerCase().toString();
      _data = _data.filter((item) => item.Searchstring.includes(findtext));
      if (_data.length > 0) {
        globalfiltersetdata(_data);
      } else if (_data.length === 0) {
        setUserData([..._data]);
      }
    } else if (value === "") {
      const _data = [...userDuplicateData];
      setUserData([..._data]);
    }
  };

  //active in active users

  // const showandHideuser = async (
  //   isActive: boolean,
  //   id: any,
  //   listid: any
  // ): Promise<void> => {
  //   try {
  //     if (listid) {
  //       await SpServices.SPUpdateItem({
  //         Listname: CONFIG.ListNames.EmployeeDirectory_Config,
  //         ID: listid,
  //         RequestJSON: { isActive: isActive, Userid: id },
  //       });
  //     } else {
  //       let res=await SpServices.SPAddItem({
  //         Listname: CONFIG.ListNames.EmployeeDirectory_Config,
  //         RequestJSON: {
  //           isActive: isActive,
  //           Userid: id,
  //         },
  //       });
  //     }
  //   } catch {
  //     console.log("fetching error in active and in active");
  //   }
  // };

  const showandHideuser = async (
    isActive: boolean,
    id: any,
    listid: any
  ): Promise<void> => {
    try {
      let response: any;
      if (listid) {
        // Update the existing item
        response = await SpServices.SPUpdateItem({
          Listname: CONFIG.ListNames.EmployeeDirectory_Config,
          ID: listid,
          RequestJSON: { isActive: isActive, Userid: id },
        });

        // Update the state by finding the existing item and updating it
        // setUserData((prevState: any) =>
        //   prevState.map((item: any) =>
        //     item.Id === listid
        //       ? { ...item, isActive: isActive, Userid: id }
        //       : item
        //   )
        // );
        console.log("response: ", response);

        await fetchInitialList();
      } else {
        // Add a new item
        response = await SpServices.SPAddItem({
          Listname: CONFIG.ListNames.EmployeeDirectory_Config,
          RequestJSON: {
            isActive: isActive,
            Userid: id,
          },
        });
        console.log("response: ", response);

        await fetchInitialList();

        // Add the new item to the state
        // setUserData((prevState: any) => [
        //   ...prevState,
        //   { isActive: isActive, Userid: id, ListId: response?.data?.Id }, // Use the returned data to add the new item
        // ]);
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

  const fetchInitialList = async () => {
    setIsLoading(true);

    await RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      { highPriorityGroups: [CONFIG.SPGroupName.EmployeeDirectory_Admin] },

      dispatch
    );

    await onLoadingFUN();
  };

  useEffect(() => {
    fetchInitialList();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
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
                <Icon iconName="SkypeArrow" className={styles.icon} />
              </div>
            </div>
            <div className={styles.headingbox}>
              <div>
                <h3>Employee Directory</h3>
              </div>
              <div className={styles.filterbox}>
                <div>
                  <SearchBox
                    placeholder="Search..."
                    styles={searchBoxStyle}
                    value={filterkey._gsearch}
                    onChange={(e, value: any) => {
                      setfilterkey({
                        ...filterkey,
                        _gsearch: value,
                      });
                      globalfilterfunction(value);
                    }}
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
                        fontWeight: 700,
                        fontSize: "16PX",
                      }}
                    />
                    <span>Filter</span>
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
                <div>
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
            <div>
              <DataTable
                rows={userData}
                // rows={dataGridProps?.sortedBy==="Asc (Old)"? currentRoleBasedData?.data:dataGridProps?.sortedBy==="Desc (Latest)"?DescData:[]}
                columns={columns}
                emptyMessage="No tickets found!"
                // isLoading={HelpDeskTicktesData?.isLoading}
                pageSize={10}
                headerBgColor={"#e5e9e5"}
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
                <h6>{panelItem?.JobTitle ? panelItem?.JobTitle : ""}</h6>
              </div>
            </div>
          </div>
          <div className={styles.userdetailbox}>
            <div className={styles.mailbox}>
              <MailOutline
                style={{
                  color: "#0b4d53",
                  fontSize: "24px",
                }}
              />
              <label>{panelItem.Email ? panelItem.Email : "-"}</label>
            </div>
            <div className={styles.phonebox}>
              <Icon
                iconName="Phone"
                style={{
                  color: "#0b4d53",
                  fontSize: "24px",
                  // marginLeft: "8px",
                }}
              />
              <label> {panelItem.Phone ? panelItem.Phone : "-"}</label>
            </div>
            <div className={styles.birthdaybox}>
              <Icon
                iconName="BirthdayCake"
                style={{
                  color: "#0b4d53",
                  fontSize: "24px",
                }}
              />
              <label>{moment(panelItem.birthday).format("MMM Do")}</label>
            </div>
            <div className={styles.locationbox}>
              <i
                className="pi pi-map-marker"
                style={{
                  color: "#0b4d53",
                  fontSize: "24px",
                  // marginLeft: "10PX",
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
                  <label>No Skills</label>
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
                    // setPanelItem([]);
                    setPanelPopupFlag({
                      ...panelPopupFlag,
                      isopen: false,
                      popupedit: false,
                    });
                  }}
                >
                  <button className={styles.cancelbutton}>Cancel</button>
                </div>
                <div
                  className={styles["new-blog-button"]}
                  onClick={() => {
                    //("shanmugaraj");
                  }}
                >
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
    </div>
  );
};

export default EmployeeDirectoryPage;
