/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises*/
/* eslint-disable @typescript-eslint/no-use-before-define*/

import QuestionCeo from "../components/QuestionCeo/QuestionCeoIntranet";
import PollIntranet from "../components/PollIntranet/PollIntranet";
import Shoutout from "../components/Shoutout/ShoutOutsIntranet";
import styles from "./FlexipleSectionsIntranet.module.scss";
import { useEffect, useState } from "react";
import "./Style.css";
// import { Dialog } from "primereact/dialog";
// import { Checkbox } from "primereact/checkbox";
import SpServices from "../../../services/SPServices/SpServices";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import Popup from "../../../components/common/Popups/Popup";
import { Checkbox } from "primereact/checkbox";
import { ShowHide } from "../../../services/FlexipleSectionIntranet/FlexipleSectionIntranet";
const FlexipleSectionIntranet = (props: any) => {
  const currentUser = props?.context._pageContext._user.email;
  const initialPopupController = [
    {
      open: false,
      popupTitle: "Show Component",

      popupWidth: "300px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "FlexibleSection added successfully!",
        error: "Something went wrong!",
        successDescription:
          "The new FlexibleSection 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding FlexibleSection, please try again later.",
        inprogress: "Adding new FlexibleSection, please wait...",
      },
    },
  ];

  const [popupController, setPopupController] = useState(
    initialPopupController
  );
  // const [isPopup, setIsPopup] = useState(false); // Controls popup visibility
  const [componentsList, setComponentsList] = useState<any[]>([]);
  const [pollSelected, setPollSelected] = useState(false);

  const popupInputs: any[] = [
    [
      <div key={1}>
        <div>
          <p>Please Select Option</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "15px 0px 0px 0px",
            }}
          >
            <Checkbox
              inputId="pollOption"
              value="Poll"
              onChange={(e: any) => setPollSelected(e.checked)}
              checked={pollSelected}
            />
            <label htmlFor="pollOption" className="ml-2">
              Poll
            </label>
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
          const poll = componentsList.find((item) => item.title === "Poll");
          setPollSelected(poll?.isActive ?? false);
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
        // disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          handleConfirm();
          // await handleSubmit();
        },
      },
    ],
  ];
  // Fetch data from the SharePoint list
  const getData = async () => {
    try {
      const res = await SpServices.SPReadItems({
        Listname: "ShowComponent",

        Select: "*, Author/EMail, Author/Title, Author/ID",
        Expand: "Author",
      });

      const formattedData = res.map((val: any) => ({
        Id: val.ID,
        title: val.Title,
        isActive: val.isActive,
        Created: val?.Author?.EMail || "",
      }));

      setComponentsList(formattedData);

      // Initialize pollSelected state for the current user
      const poll = formattedData.find(
        (item) => item.title === "Poll" && item.Created === currentUser
      );
      setPollSelected(poll?.isActive ?? false);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Update data in the SharePoint list
  // const updateData = async (val: any) => {
  //   try {
  //     const pollComponent = componentsList.find(
  //       (component: any) => component.title === "Poll"
  //     );

  //     if (pollComponent) {
  //       await SpServices.SPUpdateItem({
  //         Listname: "ShowComponent",
  //         ID: pollComponent.Id,
  //         RequestJSON: { isActive: val },
  //       });
  //       console.log("Poll component updated successfully!");
  //     }
  //   } catch (err) {
  //     console.error("Error updating Poll component:", err);
  //   }
  // };

  useEffect(() => {
    getData();
  }, []);

  const handleConfirm = async () => {
    // setComponentsList((prevList: any) =>
    //   prevList.map((component: any) =>
    //     component.title === "Poll"
    //       ? { ...component, isActive: pollSelected }
    //       : component
    //   )
    // );
    await ShowHide(
      pollSelected,
      componentsList,
      setPopupController,
      0,
      currentUser
    );
    // setIsPopup(false);
    // updateData(pollSelected);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <i
          onClick={() => {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              0,
              "open"
            );
          }}
          className="pi pi-pencil"
          style={{ fontSize: "1rem", color: "blue", cursor: "pointer" }}
        ></i>
      </div>

      <div className={styles.container}>
        {componentsList.map((component: any) => {
          if (component.title === "Poll") {
            // Poll component is shown only for the current user based on isActive
            return (
              component.Created === currentUser &&
              component.isActive && (
                <div key={component.title} style={{ flex: "1 1 100%" }}>
                  <PollIntranet props={props} />
                </div>
              )
            );
          } else {
            // Other components are shown to all users
            return (
              <div key={component.title} style={{ flex: "1 1 100%" }}>
                {component.title === "QuestionCeo" && (
                  <QuestionCeo props={props} />
                )}
                {component.title === "ShoutOuts" && <Shoutout props={props} />}
              </div>
            );
          }
        })}
      </div>

      {/* <div className={styles.container}>
        {componentsList.map(
          (component: any) =>
            component.isActive && (
              <div key={component.title} style={{ flex: "1 1 100%" }}>
                {component.title === "QuestionCeo" && (
                  <QuestionCeo props={props} />
                )}
                {component.title === "Poll" && <PollIntranet props={props} />}
                {component.title === "ShoutOuts" && <Shoutout props={props} />}
              </div>
            )
        )}
      </div> */}

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
            // resetFormData(formData, setFormData);
            // resetOptionsData(options, setOptions);
            if (popupData?.isLoading?.success) {
              getData();
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
            popupData.popupType !== "custom" ? popupData.popupTitle : ""
          }
          popupHeight={index === 0 ? true : false}
          noActionBtn={true}
        />
      ))}
      {/* Popup Dialog */}
    </>
  );
};
export default FlexipleSectionIntranet;
