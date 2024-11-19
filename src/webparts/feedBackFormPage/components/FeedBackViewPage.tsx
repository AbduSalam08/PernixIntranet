/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import styles from "./FeedBackFormPage.module.scss";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import {
  IFeedbackResType,
  IPageSearchFields,
} from "../../../interface/interface";
import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { CONFIG } from "../../../config/config";
import { Avatar } from "@mui/material";

/* Global variable creation */
let masterData: IFeedbackResType[] = [];

const FeedBackViewPage = (props: any): JSX.Element => {
  /* State creation */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [commonSearch, setCommonSearch] = useState<IPageSearchFields>({
    ...CONFIG.PageSearchFields,
  });
  const [masterResponses, setMasterResponses] = useState<IFeedbackResType[]>(
    []
  );

  /* Functions creation */
  const handleSearch = async (value: string = ""): Promise<void> => {
    let temp: IFeedbackResType[] = [...masterData];

    temp = await Promise.all(
      temp?.filter(
        (val: IFeedbackResType) =>
          val?.Answer.toLowerCase().includes(value.toLowerCase()) ||
          val?.CreatedBy?.Title.toLowerCase().includes(value.toLowerCase())
      ) || []
    );

    setMasterResponses(temp);
  };

  const onLoadingFUN = async (): Promise<void> => {
    const selectedResponses: IFeedbackResType[] = await Promise.all(
      props?.masterFeedBackRes?.filter(
        (val: IFeedbackResType) =>
          val.FeedbackQuestionId === props?.curObject?.ID
      ) || []
    );

    masterData = selectedResponses;
    setMasterResponses(selectedResponses);
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
        <>
          {/* Header section */}
          <div className={styles.headerContainer}>
            <div className={styles.backContainer}>
              <div
                style={{
                  cursor: "pointer",
                }}
                onClick={(_) => {
                  props.setIsQuestion(true);
                }}
              >
                <i
                  className="pi pi-arrow-circle-left"
                  style={{
                    fontSize: "26px",
                    color: "#e0803d",
                  }}
                />
              </div>
              <div className={styles.backHeader}>Back</div>
            </div>

            <div className={styles.searchContainer}>
              <div>
                <CustomInput
                  noErrorMsg
                  value={commonSearch?.Search}
                  placeholder="Search"
                  onChange={(e: any) => {
                    const value: string = e.trimStart();
                    setCommonSearch((prev: IPageSearchFields) => ({
                      ...prev,
                      Search: value,
                    }));
                    handleSearch(value);
                  }}
                />
              </div>
              <div
                className={styles.refreshBTN}
                onClick={(_) => {
                  setCommonSearch((prev: IPageSearchFields) => ({
                    ...prev,
                    Search: "",
                  }));
                  handleSearch("");
                }}
              >
                <i className="pi pi-refresh" />
              </div>
            </div>
          </div>

          {/* Title section */}
          <div className={styles.viewTitleSec}>
            {props?.curObject?.Title || ""}
          </div>

          {/* Body section */}
          {masterResponses.length ? (
            <div className={styles.viewBodyContainer}>
              {masterResponses?.map?.((val: IFeedbackResType, idx: number) => {
                return (
                  <div key={idx} className={styles.viewBodySec}>
                    <div title={val?.Answer} className={styles.viewAnsSec}>
                      {val?.Answer}
                    </div>
                    <div className={styles.viewCardFooter}>
                      <div className={styles.viewAvatarSec}>
                        <Avatar
                          style={{
                            width: "30px",
                            height: "30px",
                          }}
                          alt="Remy Sharp"
                          src={`${CONFIG.userImageURL}${val?.CreatedBy?.Email}`}
                        />
                        <div>{val?.CreatedBy?.Title}</div>
                      </div>
                      <div className={styles.viewDateSec}>{val?.Date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.bodyNoDataFound}>No responses found!</div>
          )}
        </>
      )}
    </div>
  );
};

export default FeedBackViewPage;
