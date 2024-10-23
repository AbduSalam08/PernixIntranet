/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Drawer } from "@mui/material";
import DefaultButton from "../../../../components/common/Buttons/DefaultButton";
import DataTable from "../../../../components/common/DataTable/DataTable";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
// images
const reopenTicket: any = require("../../../../assets/images/svg/reopenTicket.svg");

import styles from "./MyTickets.module.scss";
import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import CustomInput from "../../../../components/common/CustomInputFields/CustomInput";
import { validateField } from "../../../../utils/commonUtils";
import CustomPeoplePicker from "../../../../components/common/CustomInputFields/CustomPeoplePicker";
import CustomDropDown from "../../../../components/common/CustomInputFields/CustomDropDown";
import CustomFileUpload from "../../../../components/common/CustomInputFields/CustomFileUpload";
import { useDispatch, useSelector } from "react-redux";
import { getAllTickets } from "../../../../services/HelpDeskMainServices/dashboardServices";

const MyTickets = (): JSX.Element => {
  const dispatch = useDispatch();

  const [openNewTicketSlide, setOpenNewTicketSlide] = useState(false);
  const handleView = (row: any): any => {
    alert(`View clicked for row: ${JSON.stringify(row)}`);
  };

  const data = [
    {
      id: 1,
      ticket_number: "T-0001",
      IT_owner: "Alice",
      category: "Network",
      priority: "High",
      status: "Open",
    },
    {
      id: 2,
      ticket_number: "T-0002",
      IT_owner: "Bob",
      category: "Hardware",
      priority: "Medium",
      status: "In Progress",
    },
    {
      id: 3,
      ticket_number: "T-0003",
      IT_owner: "Charlie",
      category: "Software",
      priority: "Low",
      status: "Resolved",
    },
    {
      id: 4,
      ticket_number: "T-0004",
      IT_owner: "David",
      category: "Database",
      priority: "High",
      status: "Open",
    },
    {
      id: 5,
      ticket_number: "T-0005",
      IT_owner: "Eve",
      category: "Security",
      priority: "Critical",
      status: "Open",
    },
    {
      id: 6,
      ticket_number: "T-0006",
      IT_owner: "Frank",
      category: "User Support",
      priority: "Medium",
      status: "Closed",
    },
    {
      id: 7,
      ticket_number: "T-0007",
      IT_owner: "Grace",
      category: "Network",
      priority: "High",
      status: "In Progress",
    },
    {
      id: 8,
      ticket_number: "T-0008",
      IT_owner: "Hannah",
      category: "Software",
      priority: "Low",
      status: "Open",
    },
    {
      id: 9,
      ticket_number: "T-0009",
      IT_owner: "Ivy",
      category: "Hardware",
      priority: "Medium",
      status: "Resolved",
    },
    {
      id: 0,
      ticket_number: "T-0010",
      IT_owner: "Jack",
      category: "Database",
      priority: "High",
      status: "Closed",
    },
    {
      id: 1,
      ticket_number: "T-0011",
      IT_owner: "Karen",
      category: "Security",
      priority: "Critical",
      status: "Open",
    },
    {
      id: 2,
      ticket_number: "T-0012",
      IT_owner: "Leo",
      category: "User Support",
      priority: "Medium",
      status: "In Progress",
    },
    {
      id: 3,
      ticket_number: "T-0013",
      IT_owner: "Mona",
      category: "Network",
      priority: "High",
      status: "Open",
    },
    {
      id: 4,
      ticket_number: "T-0014",
      IT_owner: "Nina",
      category: "Software",
      priority: "Low",
      status: "Resolved",
    },
    {
      id: 5,
      ticket_number: "T-0015",
      IT_owner: "Oscar",
      category: "Hardware",
      priority: "Medium",
      status: "Closed",
    },
    {
      id: 6,
      ticket_number: "T-0016",
      IT_owner: "Paul",
      category: "Database",
      priority: "High",
      status: "In Progress",
    },
    {
      id: 7,
      ticket_number: "T-0017",
      IT_owner: "Quinn",
      category: "Security",
      priority: "Critical",
      status: "Open",
    },
    {
      id: 8,
      ticket_number: "T-0018",
      IT_owner: "Ray",
      category: "User Support",
      priority: "Medium",
      status: "Open",
    },
    {
      id: 9,
      ticket_number: "T-0019",
      IT_owner: "Sophie",
      category: "Network",
      priority: "High",
      status: "Resolved",
    },
    {
      id: 0,
      ticket_number: "T-0020",
      IT_owner: "Tom",
      category: "Software",
      priority: "Low",
      status: "Closed",
    },
    {
      id: 1,
      ticket_number: "T-0021",
      IT_owner: "Uma",
      category: "Hardware",
      priority: "Medium",
      status: "In Progress",
    },
    {
      id: 2,
      ticket_number: "T-0022",
      IT_owner: "Vera",
      category: "Database",
      priority: "High",
      status: "Open",
    },
    {
      id: 3,
      ticket_number: "T-0023",
      IT_owner: "Will",
      category: "Security",
      priority: "Critical",
      status: "Closed",
    },
    {
      id: 4,
      ticket_number: "T-0024",
      IT_owner: "Xena",
      category: "User Support",
      priority: "Medium",
      status: "In Progress",
    },
    {
      id: 5,
      ticket_number: "T-0025",
      IT_owner: "Yara",
      category: "Network",
      priority: "High",
      status: "Open",
    },
    {
      id: 6,
      ticket_number: "T-0026",
      IT_owner: "Zane",
      category: "Software",
      priority: "Low",
      status: "Resolved",
    },
    {
      id: 7,
      ticket_number: "T-0027",
      IT_owner: "Anna",
      category: "Hardware",
      priority: "Medium",
      status: "Closed",
    },
    {
      id: 8,
      ticket_number: "T-0028",
      IT_owner: "Ben",
      category: "Database",
      priority: "High",
      status: "In Progress",
    },
    {
      id: 9,
      ticket_number: "T-0029",
      IT_owner: "Cathy",
      category: "Security",
      priority: "Critical",
      status: "Open",
    },
    {
      id: 0,
      ticket_number: "T-0030",
      IT_owner: "Derek",
      category: "User Support",
      priority: "Medium",
      status: "Open",
    },
  ];

  const columns = [
    {
      sortable: true,
      field: "ticket_number",
      headerName: "Ticket no",
      width: 200,
    },
    {
      sortable: false,
      field: "IT_owner",
      headerName: "IT Owner",
      width: 200,
    },
    {
      sortable: false,
      field: "category",
      headerName: "Category",
      width: 200,
    },
    {
      sortable: false,
      field: "priority",
      headerName: "Priority",
      width: 200,
    },
    {
      sortable: false,
      field: "status",
      headerName: "Status",
      maxWidth: 150,
    },
    {
      field: "actions",
      sortable: false,
      headerName: "Actions",
      width: 200,
      renderCell: (params: any) => (
        <button
          onClick={() => {
            handleView(params);
          }}
          className={styles.reopenTicket}
        >
          <img src={reopenTicket} />
        </button>
      ),
    },
  ];

  const [formData, setFormData] = useState<any>({
    Title: {
      value: "",
      isValid: true,
      errorMsg: "Invalid title",
      validationRule: { required: true, type: "string" },
    },
    SendTowards: {
      value: "",
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
    thumbnail: {
      value: null,
      isValid: true,
      errorMsg: "Invalid file",
      validationRule: { required: true, type: "file" },
    },
    Description: {
      value: "",
      isValid: true,
      errorMsg: "This field is required",
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

  const currentUserDetails = useSelector(
    (state: { MainSPContext: { currentUserDetails: any } }) =>
      state.MainSPContext.currentUserDetails
  );

  const HelpDeskTicktesData: any = useSelector(
    (state: any) => state.HelpDeskTicktesData.value
  );
  console.log("HelpDeskTicktesData: ", HelpDeskTicktesData);

  const currentRoleBasedData: any = (() => {
    if (
      currentUserDetails?.role === "Pernix_Admin" ||
      currentUserDetails?.role === "HelpDesk_Ticket_Managers"
    ) {
      return {
        ...HelpDeskTicktesData,
        role: "ticket_manager",
      };
    } else {
      const isUser = HelpDeskTicktesData?.data?.some(
        (item: any) => item?.EmployeeName?.EMail === currentUserDetails?.email
      );

      const isItOwner = HelpDeskTicktesData?.data?.some(
        (item: any) => item?.ITOwner?.EMail === currentUserDetails?.email
      );

      let role = "undefined";

      if (isUser) {
        role = "user";
      }
      if (isItOwner) {
        role = "it_owner";
      }

      return {
        ...HelpDeskTicktesData,
        role,
        data: isUser
          ? HelpDeskTicktesData?.data?.filter(
              (item: any) =>
                item?.EmployeeName?.EMail === currentUserDetails?.email
            )
          : HelpDeskTicktesData?.data,
      };
    }
  })();

  console.log("currentRoleBasedData: ", currentRoleBasedData);

  useEffect(() => {
    getAllTickets(dispatch);
  }, []);

  return (
    <div className={styles.mytickets}>
      <div className={styles.mytickets_header}>
        <PageHeader title={"All tickets"} noBackBtn />
        <DefaultButton
          btnType="primaryGreen"
          text={"New ticket"}
          onClick={() => {
            setOpenNewTicketSlide(true);
          }}
          startIcon={<Add />}
        />
      </div>
      <DataTable
        rows={data}
        columns={columns}
        pageSize={10} // Optional page size
        checkboxSelection={false} // Enable checkbox selection
        // pagination={true} // Enable pagination
      />

      {/* new ticket slide */}
      <Drawer
        anchor={"right"}
        open={openNewTicketSlide}
        onClose={() => {
          setOpenNewTicketSlide(false);
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
              title={"New ticket"}
              headerClick={() => {
                setOpenNewTicketSlide(false);
              }}
              centered
              underlined
            />
            <div className={styles.inputs}>
              <CustomInput
                value={formData.Title.value}
                placeholder="Ticket number"
                isValid={formData.Title.isValid}
                errorMsg={formData.Title.errorMsg}
                onChange={(e) => {
                  const value = e;
                  const { isValid, errorMsg } = validateField(
                    "Title",
                    value,
                    formData.Title.validationRule
                  );
                  handleInputChange("Title", value, isValid, errorMsg);
                }}
              />
              <CustomInput
                value={formData.Title.value}
                placeholder="Employee name"
                isValid={formData.Title.isValid}
                errorMsg={formData.Title.errorMsg}
                onChange={(e) => {
                  const value = e;
                  const { isValid, errorMsg } = validateField(
                    "Title",
                    value,
                    formData.Title.validationRule
                  );
                  handleInputChange("Title", value, isValid, errorMsg);
                }}
              />

              <CustomPeoplePicker
                labelText="IT Owner"
                isValid={formData.SendTowards.isValid}
                errorMsg={formData.SendTowards.errorMsg}
                selectedItem={formData.SendTowards.value || []}
                onChange={(item: any) => {
                  const value = item[0];
                  console.log("value: ", value);
                  const { isValid, errorMsg } = validateField(
                    "SendTowards",
                    value,
                    formData.SendTowards.validationRule
                  );
                  handleInputChange("SendTowards", value, isValid, errorMsg);
                }}
              />

              <CustomDropDown
                value={formData.Status.value}
                options={["Active", "In Active"]}
                placeholder="Category"
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

              <CustomDropDown
                value={formData.Status.value}
                options={["Active", "In Active"]}
                placeholder="Priority"
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
              <CustomFileUpload
                accept="image/png,image/svg"
                value={formData.thumbnail.value?.name}
                onFileSelect={(file) => {
                  console.log("file: ", file);
                  const { isValid, errorMsg } = validateField(
                    "thumbnail",
                    file ? file.name : "",
                    formData.StartDate.thumbnail
                  );
                  handleInputChange("thumbnail", file, isValid, errorMsg);
                }}
                placeholder="Attachment"
                isValid={formData.thumbnail.isValid}
                errMsg={formData.thumbnail.errorMsg}
              />
            </div>
          </>

          <div className={styles.actions}>
            <DefaultButton btnType="darkGreyVariant" text={"Cancel"} />
            <DefaultButton btnType="primaryGreen" text={"Submit"} />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default MyTickets;
