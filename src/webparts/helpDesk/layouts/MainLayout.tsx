import { Outlet } from "react-router-dom";
// import PageHeader from "../../../components/common/PageHeader/PageHeader";
import LeftBar from "../components/LeftBar/LeftBar";
// import MyTickets from "../pages/MyTickets/MyTickets";
import styles from "./MainLayout.module.scss";

const MainLayout = (): JSX.Element => {
  return (
    // <div className={styles.ticketsGrid}>
    //   <div className={styles.ticketHeader}>
    //     <PageHeader title={"Tickets"} />
    //   </div>

    <div className={styles.contentGrid}>
      <div className={styles.lhsG}>
        <LeftBar />
      </div>
      <div className={styles.rhsG}>
        {/* <MyTickets /> */}
        <Outlet />
      </div>
    </div>
    // </div>
  );
};

export default MainLayout;
