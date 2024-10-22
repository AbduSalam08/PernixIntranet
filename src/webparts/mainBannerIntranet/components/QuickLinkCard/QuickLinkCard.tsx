/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import styles from "./QuickLinkCard.module.scss";
interface Props {
  value: any;
  idx: number;
  onClick?: () => any;
}

const QuickLinkCard = ({ value, onClick, idx }: Props): JSX.Element => {
  const [hover, setHover] = useState(false); // State to track hover status
  const isOddCard: boolean = (idx + 1) % 2 === 1;

  return (
    <div
      className={`${styles.quickLinkCard} ${
        isOddCard ? styles.quickLinkCardGreen : styles.quickLinkCardOrange
      }`}
      key={idx}
      onClick={() => {
        onClick?.();
      }}
      onMouseEnter={() => setHover(true)} // Set hover state to true on mouse enter
      onMouseLeave={() => setHover(false)} // Set hover state to false on mouse leave
    >
      <img src={hover ? value?.hoverImg : value?.img} alt={value?.text} />
      <span
        style={{
          color: isOddCard
            ? "var(--primary-pernix-green)"
            : "var(--primary-orange)",
        }}
      >
        {value?.text}
      </span>
    </div>
  );
};

export default QuickLinkCard;
