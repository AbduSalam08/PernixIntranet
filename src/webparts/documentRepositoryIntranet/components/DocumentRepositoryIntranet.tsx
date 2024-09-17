/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import styles from "./DocumentRepositoryIntranet.module.scss";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
const folderIcon = require("../../../assets/images/svg/folderIcon.svg");
import { Carousel } from "primereact/carousel";

const DocumentRepositoryIntranet = (): JSX.Element => {
  const foldersData = [
    {
      title: "Project Documents",
      url: "https://example.com/project-documents",
    },
    {
      title: "Marketing Assets",
      url: "https://example.com/marketing-assets",
    },
    {
      title: "Financial Reports",
      url: "https://example.com/financial-reports",
    },
    {
      title: "Client Presentations",
      url: "https://example.com/client-presentations",
    },
    {
      title: "Team Photos",
      url: "https://example.com/team-photos",
    },
    {
      title: "Contracts and Agreements",
      url: "https://example.com/contracts-agreements",
    },
    {
      title: "Design Mockups",
      url: "https://example.com/design-mockups",
    },
    {
      title: "Training Materials",
      url: "https://example.com/training-materials",
    },
    {
      title: "Meeting Minutes",
      url: "https://example.com/meeting-minutes",
    },
    {
      title: "Archived Projects",
      url: "https://example.com/archived-projects",
    },
  ];

  const folderTemplate = (item: any): any => {
    return (
      <div className={styles.folderCard}>
        <img src={folderIcon} alt="folder image" />
        <span>{item?.title}</span>
      </div>
    );
  };

  const responsiveOptions = [
    {
      breakpoint: "1400px",
      numVisible: 8,
      numScroll: 1,
    },
    {
      breakpoint: "1199px",
      numVisible: 7,
      numScroll: 1,
    },
    {
      breakpoint: "767px",
      numVisible: 6,
      numScroll: 1,
    },
    {
      breakpoint: "575px",
      numVisible: 5,
      numScroll: 1,
    },
  ];

  return (
    <div className={styles.docRepoContainer}>
      <SectionHeaderIntranet label="Document Repository" />

      <Carousel
        className={styles.docCarousel}
        value={foldersData}
        numVisible={7}
        numScroll={2}
        responsiveOptions={responsiveOptions}
        itemTemplate={folderTemplate}
      />
    </div>
  );
};

export default DocumentRepositoryIntranet;
