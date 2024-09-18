import SectionHeaderIntranet from "../../../components/common/SectionHeaderIntranet/SectionHeaderIntranet";
import styles from "./NewHiresIntranet.module.scss";
import "../../../assets/styles/style.css";
import { Carousel } from "primereact/carousel";
import { Avatar } from "primereact/avatar";

interface newHire {
  EmployeeName: string;
  createEmail: string;
  createdName: string;
  Description: string;
  imgUrl: string;
}
const MainComponent = () => {
  const newHires: newHire[] = [
    {
      EmployeeName: "Kumaresan",
      createEmail: "Chandru@gmail.com",
      createdName: "Chandru",
      Description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel in esse voluptatem temporibus? Eaque deserunt ea molestias placeat consequatur! Voluptatum quibusdam aut corporis nobis cumque fuga consequuntur tempore totam expedita.",
      imgUrl:
        "data:image/jpeg;base64,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",
    },
    {
      EmployeeName: "Kumaresan",
      createEmail: "Chandru@gmail.com",
      createdName: "Chandru",
      Description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel in esse voluptatem temporibus? Eaque deserunt ea molestias placeat consequatur! Voluptatum quibusdam aut corporis nobis cumque fuga consequuntur tempore totam expedita.",
      imgUrl:
        "data:image/jpeg;base64,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",
    },
    {
      EmployeeName: "Kumaresan",
      createEmail: "Chandru@gmail.com",
      createdName: "Chandru",
      Description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel in esse voluptatem temporibus? Eaque deserunt ea molestias placeat consequatur! Voluptatum quibusdam aut corporis nobis cumque fuga consequuntur tempore totam expedita.",
      imgUrl:
        "data:image/jpeg;base64,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",
    },
  ];

  const productTemplate = (val: any) => {
    return (
      <div>
        <p
          className={styles.employeeName}
        >{`Welcomes to the IS Team  ${val.EmployeeName}`}</p>
        <div className={styles.imgandName}>
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
          <p>{val.createdName}</p>
        </div>
        <p className={styles.description}>{val.Description}</p>

        <div className={styles.imgSection}>
          <img src={val.imgUrl} alt="" />
        </div>
      </div>
    );
  };
  return (
    <div className={styles.newhireContainer}>
      <SectionHeaderIntranet label="New Hires" />

      <div className={styles.contentSection}>
        <Carousel
          value={newHires}
          numScroll={1}
          numVisible={1}
          showIndicators={true}
          showNavigators={false}
          autoplayInterval={newHires.length > 1 ? 3000 : 8.64e7}
          circular
          itemTemplate={productTemplate}
        />
      </div>
    </div>
  );
};
export default MainComponent;