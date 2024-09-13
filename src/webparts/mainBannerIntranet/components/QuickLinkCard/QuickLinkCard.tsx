/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import styles from "./QuickLinkCard.module.scss";

const QuickLinkCard = (value: any): JSX.Element => {
  const [hover, setHover] = useState(false); // State to track hover status
  const isOddCard: boolean = (value?.idx + 1) % 2 === 1;

  return (
    <div
      className={`${styles.quickLinkCard} ${
        isOddCard ? styles.quickLinkCardGreen : styles.quickLinkCardOrange
      }`}
      key={value?.idx}
      onMouseEnter={() => setHover(true)} // Set hover state to true on mouse enter
      onMouseLeave={() => setHover(false)} // Set hover state to false on mouse leave
    >
      <img
        src={hover ? value?.item?.hoverImg : value?.item?.img}
        alt={value?.item?.text}
      />
      <span
        style={{
          color: isOddCard
            ? "var(--primary-pernix-green)"
            : "var(--primary-orange)",
        }}
      >
        {value?.item?.text}
      </span>
    </div>
  );
};

export default QuickLinkCard;
