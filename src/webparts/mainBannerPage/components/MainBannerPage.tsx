/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import styles from "./MainBannerPage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import CustomDateInput from "../../../components/common/CustomInputFields/CustomDateInput";
import { SearchBox } from "@fluentui/react";
import { CONFIG } from "../../../config/config";
import { getDailyQuote } from "../../../services/mainBannerIntranet/mainBannerIntranet";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import { Add } from "@mui/icons-material";
import { IQuoteDatas } from "../../../interface/interface";
import moment from "moment";

/* Global variable creation */
const PernixBannerImage = require("../assets/PernixBannerImage.svg");

let masterQuotes: IQuoteDatas[] = [];

const MainBannerPage = (props: any): JSX.Element => {
  /* State creation */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [allQuotes, setAllQuotes] = useState<IQuoteDatas[]>([]);

  /* Functions creation */
  const prepareDatas = async (curTab: string): Promise<void> => {
    let tempArray: IQuoteDatas[] = [];

    if (curTab === CONFIG.TabsName[0]) {
      tempArray = await Promise.all(
        masterQuotes?.filter(
          (val: IQuoteDatas) =>
            Number(moment().format("YYYYMMDD")) >=
              Number(moment(val.StartDate).format("YYYYMMDD")) &&
            Number(moment().format("YYYYMMDD")) <=
              Number(moment(val.EndDate).format("YYYYMMDD"))
        )
      );
    } else if (curTab === CONFIG.TabsName[1]) {
      tempArray = await Promise.all(
        masterQuotes?.filter(
          (val: IQuoteDatas) =>
            Number(moment().format("YYYYMMDD")) <
            Number(moment(val.StartDate).format("YYYYMMDD"))
        )
      );
    } else {
      tempArray = await Promise.all(
        masterQuotes?.filter(
          (val: IQuoteDatas) =>
            Number(moment().format("YYYYMMDD")) >
            Number(moment(val.EndDate).format("YYYYMMDD"))
        )
      );
    }

    setSelectedTab(curTab);
    setAllQuotes([...tempArray]);
    setIsLoading(false);
  };

  const onLoadingFUN = async (): Promise<void> => {
    await getDailyQuote().then(async (val: IQuoteDatas[]) => {
      masterQuotes = [...val];
      await prepareDatas(CONFIG.TabsName[0]);
    });
  };

  useEffect(() => {
    onLoadingFUN();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <>
          <CircularSpinner />
        </>
      ) : (
        <>
          {/* Header section */}
          <div className={styles.headerContainer}>
            <div
              className={styles.backContainer}
              onClick={(_) => {
                console.log("_");
              }}
            >
              <div>
                <i
                  className="pi pi-arrow-circle-left"
                  style={{
                    fontSize: "26px",
                    color: "#e0803d",
                  }}
                />
              </div>
              <div className={styles.backHeader}>Main Banner</div>
            </div>

            <div className={styles.searchContainer}>
              <div>
                <SearchBox />
              </div>
              <div>
                <CustomDateInput placeHolder="Date" value={""} />
              </div>
              <div className={styles.refreshBTN}>
                <i className="pi pi-refresh" />
              </div>
              <div>
                {/* <Button label="Add new" icon="pi pi-plus" /> */}
                <DefaultButton
                  text="Add new"
                  btnType="primaryGreen"
                  startIcon={<Add />}
                />
              </div>
            </div>
          </div>

          {/* Tab section */}
          <div className={styles.tabsContainer}>
            {CONFIG.TabsName.map((str: string, i: number) => {
              return (
                <div
                  key={i}
                  style={{
                    borderBottom:
                      selectedTab === str ? "3px solid #e0803d" : "none",
                  }}
                  onClick={(_) => {
                    setIsLoading(true);
                    prepareDatas(str);
                  }}
                >
                  {str} Motivation
                </div>
              );
            })}
          </div>

          {/* Body section */}
          <div className={styles.bodyContainer}>
            {allQuotes?.map((val: IQuoteDatas, i: number) => {
              return (
                <div key={i} className={styles.cardSection}>
                  <img
                    className={styles.cardIMG}
                    src={val?.Attachments || PernixBannerImage}
                    alt="Banner"
                  />
                  <div className={styles.cardBody}>{val?.Quote || ""}</div>
                  <div className={styles.cardIcon}>
                    <div>
                      <i
                        className="pi pi-eye"
                        style={{
                          color: "#1ab800",
                        }}
                      />
                    </div>
                    <div>
                      <i
                        className="pi pi-pen-to-square"
                        style={{
                          color: "#007ef2",
                        }}
                      />
                    </div>
                    <div>
                      <i
                        className="pi pi-trash"
                        style={{
                          color: "#ff1c1c",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination section */}
          <div className={styles.paginationContainer}></div>
        </>
      )}
    </div>
  );
};

export default MainBannerPage;
