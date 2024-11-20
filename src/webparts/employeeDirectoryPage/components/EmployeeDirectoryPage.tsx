/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import styles from "./EmployeeDirectoryPage.module.scss";
import { MSGraphClient } from "@microsoft/sp-http";

import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
// import DataTable from "../../../components/common/DataTable/DataTable";

const EmployeeDirectoryPage = (props: any): JSX.Element => {
  // const;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>([]);

  console.log(userData);
  const onLoadingFUN = async (): Promise<void> => {
    setIsLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    getallusers();
  };
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const getallusers = async () => {
    props.context.msGraphClientFactory
      .getClient()
      .then((client: MSGraphClient) => {
        client
          .api("/users?$filter=userType eq 'Member'")
          .version("v1.0")
          .top(999)
          .get()
          .then((response) => {
            const tempdata: any = [];
            response.value.forEach((item: any) => {
              tempdata.push({
                Phone: item.businessPhones,
                Name: item.displayName,
                Id: item.id,
                JobTitle: item.JobTitle,
                SureName: item.surname,
                Language: item.preferredLanguage,
                Email: item.userPrincipalName,
              });
            });
            setUserData([...tempdata]);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching users: ", error);
          });
      });
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
        <div className={styles.LoaderContainer}>
          <div>
            {/* <DataTable
        rows={dataGridProps?.data ?? []}
        // rows={dataGridProps?.sortedBy==="Asc (Old)"? currentRoleBasedData?.data:dataGridProps?.sortedBy==="Desc (Latest)"?DescData:[]}
        columns={columns}
        emptyMessage="No tickets found!"
        isLoading={HelpDeskTicktesData?.isLoading}
        pageSize={10}
        checkboxSelection={false}
      /> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectoryPage;
