import styles from "./InfoCard.module.scss";
import Skeleton from "@mui/material/Skeleton";

interface InfoCardProps {
  item: {
    cardName: string;
    cardImg: string;
    cardValues: string;
  };
  idx: number;
  isLoading?: boolean; // Add isLoading prop
}

const InfoCard = ({
  item,
  idx,
  isLoading = false,
}: InfoCardProps): JSX.Element => {
  return (
    <div key={idx} className={styles.card}>
      {isLoading ? (
        <div className={styles.cardContent}>
          <Skeleton variant="text" width={100} height={24} />
          <Skeleton
            variant="text"
            style={{
              marginTop: "-10px",
            }}
            width={60}
            height={40}
          />
        </div>
      ) : (
        <div className={styles.cardContent}>
          <span className={styles.cardName}>{item.cardName}</span>
          <span className={styles.cardValue}>{item.cardValues}</span>
        </div>
      )}

      <div className={styles.cardImg}>
        {isLoading ? (
          <Skeleton variant="circular" width={40} height={40} />
        ) : (
          <img src={item.cardImg} alt={`${item.cardName} icon`} />
        )}
      </div>
    </div>
  );
};

export default InfoCard;
