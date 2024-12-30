import { Add } from "@mui/icons-material";
import DefaultButton from "../../../../../components/common/Buttons/DefaultButton";
import styles from "./Details.module.scss";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import PersonIcon from "@mui/icons-material/Person";
import PlaceIcon from "@mui/icons-material/Place";
// import GroupsIcon from "@mui/icons-material/Groups";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Avatar } from "primereact/avatar";
import InfoIcon from "@mui/icons-material/Info";

const Details = ({ value }: any) => {
  console.log("value: ", value);
  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <p>{value.contractNo + value.projectName}</p>

        <DefaultButton text={<Add />} btnType="primaryGreen" onlyIcon />
      </div>

      <div className={styles.content}>
        <div className={styles.leftContent}>
          <PersonIcon
            sx={{
              width: "20px",
              //   fontSize: "24px",
            }}
          />
          <p>{value.clientName}</p>
        </div>
        <div className={styles.rigthContent}>
          <MilitaryTechIcon
            sx={{
              width: "20px",
            }}
          />
          <p>{value.status}</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.leftContent}>
          <CalendarMonthIcon
            sx={{
              width: "20px",
              //   fontSize: "24px",
            }}
          />
          <p>{`${value.startDate} - ${value.endDate}`}</p>
        </div>
        <div className={styles.rigthContent}>
          <Avatar
            image={`/_layouts/15/userphoto.aspx?size=S&username=${
              value.projectAdmin.email || ""
            }`}
            shape="circle"
            size="normal"
            style={{
              margin: "0 !important",
              border: "3px solid #fff",
              width: "25px",
              height: "25px",
              // marginLeft: data?.length > 1 ? "-10px" : "0",
              // position: "absolute",
              // left: `${positionLeft ? positionLeft * index : 0}px`,
              // top: `${positionTop ? positionTop : 0}px`,
              // zIndex: index,
            }}
          />

          <p>{value.projectAdmin.name}</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.leftContent}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {value.team?.map((member: any, index: number) => (
              <Avatar
                key={index}
                image={`/_layouts/15/userphoto.aspx?size=S&username=${
                  member.email || member.Email
                }`}
                shape="circle"
                size="normal"
                style={{
                  margin: "0",
                  border: "3px solid #fff",
                  width: "25px",
                  height: "25px",
                  marginLeft: index > 0 ? "-10px" : "0", // Overlap avatars slightly
                  zIndex: value.team?.length - index, // Ensure higher index appears on top
                }}
                label={member.name}
              />
            ))}
          </div>
          {/* <p>{value.clientName}</p> */}
        </div>
        <div className={styles.rigthContent}>
          <PlaceIcon
            sx={{
              width: "20px",
            }}
          />
          <p>{value.location}</p>
        </div>
      </div>

      <div className={styles.description}>
        <InfoIcon sx={{ width: "25px" }} />
        <p>{value.description}</p>
      </div>

      <div className={styles.map}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3124.6899180579053!2d-90.50354882498863!3d30.068551017429154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8620d3d8ddbb2477%3A0xf28f7015b84ecec5!2s456%20Elm%20St%2C%20Laplace%2C%20LA%2070068%2C%20USA!5e1!3m2!1sen!2sin!4v1735215903603!5m2!1sen!2sin"
          width="100%"
          height="150"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};
export default Details;
