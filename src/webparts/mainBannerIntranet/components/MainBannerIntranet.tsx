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
import { IQuoteDatas, IUserDetails } from "../../../interface/interface";
import moment from "moment";
import { sp } from "@pnp/sp/presets/all";

// hover images - default
// const OrganizationalChart = require("../../../assets/images/svg/quickLinks/orgChart.svg");
const EmployeeDirectory = require("../../../assets/images/svg/quickLinks/exployeeDirectory.svg");
const HelpDesk = require("../../../assets/images/svg/quickLinks/helpdesk.svg");
// const PTO = require("../../../assets/images/svg/quickLinks/pto.svg");
const Approvals = require("../../../assets/images/svg/quickLinks/approvals.svg");
// const ProjectTemplate = require("../../../assets/images/svg/quickLinks/projectTemplate.svg");

// hover images - white
// const OrganizationalChartWhite = require("../../../assets/images/svg/quickLinks/orgChartWhite.svg");
const EmployeeDirectoryWhite = require("../../../assets/images/svg/quickLinks/exployeeDirectoryWhite.svg");
const HelpDeskWhite = require("../../../assets/images/svg/quickLinks/helpdeskWhite.svg");
// const PTOWhite = require("../../../assets/images/svg/quickLinks/ptoWhite.svg");
const ApprovalsWhite = require("../../../assets/images/svg/quickLinks/approvalsWhite.svg");
// const ProjectTemplateWhite = require("../../../assets/images/svg/quickLinks/projectTemplateWhite.svg");
//const PernixBannerImage = require("../assets/PernixBannerImage.svg");

let curUserName: string = "";

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
    // {
    //   img: OrganizationalChart,
    //   hoverImg: OrganizationalChartWhite,
    //   text: "Organizational chart",
    //   onClick: (_: any) => {
    //     window.open(
    //       props.context.pageContext.web.absoluteUrl +
    //         CONFIG.NavigatePage.OrgChartPage,
    //       "_self"
    //     );
    //   },
    // },
    {
      img: EmployeeDirectory,
      hoverImg: EmployeeDirectoryWhite,
      text: "Employee directory",
      onClick: (_: any) => {
        window.open(
          props.context.pageContext.web.absoluteUrl +
            CONFIG.NavigatePage.EmployeeDirectoryPage,
          "_self"
        );
      },
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
    // {
    //   img: PTO,
    //   hoverImg: PTOWhite,
    //   text: "PTO",
    //   onClick: (_: any) => {
    //     window.open(
    //       props.context.pageContext.web.absoluteUrl +
    //         CONFIG.NavigatePage.PTOPage,
    //       "_self"
    //     );
    //   },
    // },
    // {
    //   img: ProjectTemplate,
    //   hoverImg: ProjectTemplateWhite,
    //   text: "Project template",
    //   onClick: (_: any) => {
    //     window.open(
    //       props.context.pageContext.web.absoluteUrl +
    //         CONFIG.NavigatePage.ProjectTemplatePage,
    //       "_self"
    //     );
    //   },
    // },
    {
      img: Approvals,
      hoverImg: ApprovalsWhite,
      text: "Admin activities",
      onClick: (_: any) => {
        window.open(
          props.context.pageContext.web.absoluteUrl +
            CONFIG.NavigatePage.ApprovalsPage,
          "_self"
        );
      },
    },
  ];

  const onLoadingFUN = async (): Promise<void> => {
    dispatch(setMainSPContext(props?.context));
    await RoleAuth(
      CONFIG.SPGroupName.Pernix_Admin,
      {
        highPriorityGroups: [CONFIG.SPGroupName.Mainbanner_Admin],
      },
      dispatch
    );
    await getDailyQuote().then(async (value: IQuoteDatas[]) => {
      let tempJSON: IQuoteDatas[] = await Promise.all(
        value?.filter((val: IQuoteDatas) => val.Status === "Active") || []
      );
      if (tempJSON.length) {
        tempJSON = await Promise.all(
          tempJSON?.filter(
            (val: IQuoteDatas) =>
              Number(moment().format("YYYYMMDD")) >=
                Number(moment(val.StartDate).format("YYYYMMDD")) &&
              Number(moment().format("YYYYMMDD")) <=
                Number(moment(val.EndDate).format("YYYYMMDD"))
          )
        );
      }
      dispatch(setMotivationalQuotesData(tempJSON?.[0]?.Quote || ""));
      dispatch(setBannerImage(tempJSON?.[0]?.Attachments || ""));
      setLoading(false); // Set loading to false once data is retrieved
    });
  };

  const currentUserName = async (): Promise<void> => {
    const currentUser: any = await sp.web.currentUser.get();
    curUserName = currentUser?.Title ?? "";
  };

  useEffect(() => {
    setLoading(true);
    currentUserName();
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
          src={QuotesData?.bannerImage}
          alt="Banner"
          style={{
            objectFit: "cover",
            width: "100%",
            display: QuotesData?.bannerImage ? "block" : "none",
          }}
        />
      )}

      <div className={styles.btnAlign}>
        <i
          className="pi pi-arrow-right"
          onClick={(_) => {
            window.open(
              props.context.pageContext.web.absoluteUrl +
                CONFIG.NavigatePage.MotivationPage,
              "_self"
            );
          }}
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
            <h1>Welcome {curUserName} !</h1>
            <p>{QuotesData?.value || ""}</p>
          </>
        )}
      </div>

      <div className={loading ? styles.quickLinksLoading : styles.quickLinks}>
        {loading
          ? Array(quickLinks?.length)
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
