/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import styles from "./NewsCard.module.scss";
import { CONFIG } from "../../../../config/config";

interface NewsCardProps {
  Id?: number;
  idx?: number;
  imageUrl: string;
  title: string;
  description: string;
  status?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  noActions?: boolean;
  noStatus?: boolean;
  currentUserDetails: any;
  item?: any;
  setisDelete?: (isDelete: boolean) => void;
  // setIsview?: (isview: boolean) => void;
  handleDeleteClick: (id: any) => void;
  setIsEdit?: (isEdit: boolean) => void; // Add setIsEdit prop
  noActionsAndStatus?: boolean;
  handleEditClick?: (item: any) => void; // Modify this to accept an item
  handleViewClick?: (item: any) => void; // Modify this to accept an item
  selectedTab?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
  idx,
  imageUrl,
  title,
  description,
  status,
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
  currentUserDetails,
  item,
  noActionsAndStatus = false,
  selectedTab,
}) => {
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
      handleViewClick(item);
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
        <h2 title={title}>{title}</h2>
        <span title={description}>{description}</span>
      </div>
      {!noActionsAndStatus && (
        <div className={styles.rhsActions}>
          {!noActions && (
            <div
              className={
                status === "Active" ? styles.activepill : styles.inactivepill
              }
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
              {currentUserDetails.role === CONFIG.RoleDetails.user ? (
                ""
              ) : (
                <>
                  <i
                    onClick={handleEdit}
                    style={{
                      color: "#adadad",
                      fontSize: "1.2rem",
                      display:
                        selectedTab === CONFIG.TabsName[2] ? "none" : "flex",
                    }}
                    className="pi pi-pen-to-square"
                  />
                  <i
                    onClick={handleDelete}
                    style={{ color: "red", fontSize: "1.2rem" }}
                    className="pi pi-trash"
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsCard;
