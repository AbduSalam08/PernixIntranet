/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import styles from "./NewsCard.module.scss";
import "./Style.css";
import { CONFIG } from "../../../../config/config";
import { InputSwitch } from "primereact/inputswitch";
import DefaultButton from "../../../../components/common/Buttons/DefaultButton";
import { getStatusStyles } from "../../../../services/newsIntranet/newsInranet";

interface NewsCardProps {
  Id?: number;
  idx?: number;
  imageUrl: string;
  title: string;
  isActive: boolean;
  description: string;
  status?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  noActions?: boolean;
  noStatus?: boolean;
  currentUserDetails: any;
  item?: any;
  setisDelete?: (isDelete: boolean) => void;
  prepareNewsData?: (item: any) => any;
  handleActive?: (item: any, value: any) => any;
  // setIsview?: (isview: boolean) => void;
  handleDeleteClick: (id: any) => void;
  setIsEdit?: (isEdit: boolean) => void; // Add setIsEdit prop
  noActionsAndStatus?: boolean;
  handleEditClick?: (item: any) => void; // Modify this to accept an item
  handleViewClick?: (item: any, isActive: string) => void; // Modify this to accept an item
  handleApproveClick?: (item: any) => void;
  selectedTab?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
  idx,
  imageUrl,
  title,
  description,
  status,
  isActive,
  onEdit,
  onDelete,
  noActions,
  noStatus,
  handleEditClick,
  handleDeleteClick,
  setIsEdit,
  setisDelete,
  // setIsview,
  handleViewClick,
  prepareNewsData,
  handleApproveClick,
  currentUserDetails,
  handleActive,
  item,
  noActionsAndStatus = false,
  selectedTab,
}) => {
  console.log("description: ", description);
  const handleEdit = (): void => {
    if (handleEditClick) {
      setisDelete?.(false);
      setIsEdit?.(true);
      handleEditClick(item); // Pass the item back to the parent
    }
  };

  const handleDelete = (): void => {
    setIsEdit?.(false);
    setisDelete?.(true);
    handleDeleteClick(item.ID);
  };

  const handleView = (): any => {
    if (handleViewClick) {
      handleViewClick(item, item.isActive);
    }
  };
  const handleApprove = (): any => {
    debugger;
    if (handleApproveClick) {
      handleApproveClick(item);
    }
  };

  const handleInput = (value: any): any => {
    debugger;
    if (handleActive) {
      handleActive(item, value);
    }
  };

  return (
    <div className={styles.newsCard} key={idx}>
      <img
        src={imageUrl}
        alt="News Thumbnail"
        className={styles.newsThumbNail}
      />
      <div className={styles.rhsTexts}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 title={title}>{title}</h2>

          <div
            style={{
              display:
                currentUserDetails.role !== CONFIG.RoleDetails.user &&
                status === "Approved"
                  ? "flex"
                  : "none",
            }}
          >
            <InputSwitch
              className="sectionToggler"
              checked={isActive}
              onChange={async (data: any) => {
                handleInput(data?.value);
                // const curIndex: number = newsIntranetData?.data?.findIndex(
                //   (res: any) => res?.ID === item?.ID
                // );

                // newsIntranetData.data[curIndex].isActive = data?.value;

                // await inActive(
                //   Number(item?.ID),

                //   data?.value
                // );
                // if (prepareNewsData) {
                //   await prepareNewsData(selectedTab);
                // }
              }}
            />
          </div>
        </div>
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{
            __html: typeof description === "string" ? description : "",
          }}
        />
        {/* <span title={description}>{description}</span> */}
      </div>

      <div
        style={{
          display:
            //   currentUserDetails.role === CONFIG.RoleDetails.user &&
            selectedTab === CONFIG.NewsTab[3] ? "flex" : "none",
        }}
        className={styles.cardApproveSec}
      >
        <DefaultButton
          btnType="secondaryGreen"
          text="Approve"
          size="small"
          onClick={
            handleApprove
            // const curIndex: number = masterBlog?.findIndex(
            //   (res: IBlogColumnType) => res?.ID === val?.ID
            // );
            // setSelData((prev: IBlogDetails) => ({
            //   ...prev,
            //   ID: val?.ID,
            //   Idx: curIndex,
            // }));
            // togglePopupVisibility(
            //   setPopupController,
            //   initialPopupController[1],
            //   1,
            //   "open"
            // );
          }
        />
      </div>
      {!noActionsAndStatus && (
        <div className={styles.rhsActions}>
          {!noActions && (
            <div
              className={styles.Statuspill}
              style={getStatusStyles(status || "default")}
              // className={
              //   status === "Active" ? styles.activepill : styles.inactivepill
              // }
            >
              {status}
            </div>
          )}
          {!noStatus && (
            <div className={styles.actionBtns}>
              <i
                onClick={handleView}
                className="pi pi-eye"
                style={{ color: "#adadad", fontSize: "1.2rem" }}
              />
              {/* {currentUserDetails.role === CONFIG.RoleDetails.user ? (
                ""
              ) : ( */}
              <>
                <i
                  onClick={handleEdit}
                  style={{
                    color: "#adadad",
                    fontSize: "1.2rem",
                    display:
                      status !== CONFIG.blogStatus.Pending &&
                      (selectedTab === CONFIG.NewsTab[1] ||
                        currentUserDetails.role !== CONFIG.RoleDetails.user)
                        ? "flex"
                        : "none",
                  }}
                  className="pi pi-pen-to-square"
                />
                <i
                  onClick={handleDelete}
                  style={{
                    color: "red",
                    fontSize: "1.2rem",

                    display:
                      status !== CONFIG.blogStatus.Approved &&
                      (selectedTab === CONFIG.NewsTab[1] ||
                        currentUserDetails.role !== CONFIG.RoleDetails.user)
                        ? "flex"
                        : "none",
                  }}
                  className="pi pi-trash"
                />
              </>
              {/* )} */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsCard;
