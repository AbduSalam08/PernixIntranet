/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from "./MainBannerIntranet.module.scss";
import QuickLinkCard from "./QuickLinkCard/QuickLinkCard";
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

const MainBannerIntranet = (): JSX.Element => {
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

  return (
    <div className={styles.container}>
      <div className={styles.imgWrapper} />
      <div className={styles.welcomeText}>
        <h1>Welcome Emily !</h1>
        <p>
          Don't judge each day by the harvest you reap but by the seeds that you
          plant.
        </p>
      </div>

      <div className={styles.quickLinks}>
        {quickLinks?.map((item: any, idx: number) => (
          <QuickLinkCard item={item} idx={idx} key={idx} />
        ))}
      </div>
    </div>
  );
};

export default MainBannerIntranet;
