/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */

import QuestionCeo from "../components/QuestionCeo/QuestionCeoIntranet";
import PollIntranet from "../components/PollIntranet/PollIntranet";
import Shoutout from "../components/Shoutout/ShoutOutsIntranet";
import styles from "./FlexipleSectionsIntranet.module.scss";
import { useEffect, useState } from "react";
import "./Style.css";
import EditIcon from "@mui/icons-material/Edit";

// import { Dialog } from "primereact/dialog";
// import { Checkbox } from "primereact/checkbox";
import SpServices from "../../../services/SPServices/SpServices";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import Popup from "../../../components/common/Popups/Popup";
import { Checkbox } from "primereact/checkbox";
import { ShowHide } from "../../../services/FlexipleSectionIntranet/FlexipleSectionIntranet";
import { sp } from "@pnp/sp/presets/all";
import { CONFIG } from "../../../config/config";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
// interface
interface Curobj {
  Id: number;
  isActive: boolean;
  Created: string;
  title: string;
}
// global variable
let _isAdmin: boolean = false;
const FlexipleSectionIntranet = (props: any): JSX.Element => {
  // state variable
  const [componentsList, setComponentsList] = useState<Curobj[]>([]);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [initialSelected, setInitialSelected] = useState<boolean>(false);
  const [isLoader, setIsLoader] = useState<boolean>(true);
  // local variable
  const currentUser: string = props?.context._pageContext._user.email;
  const isSubmitDisabled: boolean = isSelected === initialSelected;

  // popup controller
  const initialPopupController = [
    {
      open: false,
      popupTitle: "Show Component",

      popupWidth: "400px",
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

  const popupInputs: any[] = [
    [
      <div key={1}>
        <div style={{ margin: "10px 0px" }}>
          <p>Please Select Option</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              // margin: "10px 0px",
              margin: "15px 0px 0px 0px",
            }}
          >
            <Checkbox
              inputId="pollOption"
              value="Poll"
              onChange={(e: any) => setIsSelected(e.checked)}
              checked={isSelected}
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
          setIsSelected(poll?.isActive ?? false);
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
        disabled: isSubmitDisabled,
        // disabled: !Object.keys(formData).every((key) => formData[key].isValid),
        size: "large",
        onClick: async () => {
          await ShowHide(
            isSelected,
            componentsList,
            setPopupController,
            0,
            currentUser
          );
          // await handleSubmit();
        },
      },
    ],
  ];

  // get the admin data
  const _getAdmin = async (): Promise<void> => {
    await sp.web.siteGroups
      .getByName(CONFIG.SPGroupName.Pernix_Admin)
      .users.get()
      .then((res: any) => {
        _isAdmin = res.some(
          (val: any) => val?.Email?.toLowerCase() === currentUser?.toLowerCase()
        );
        setIsLoader(false);
      })
      .catch((err: any) => {
        console.log(err);
        setIsLoader(false);
      });
  };
  // Fetch data from the SharePoint list
  const getData = async (): Promise<void> => {
    try {
      const res: any[] = await SpServices.SPReadItems({
        Listname: CONFIG.ListNames.FlexibleSection,
        Select: "*, Author/EMail, Author/Title, Author/ID",
        Expand: "Author",
      });

      const formattedData: Curobj[] = await Promise.all(
        res?.map((val: any) => ({
          Id: val?.ID,
          title: val?.Title,
          isActive: val?.isActive,
          Created: val?.Author?.EMail || "",
        })) || []
      );

      setComponentsList(formattedData);
      const poll = formattedData.find((item: Curobj) => item.title === "Poll");
      setIsSelected(poll?.isActive ?? false);
      setInitialSelected(poll?.isActive ?? false);

      await _getAdmin();
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    setIsLoader(true);
    getData();
  }, []);

  return (
    <>
      {isLoader ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : (
        <div className={styles.flexibleSection}>
          {_isAdmin && (
            <div className={styles.icon}>
              <DefaultButton
                btnType="primaryGreen"
                title="Edit Layout"
                text={<EditIcon />}
                // text={"Edit Layout"}
                onClick={() => {
                  togglePopupVisibility(
                    setPopupController,
                    initialPopupController[0],
                    0,
                    "open"
                  );
                }}
                onlyIcon
                // onClick={resetPopup}
              />
            </div>
          )}

          <div className={styles.container}>
            {componentsList?.map(
              (component: Curobj) =>
                component?.isActive && (
                  <div key={component.title} style={{ flex: "1 1 100%" }}>
                    {component?.title === "QuestionCeo" && (
                      <QuestionCeo props={props} />
                    )}
                    {component?.title === "Poll" && (
                      <PollIntranet props={props} />
                    )}
                    {component?.title === "ShoutOuts" && (
                      <Shoutout props={props} />
                    )}
                  </div>
                )
            )}
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
        </div>
      )}
    </>
  );
};
export default FlexipleSectionIntranet;
