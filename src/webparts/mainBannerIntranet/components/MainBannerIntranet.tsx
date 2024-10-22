/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import styles from "./MainBannerIntranet.module.scss";
import QuickLinkCard from "./QuickLinkCard/QuickLinkCard";
import { getDailyQuote } from "../../../services/mainBannerIntranet/mainBannerIntranet";
import { useDispatch, useSelector } from "react-redux";
import { setMainSPContext } from "../../../redux/features/MainSPContextSlice";
import { RoleAuth } from "../../../services/CommonServices";
import {
  setBannerImage,
  setMotivationalQuotesData,
} from "../../../redux/features/MotivationalQuotesSlice";
import { Skeleton } from "primereact/skeleton"; // Import PrimeReact Skeleton
import { CONFIG } from "../../../config/config";
import { Add } from "@mui/icons-material";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import { IQuoteDatas, IUserDetails } from "../../../interface/interface";

// hover images - default
const OrganizationalChart = require("../../../assets/images/svg/quickLinks/orgChart.svg");
const EmployeeDirectory = require("../../../assets/images/svg/quickLinks/exployeeDirectory.svg");
const HelpDesk = require("../../../assets/images/svg/quickLinks/helpdesk.svg");
const PTO = require("../../../assets/images/svg/quickLinks/pto.svg");
const Approvals = require("../../../assets/images/svg/quickLinks/approvals.svg");
const ProjectTemplate = require("../../../assets/images/svg/quickLinks/projectTemplate.svg");

// hover images - white
const OrganizationalChartWhite = require("../../../assets/images/svg/quickLinks/orgChartWhite.svg");
const EmployeeDirectoryWhite = require("../../../assets/images/svg/quickLinks/exployeeDirectoryWhite.svg");
const HelpDeskWhite = require("../../../assets/images/svg/quickLinks/helpdeskWhite.svg");
const PTOWhite = require("../../../assets/images/svg/quickLinks/ptoWhite.svg");
const ApprovalsWhite = require("../../../assets/images/svg/quickLinks/approvalsWhite.svg");
const ProjectTemplateWhite = require("../../../assets/images/svg/quickLinks/projectTemplateWhite.svg");
const PernixBannerImage = require("../assets/PernixBannerImage.svg");

const MainBannerIntranet = (props: any): JSX.Element => {
  /* State creations */
  const [loading, setLoading] = useState<boolean>(true); // Add loading state

  // const MainContext: any = useSelector(
  //   (state: any) => state?.MainSPContext?.value
  // );
  const currentUserDetails: IUserDetails = useSelector(
    (state: any) => state?.MainSPContext?.currentUserDetails
  );
  const QuotesData: any = useSelector(
    (state: any) => state?.MotivationalQuotes
  );

  const dispatch = useDispatch();

  const quickLinks = [
    {
      img: OrganizationalChart,
      hoverImg: OrganizationalChartWhite,
      text: "Organizational chart",
    },
    {
      img: EmployeeDirectory,
      hoverImg: EmployeeDirectoryWhite,
      text: "Employee directory",
    },
    {
      img: HelpDesk,
      hoverImg: HelpDeskWhite,
      text: "Help desk",
      onClick: (_: any) => {
        window.open(
          props.context.pageContext.web.absoluteUrl +
            CONFIG.NavigatePage.HelpDeskPage,
          "_self"
        );
      },
    },
    {
      img: PTO,
      hoverImg: PTOWhite,
      text: "PTO",
    },
    {
      img: Approvals,
      hoverImg: ApprovalsWhite,
      text: "Approvals",
    },
    {
      img: ProjectTemplate,
      hoverImg: ProjectTemplateWhite,
      text: "Project template",
    },
  ];

  const onLoadingFUN = async (): Promise<void> => {
    dispatch(setMainSPContext(props?.context));
    await RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      CONFIG.SPGroupName.Mainbanner_Admin,
      dispatch
    );
    await getDailyQuote().then((value: IQuoteDatas[]) => {
      dispatch(setMotivationalQuotesData(value?.[0]?.Quote || ""));
      dispatch(setBannerImage(value?.[0]?.Attachments || ""));
      setLoading(false); // Set loading to false once data is retrieved
    });
  };

  useEffect(() => {
    setLoading(true);
    onLoadingFUN();
  }, [dispatch, props?.context]);

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: loading ? "#fff" : "var(--body-bgcolor)",
      }}
    >
      {loading ? (
        <Skeleton
          shape="rectangle"
          className={styles.imgWrapperSkeleton}
          width="calc(100% - 120px)"
          height="calc(100% - 60px)"
        />
      ) : (
        <img
          className={styles.imgWrapper}
          src={QuotesData?.bannerImage || PernixBannerImage}
          alt="Banner"
          style={{
            objectFit: "cover",
            width: "100%",
          }}
        />
      )}

      <div
        className={styles.btnAlign}
        onClick={(_) => {
          window.open(
            props.context.pageContext.web.absoluteUrl +
              CONFIG.NavigatePage.MotivationPage,
            "_self"
          );
        }}
      >
        <DefaultButton
          onlyIcon={true}
          btnType="primaryGreen"
          size="medium"
          text={
            <Add
              sx={{
                width: "20px",
                fontSize: "24px",
                color: "#fff",
              }}
            />
          }
        />
      </div>

      <div
        className={styles.welcomeText}
        onClick={(_) => {
          console.log("currentUserDetails: ", currentUserDetails);
        }}
      >
        {loading ? (
          <>
            <Skeleton width="50%" height="2rem" />
            <Skeleton width="70%" height="1.5rem" />
          </>
        ) : (
          <>
            <h1>Welcome {currentUserDetails?.userName} !</h1>
            <p>{QuotesData?.value || ""}</p>
          </>
        )}
      </div>

      <div className={loading ? styles.quickLinksLoading : styles.quickLinks}>
        {loading
          ? Array(6)
              .fill(null)
              .map((_, idx) => (
                <Skeleton
                  key={idx}
                  shape="rectangle"
                  height="100px"
                  width="160px"
                  style={{
                    backgroundColor: "#00000070",
                  }}
                />
              ))
          : quickLinks?.map((item: any, idx: number) => (
              <QuickLinkCard
                onClick={item?.onClick}
                value={item}
                idx={idx}
                key={idx}
              />
            ))}
      </div>
    </div>
  );
};

export default MainBannerIntranet;
