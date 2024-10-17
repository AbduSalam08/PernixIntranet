import React from "react";
import styles from "./NewsCard.module.scss";

interface NewsCardProps {
  Id?: number;
  imageUrl: string;
  title: string;
  description: string;
  status?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  noActions?: boolean;
  noStatus?: boolean;
  item?: any;
  setisDelete?: (isDelete: boolean) => void;
  handleDeleteClick: (id: any) => void;
  setIsEdit?: (isEdit: boolean) => void; // Add setIsEdit prop

  noActionsAndStatus?: boolean;
  handleEditClick?: (item: any) => void; // Modify this to accept an item
}

const NewsCard: React.FC<NewsCardProps> = ({
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
  item,
  noActionsAndStatus = false,
}) => {
  const handleEdit = () => {
    console.log("how many times call this function");
    if (handleEditClick) {
      setisDelete && setisDelete(false);

      setIsEdit && setIsEdit(true);
      handleEditClick(item); // Pass the item back to the parent
    }
  };

  const handleDelete = () => {
    setIsEdit && setIsEdit(false);

    setisDelete && setisDelete(true);
    handleDeleteClick(item.ID);
  };
  return (
    <div className={styles.newsCard}>
      <img
        src={imageUrl}
        alt="News Thumbnail"
        className={styles.newsThumbNail}
      />
      <div className={styles.rhsTexts}>
        <h2>{title}</h2>
        <span>{description}</span>
      </div>
      {!noActionsAndStatus && (
        <div className={styles.rhsActions}>
          {!noActions && (
            <div
              className={
                status == "Active" ? styles.activepill : styles.inactivepill
              }
            >
              {status}
            </div>
          )}
          {!noStatus && (
            <div className={styles.actionBtns}>
              <i
                className="pi pi-eye
"
                style={{ color: "#1AB800", fontSize: "1.2rem" }}
              ></i>

              <i
                onClick={handleEdit}
                style={{ color: "#007EF2", fontSize: "1.2rem" }}
                className="pi pi-pen-to-square

"
              ></i>
              <i
                onClick={handleDelete}
                style={{ color: "red", fontSize: "1.2rem" }}
                className="pi pi-trash


"
              ></i>
              {/* <button onClick={onEdit}>Edit</button>
              <button onClick={onDelete}>Delete</button> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsCard;
