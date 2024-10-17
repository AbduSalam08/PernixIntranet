import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import styles from "./Dashboard.module.scss";

const Dashboard = (): JSX.Element => {
  return (
    <div className={styles.myDashboard}>
      <div className={styles.myDashboard_header}>
        <PageHeader title={"Dashboard"} noBackBtn />
      </div>
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className="chart" />
          <div className={styles.chartDetails}>Ticket by status</div>
        </div>
        <div className={styles.metricCard}>
          <div className="chart" />
          <div className={styles.chartDetails}>Tickets by source</div>
        </div>
        <div className={styles.metricCard}>
          <div className="chart" />
          <div className={styles.chartDetails}>Tickets by day of week</div>
        </div>
        <div className={styles.metricCard}>
          <div className="chart" />
          <div className={styles.chartDetails}>Current ticket statuses</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
