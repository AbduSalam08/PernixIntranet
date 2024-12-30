/* eslint-disable   @typescript-eslint/no-var-requires */

import DefaultButton from "../../../../../components/common/Buttons/DefaultButton";
import styles from "./Documents.module.scss";
const folderIcon = require("../../../../../assets/images/svg/folderIcon.svg");
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState } from "react";
import { Add } from "@mui/icons-material";

const Documents = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = (): void => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <div className={styles.accordion}>
        <div className={styles.accordionheader} onClick={toggleAccordion}>
          <p className={styles.accordionheading}>Documents</p>
          <DefaultButton
            text={isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            btnType="primaryGreen"
            onlyIcon
          />
          {/* <span className="accordion-icon">{isOpen ? "-" : "+"}</span> */}
        </div>
        {isOpen && (
          <>
            <div className={styles.addicon}>
              <DefaultButton text={<Add />} btnType="primaryGreen" onlyIcon />
            </div>
            <div className={styles.docCarousel}>
              <div
                className={styles.folderCard}
                key={1}
                // onClick={() => {
                //   localStorage.removeItem(CONFIG.selMasterFolder);
                //   localStorage.setItem(
                //     CONFIG.selMasterFolder,
                //     JSON.stringify({
                //       Name: item?.Content?.name,
                //       Path: item?.Content?.ServerRelativeUrl,
                //     })
                //   );
                //   window.open(
                //     props.context.pageContext.web.absoluteUrl +
                //       CONFIG.NavigatePage.DocRepositoryPage,
                //     "_self"
                //   );
                // }}
              >
                <img src={folderIcon} alt="folder image" />
                <span>{"test"}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default Documents;
