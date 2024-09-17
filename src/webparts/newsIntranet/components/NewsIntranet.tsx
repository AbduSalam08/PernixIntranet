/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import resetPopupController, {
  togglePopupVisibility,
} from "../../../utils/popupUtils";
import NewsCard from "./NewsCard/NewsCard";
import styles from "./NewsIntranet.module.scss";
import Popup from "../../../components/common/Popups/Popup";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
// import CustomTextArea from "../../../components/common/CustomInputFields/CustomTextArea";
import CustomDropDown from "../../../components/common/CustomInputFields/CustomDropDown";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
const PernixBannerImage = require("../../../assets/images/svg/PernixBannerImage.svg");

const NewsIntranet = (): JSX.Element => {
  // const [newData, setNewsData] = useState({
  //   newsTitle: {
  //     value: "",
  //     isValid: false,
  //   },
  //   startDate: {
  //     value: "",
  //     isValid: false,
  //   },
  //   endDate: {
  //     value: "",
  //     isValid: false,
  //   },
  //   status: {
  //     value: "",
  //     isValid: false,
  //   },
  //   thumbnail: {
  //     value: "",
  //     isValid: false,
  //   },
  //   description: {
  //     value: "",
  //     isValid: false,
  //   },
  // });

  // popup properties
  const initialPopupController = [
    {
      open: false,
      popupTitle: "Add News",
      popupWidth: "450px",
      popupType: "custom",
      defaultCloseBtn: false,
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "News added successfully!",
        error: "Something went wrong!",
        successDescription: "The new news 'ABC' has been added successfully.",
        errorDescription:
          "An error occured while adding news, please try again later.",
        inprogress: "Adding new news, please wait...",
      },
    },
  ];

  const [popupController, setPopupController] = useState(
    initialPopupController
  );

  const popupInputs: any[] = [
    [
      <CustomInput
        value={""}
        key={1}
        autoFocus
        placeholder="Enter title"
        isValid={false}
        errorMsg="Invalid title"
      />,
      <CustomDateInput
        key={2}
        value={""}
        label="Start date"
        error={true}
        errorMsg="Invalid input"
      />,
      <CustomDateInput
        key={2}
        value={""}
        label="End date"
        error={true}
        errorMsg="Invalid input"
      />,
      <CustomDropDown
        errorMsg={"Status is required"}
        value={""}
        isValid={false}
        placeholder="Status"
        key={3}
      />,
      <FloatingLabelTextarea
        key={4}
        value={""}
        // onChange={(newValue) => setValue(newValue)}
        placeholder="Your description here"
        // size="MD"
        rows={5}
        // isValid={hasError}
        errorMsg="This field is required"
        withLabel={false}
        // labelText="Description"
        disabled={false}
        mandatory={true}
      />,
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
          togglePopupVisibility(setPopupController, 0, "close");
        },
      },
      {
        text: "Submit",
        btnType: "primaryGreen",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          console.log("clicked");
        },
      },
    ],
  ];

  const newsItems = [
    {
      imageUrl: PernixBannerImage, // Replace with your image URL
      title:
        "Beyond Dashboard: The Future of Analytics and Business Intelligence",
      description:
        "Explore the next generation of analytics tools that go beyond traditional dashboards to provide deeper insights and predictive capabilities.",
      status: "Active",
    },
    {
      imageUrl: PernixBannerImage, // Replace with your image URL
      title: "The Rise of AI: Transforming the Business Landscape",
      description:
        "Artificial Intelligence is no longer just a buzzword; it's reshaping industries and driving new business models.",
      status: "Upcoming",
    },
    {
      imageUrl: PernixBannerImage, // Replace with your image URL
      title: "Data Privacy in the Digital Age: Challenges and Solutions",
      description:
        "As data breaches become more common, understanding how to protect personal and business data is critical for success.",
      status: "Archived",
    },
  ];

  return (
    <div className={styles.newsContainer}>
      <SectionHeaderIntranet
        label={"News"}
        headerAction={() => {
          togglePopupVisibility(setPopupController, 0, "open");
        }}
      />
      <div className={styles.newsContainerWrapper}>
        {newsItems?.map((item: any, idx: number) => {
          return (
            <NewsCard
              title={item?.title}
              imageUrl={item.imageUrl}
              key={idx}
              description={item?.description}
              noActions={true}
              noStatus={true}
            />
          );
        })}
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
          onHide={() =>
            togglePopupVisibility(setPopupController, index, "close")
          }
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

export default NewsIntranet;
