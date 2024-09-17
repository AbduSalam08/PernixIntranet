/* eslint-disable @typescript-eslint/no-explicit-any */
import { Add } from "@mui/icons-material";
import DefaultButton from "../Buttons/DefaultButton";
import styles from "./SectionHeaderIntranet.module.scss";
interface Props {
  label: string;
  headerAction?: () => any | void;
}
const SectionHeaderIntranet = ({ label, headerAction }: Props): JSX.Element => {
  return (
    <div className={styles.sectionHeaderWrapper}>
      <p>{label}</p>
      <DefaultButton
        onlyIcon={true}
        btnType="primaryGreen"
        size="medium"
        onClick={headerAction}
        text={
          <Add
            sx={{
              width: "20px",
              fontSize: "24px",
              color: "#fff",
            }}
          />
        }
      />
    </div>
  );
};

export default SectionHeaderIntranet;
