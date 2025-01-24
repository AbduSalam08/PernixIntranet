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
  item?: any;

  noActionsAndStatus?: boolean;
  handleViewClick?: (item: any) => void; // Modify this to accept an item
}

const NewsCard: React.FC<NewsCardProps> = ({
  imageUrl,
  title,
  description,
  status,
  onEdit,
  onDelete,
  noActions,
  item,
  noStatus,
  handleViewClick,

  noActionsAndStatus = false,
}) => {
  const handleView = (): any => {
    if (handleViewClick) {
      handleViewClick(item);
    }
  };
  return (
    <div className={styles.newsCard}>
      <img
        src={imageUrl}
        alt="News Thumbnail"
        className={styles.newsThumbNail}
      />
      <div className={styles.rhsTexts}>
        <h2 onClick={handleView}>{title}</h2>
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{
            __html: description || "",
          }}
        ></div>
        {/* <button
          className={styles.cardBTNSec}
          onClick={handleView}
        
        >
          Read more
        </button> */}

        {/* <span title={description}>{description}</span> */}
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
