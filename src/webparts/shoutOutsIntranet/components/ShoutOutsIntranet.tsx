/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */

import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import { Carousel } from "primereact/carousel";
import styles from "./ShoutOutsIntranet.module.scss";
import { Avatar } from "primereact/avatar";
import "../../../assets/styles/style.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";

const img: any = require("../../../assets/images/svg/Shoutouts/bronze.png");

const ShoutOutsIntranet = (props: any): JSX.Element => {
  const responsiveOptions = [
    {
      breakpoint: "1400px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "1199px",
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: "767px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "575px",
      numVisible: 1,
      numScroll: 1,
    },
  ];
  interface IShoutOut {
    senderName: string;
    receiverName: string;
    message: string;
    senderImage: string;
    receiverImage: string;
  }
  const products: IShoutOut[] = [
    {
      senderName: "Yaroslav Pentsarsky",
      receiverName: "Sabina Satgareeva",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      senderImage: "maasi@mydomain28.onmicrosoft.com",
      receiverImage: "maasi@mydomain28.onmicrosoft.com",
    },
    {
      senderName: "Yaroslav Pentsarsky",
      receiverName: "Sabina Satgareeva",
      message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      senderImage: "Venkat@mydomain28.onmicrosoft.com",

      receiverImage: "Venkat@mydomain28.onmicrosoft.com",
    },
    {
      senderName: "Yaroslav Pentsarsky",
      receiverName: "Sabina Satgareeva",
      message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      senderImage: "Venkat@mydomain28.onmicrosoft.com",

      receiverImage: "Venkat@mydomain28.onmicrosoft.com",
    },
    {
      senderName: "Yaroslav Pentsarsky",
      receiverName: "Sabina Satgareeva",
      message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      senderImage: "Venkat@mydomain28.onmicrosoft.com",

      receiverImage: "Venkat@mydomain28.onmicrosoft.com",
    },
  ];

  const productTemplate = (val: any): any => {
    return (
      // <div></div>
      <div className={styles.Container}>
        <p className={styles.shoutOutHeader}>
          <span className={styles.sender}>{val?.senderName}</span>{" "}
          <span className={styles.recogonized}>recognized </span>
          <span className={styles.receiver}>{val?.receiverName}</span>
        </p>

        <div className={styles.iconSection}>
          <Avatar
            image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.senderImage}`}
            // size="small"
            shape="circle"
            style={{
              width: "40px !important",
              height: "40px !important",
            }}
            data-pr-tooltip={val.receiverName}
          />
          <img src={`${img}`} alt="" className={styles.img} />
          <i className="pi pi-caret-right" style={{ fontSize: "20px" }}></i>
          <Avatar
            image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.senderImage}`}
            // size="large"
            shape="circle"
            // style={{
            //   width: "20px !important",
            //   height: "20px !important",
            // }}
            data-pr-tooltip={val.receiverName}
          />
        </div>

        <p className={styles.message}>{val.message}</p>
      </div>
    );
  };
  return (
    <div className={`Shoutout ${styles.ShoutoutContainer}`}>
      <SectionHeaderIntranet label={"Shout-outs"} />

      <div className={styles.carousel}>
        <Carousel
          value={products}
          numScroll={1}
          numVisible={1}
          showIndicators={true}
          showNavigators={false}
          autoplayInterval={products.length > 1 ? 3000 : 8.64e7}
          circular
          responsiveOptions={responsiveOptions}
          itemTemplate={productTemplate}
        />
      </div>
    </div>
  );
};
export default ShoutOutsIntranet;
