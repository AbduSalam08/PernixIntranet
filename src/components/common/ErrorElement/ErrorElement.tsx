/* eslint-disable @typescript-eslint/no-var-requires */
import styles from "./ErrorElement.module.scss";
const errorImg = require("../../../assets/images/svg/errorImg.svg");

const ErrorElement = ({
  message,
  description,
}: {
  message?: string;
  description?: string;
}): JSX.Element => {
  return (
    <div className={styles.errorElementWrapper}>
      <div className={styles.content}>
        <img src={errorImg} alt="error img exclamation" />
        <p>{message ?? "Something went wrong!"}</p>
        <span>
          {description ?? "The page you have looking for is not found."}
        </span>
      </div>
    </div>
  );
};

export default ErrorElement;
