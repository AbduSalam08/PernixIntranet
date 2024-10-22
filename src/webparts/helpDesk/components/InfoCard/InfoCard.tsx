import styles from "./InfoCard.module.scss";

interface InfoCardProps {
  item: {
    cardName: string;
    cardImg: string;
    cardValues: string;
  };
  idx: number;
}

const InfoCard = ({ item, idx }: InfoCardProps): JSX.Element => {
  return (
    <div key={idx} className={styles.card}>
      <div className={styles.cardContent}>
        <span className={styles.cardName}>{item?.cardName}</span>
        <span className={styles.cardValue}>{item?.cardValues}</span>
      </div>
      <div className={styles.cardImg}>
        <img src={item.cardImg} alt={`${item.cardName} icon`} />
      </div>
    </div>
  );
};

export default InfoCard;
