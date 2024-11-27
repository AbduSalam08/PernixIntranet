/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
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
// import { getuserdetails } from "../../../services/employeeDirectory/EmployeeDirectory";

// import { Item } from "@pnp/sp/items";
// import { Button } from "primereact/button";
// import DataTable from "../../../components/common/DataTable/DataTable";

const EmployeeDirectoryPage = (props: any): JSX.Element => {
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      width: 200,
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
      field: "Skills",
      headerName: "Skills",
      width: 200,
      renderCell: (params: any) => {
        return (
          <div>
            <label>
              {params.row.Skills.length > 0
                ? params.row.Skills.join(",")
                : "Software Developer"}
            </label>
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
      field: "Email",
      headerName: "Email",
      width: 650,
      renderCell: (params: any) => {
        return (
          <div>
            <label>{params.row.Email || "-"}</label>
          </div>
        );
      },
    },
    {
      sortable: false,
      field: "Action",
      headerName: "Action",
      width: 100,
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
            <div className={styles.windowediticon}>
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
            </div>
          </div>
        );
      },
    },
  ];
  const onLoadingFUN = async (): Promise<void> => {
    setIsLoading(true);
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
    //;
    const updatedList = tempdata.map((item: any) => {
      const matchingItem = listdata.find(
        (newitem: any) => newitem.Userid === item.Id
      );

      if (matchingItem) {
        return {
          ...item,
          Skills: [...matchingItem.Skills],
          ListId: matchingItem.ListId,
        };
      }
      return item;
    });
    //;
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
    setglobalfilterdata(additionaldata);
    setUserData(updatedList);
    setUserDuplicateData(updatedList);
    setIsLoading(false);
  };
  // this function is tenentlevelallUsergetFunction
  const getallusers = async (listdata: any[]) => {
    props.context.msGraphClientFactory
      .getClient()
      .then((client: MSGraphClient) => {
        client
          .api("/users?$filter=userType eq 'Member'")
          .version("v1.0")
          .top(999)
          .get()
          .then((response) => {
            const tempdata: any = [];
            response.value.forEach((item: any, index: number) => {
              tempdata.push({
                id: index,
                Skills: [],
                ListId: null,
                officeLocation: item.officeLocation ? item.officeLocation : "",
                Phone: item.businessPhones ? item.businessPhones[0] : "",
                Name: item.displayName ? item.displayName : "",
                Id: item.id ? item.id : null,
                JobTitle: item.JobTitle ? item.JobTitle : "",
                SureName: item.surname ? item.surname : "",
                Language: item.preferredLanguage ? item.preferredLanguage : "",
                Email: item.userPrincipalName ? item.userPrincipalName : "",
              });
            });

            updatefunction(tempdata, listdata);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching users: ", error);
          });
      });
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
  useEffect(() => {
    onLoadingFUN();
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
                <h6>Manager</h6>
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
              <label>11/2/2024</label>
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
              {panelItem.Skills && panelItem.Skills.length > 0 ? (
                panelItem.Skills.map((item: string, index: number) => {
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
