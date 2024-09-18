/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

import styles from "./BirthdayIntranet.module.scss";
const image1: any = require("../../../assets/images/svg/Birthday/Frame_1010107467.png");
const image2: any = require("../../../assets/images/svg/Birthday/Frame_1010107468.png");
const image3: any = require("../../../assets/images/svg/Birthday/Frame_1010107469.png");
const share: any = require("../../../assets/images/svg/Birthday/send.png");
// import "../../../assets/styles/style.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

import { useState } from "react";
import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
interface IBirthday {
  name: string;
  birthday: string;
  isToday: boolean;
  imageUrl: string;
}
const MainComponent = () => {
  const [visible, setVisible] = useState(false);

  const birthdays: IBirthday[] = [
    {
      name: "Anne Smith",
      birthday: "March 1, 2024",
      isToday: true,
      imageUrl: image1,
    },
    {
      name: "John Doe",
      birthday: "April 19, 2024",
      isToday: false,
      imageUrl: image2,
    },
    {
      name: "Jane Doe",
      birthday: "May 1, 2024",
      isToday: false,
      imageUrl: image3,
    },
  ];
  return (
    <div className={styles.container}>
      <SectionHeaderIntranet label="BirthDays" />

      <div className={styles.contentSection}>
        {birthdays.map((val: any, index: number) => (
          <div key={index} className={styles.contentMain}>
            <div className={styles.image}>
              <img src={`${val.imageUrl}`} alt="" />
            </div>
            <div className={styles.content}>
              <div className={styles.contentwithIconsection}>
                <div className={styles.Title}>
                  <p className={styles.name}>{val.name}</p>
                  <p className={styles.date}>
                    {val.isToday
                      ? "Birthday today"
                      : `Birthday on ${val.birthday}`}
                  </p>
                </div>

                <div className={styles.shareicon}>
                  <img
                    src={`${share}`}
                    alt=""
                    onClick={() => {
                      setVisible(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        showHeader={false}
        visible={visible}
        style={{ width: "50vw" }}
        className={styles.birthDialog}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
        closable={false}
      >
        <p> send Wish</p>
        <div className={styles.content}>
          <p className="m-0">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>

        <div className={styles.buttonSection}>
          <Button label="Primary" outlined className={styles.teams} />
          <Button label="Primary" outlined className={styles.outlook} />
        </div>
      </Dialog>
    </div>
  );
};
export default MainComponent;
