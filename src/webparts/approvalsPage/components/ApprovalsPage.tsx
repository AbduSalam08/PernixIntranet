/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import styles from "./ApprovalsPage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";

const ApprovalsPage = (props: any): JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onLoadingFUN = async (): Promise<void> => {
    setIsLoading(false);
  };

  useEffect(() => {
    onLoadingFUN();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.LoaderContainer}>
          <CircularSpinner />
        </div>
      ) : (
        <div className={styles.LoaderContainer}>COMING SOON...</div>
      )}
    </div>
  );
};

export default ApprovalsPage;
