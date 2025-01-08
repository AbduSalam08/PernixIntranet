import Checkpoints from "./Checkpoints/Checkpoints";
import Countdown from "./Countdown/Countdown";
import Documents from "./Documents/Documents";
import ImageSection from "./ImageSection/ImageSection";
import ImportantLinks from "./ImportantLink/ImportantLinks";
import Details from "./ProjectDetails/Details";
import Summary from "./Summary/Summary";
import styles from "./ViewComponent.module.scss";

const ViewComponent = ({ selectedProject }: any) => {
  console.log("selectedProject: ", selectedProject);
  return (
    <div className={styles.container}>
      <div className={styles.firstRow}>
        <div className={styles.imgSection}>
          <ImageSection value={selectedProject} />
        </div>

        <div className={styles.detailsSection}>
          <Details value={selectedProject} />
        </div>
      </div>

      <div className={styles.secondRow}>
        <div className={styles.summarySection}>
          <Summary value={selectedProject} />
        </div>
        <div className={styles.countdownSection}>
          <Countdown />
        </div>
      </div>

      <div>
        <Documents value={selectedProject} />
      </div>

      <div>
        <ImportantLinks />
      </div>

      <div>
        <Checkpoints value={selectedProject} />
      </div>
    </div>
  );
};
export default ViewComponent;
