import React from "react";
import styles from "./NewsCard.module.scss";

interface NewsCardProps {
  imageUrl: string;
  title: string;
  description: string;
  status?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  noActions?: boolean;
  noStatus?: boolean;
  noActionsAndStatus?: boolean;
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
  noActionsAndStatus = false,
}) => {
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
          {!noActions && <div className={styles.pill}>{status}</div>}
          {!noStatus && (
            <div className={styles.actionBtns}>
              <button onClick={onEdit}>Edit</button>
              <button onClick={onDelete}>Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsCard;
