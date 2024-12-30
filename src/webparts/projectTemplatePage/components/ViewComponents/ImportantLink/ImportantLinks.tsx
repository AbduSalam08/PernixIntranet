import { useState } from "react";
import styles from "./ImportantLinks.module.scss";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DefaultButton from "../../../../../components/common/Buttons/DefaultButton";

const ImportantLinks = () => {
  const data = [
    {
      category: "Procurement",
      links: [
        { name: "Site 1", url: "#" },
        { name: "Google", url: "https://www.google.com" },
        { name: "Site 2", url: "#" },
      ],
    },
    {
      category: "Contracts",
      links: [{ name: "Contract Site", url: "#" }],
    },
    {
      category: "Logistics",
      links: [{ name: "Logistics Site", url: "#" }],
    },
  ];

  const [isMainAccordionOpen, setIsMainAccordionOpen] = useState(false);
  const [openChildAccordion, setOpenChildAccordion] = useState<{
    [key: string]: boolean;
  }>({});

  // Toggle main accordion
  const toggleMainAccordion = () => {
    setIsMainAccordionOpen(!isMainAccordionOpen);
  };

  // Toggle child accordions
  const toggleChildAccordion = (category: any) => {
    setOpenChildAccordion((prev: any) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className={styles.importantlinks}>
      <div className={styles.mainaccordion}>
        {/* Main Accordion Header */}
        <div className={styles.accordionheader} onClick={toggleMainAccordion}>
          <p className={styles.accordionheading}>Important Links</p>

          <DefaultButton
            text={isMainAccordionOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            btnType="primaryGreen"
            onlyIcon
          />
          {/* <span>{isMainAccordionOpen ? "↑" : "↓"}</span> */}
        </div>

        {/* Main Accordion Content */}
        {isMainAccordionOpen && (
          <div className={styles.accordioncontent}>
            {data.map((item: any, index: any) => (
              <div className={styles.childaccordion} key={index}>
                {/* Child Accordion Header */}
                <div
                  className={`${styles.accordionheader} ${styles.childheader}`}
                  onClick={() => toggleChildAccordion(item.category)}
                >
                  <span>{item.category}</span>
                  <DefaultButton
                    text={
                      openChildAccordion[item.category] ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )
                    }
                    // btnType="primaryGreen"
                    btnType="primaryPernixOrange"
                    onlyIcon
                  />
                  {/* <span>{openChildAccordion[item.category] ? "↑" : "↓"}</span> */}
                </div>

                {/* Child Accordion Content */}
                {openChildAccordion[item.category] && (
                  <div className={styles.childcontent}>
                    {item.links.map((link: any, linkIndex: number) => (
                      <div key={linkIndex} className={styles.linkitem}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.name}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ImportantLinks;
