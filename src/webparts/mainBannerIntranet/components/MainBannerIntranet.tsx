/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import styles from "./MainBannerIntranet.module.scss";
import QuickLinkCard from "./QuickLinkCard/QuickLinkCard";
const OrganizationalChart = require("../../../assets/images/svg/quickLinks/orgChart.svg");
const EmployeeDirectory = require("../../../assets/images/svg/quickLinks/exployeeDirectory.svg");
const HelpDesk = require("../../../assets/images/svg/quickLinks/helpdesk.svg");
const PTO = require("../../../assets/images/svg/quickLinks/pto.svg");
const Approvals = require("../../../assets/images/svg/quickLinks/approvals.svg");
const ProjectTemplate = require("../../../assets/images/svg/quickLinks/projectTemplate.svg");
const MainBannerIntranet = (): JSX.Element => {
  const quickLinks = [
    {
      img: OrganizationalChart,
      text: "Organizational chart",
    },
    {
      img: EmployeeDirectory,
      text: "Employee directory",
    },
    {
      img: HelpDesk,
      text: "Help desk",
    },
    {
      img: PTO,
      text: "PTO",
    },
    {
      img: Approvals,
      text: "Approvals",
    },
    {
      img: ProjectTemplate,
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
