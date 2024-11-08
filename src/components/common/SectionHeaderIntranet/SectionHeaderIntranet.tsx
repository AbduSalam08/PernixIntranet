/* eslint-disable @typescript-eslint/no-explicit-any */
import { Add } from "@mui/icons-material";
import DefaultButton from "../Buttons/DefaultButton";
import styles from "./SectionHeaderIntranet.module.scss";
interface Props {
  label: string;
  headerAction?: () => any | void;
  removeAdd?: boolean;
  title?: string;
}
const SectionHeaderIntranet = ({
  label,
  headerAction,
  removeAdd = false,
  title,
}: Props): JSX.Element => {
  return (
    <div className={styles.sectionHeaderWrapper}>
      <p>{label}</p>
      {!removeAdd && (
        <DefaultButton
          title={title}
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
      )}
    </div>
  );
};

export default SectionHeaderIntranet;
