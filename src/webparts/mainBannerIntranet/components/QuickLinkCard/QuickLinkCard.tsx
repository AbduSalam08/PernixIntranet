/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import styles from "./QuickLinkCard.module.scss";

const QuickLinkCard = (value: any): JSX.Element => {
  console.log("value: ", value);
  console.log(value?.idx / 2 === 0);
  return (
    <div className={styles.quickLinkCard} key={value?.idx}>
      <img src={value?.item?.img} alt={value?.item?.text} />
      <span
        style={{
          color:
            (value?.idx + 1) % 2 === 1
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
