/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-debugger */
/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import styles from "./ViewComponent.module.scss";
// import { Icon } from "@fluentui/react";
// import { sp } from "@pnp/sp/presets/all";
import { Persona, PersonaSize, PersonaPresence } from "@fluentui/react";
import { getcuruserdetails } from "../../../services/BlogsPage/BlogsPageServices";
import { VisibilityOutlined } from "@mui/icons-material";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type

function ViewComponent(props: any) {
  const [curuser, setcuruser] = useState<any>({
    Id: null,
    Email: "",
    Title: "",
  });
  // This is The curuserhow many likes and view Concepts is show
  let totaluserlikescount: number = 0;
  let curuserlikes: boolean = false;
  let userviewcounts: number = 0;
  if (props.viewitem.userDetails.length > 0) {
    totaluserlikescount = props.viewitem.userDetails.filter(
      (arr: any) => arr.UserClick === true
    ).length;
    props.viewitem.userDetails.forEach((arr: any) => {
      if (arr.UserId === curuser.Id) {
        curuserlikes = arr.UserClick;
      }
    });
  }
  if (props.viewitem.viewDetails && props.viewitem.viewDetails.length > 0) {
    userviewcounts = props.viewitem.viewDetails.length;
  } else {
    userviewcounts = 0;
  }
  const poersonaStyles = {
    root: {
      display: "revert",
    },
  };
  //  This is Current User Details
  const getcurrentuser = async (): Promise<void> => {
    await getcuruserdetails().then((arr) => {
      setcuruser({
        ...curuser,
        Id: arr.Id,
        Email: arr.Email,
        Title: arr.Title,
      });
    });
  };
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getcurrentuser();
  }, []);
  return (
    <div>
      <div className={styles.backbox}>
        <div
          // className={styles.roundiconbutton}
          onClick={() => {
            props.resetstate();
          }}
        >
          <i
            className="pi pi-arrow-circle-left"
            style={{ fontSize: "1.2rem", color: "#E0803D", cursor: "pointer" }}
          />
          {/* <Icon iconName="SkypeArrow" className={styles.icon} /> */}
        </div>
        {/* <h5
          style={{
            textDecoration: "underline 1.5px green",
          }}
        >
          View Details
        </h5> */}
      </div>
      <div
        style={{
          width: "100%",
          backgroundColor: "white",
          marginTop: "15px",
          borderRadius: "10px",
        }}
      >
        <div className={styles.section}>
          <div className={styles.parenttitle}>
            <h2
              title={props.viewitem.ParentTitle}
              style={{
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              {props.viewitem.ParentTitle}
            </h2>
            <h5
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "rgb(224, 128, 61)",
              }}
              title={props.viewitem.Title}
            >
              {props.viewitem.Title}
            </h5>
          </div>
          <div className={styles?.Imagecontainer}>
            <img src={props.viewitem.img}></img>
          </div>
          <div className={styles?.contentContainer}>
            <div
              style={{
                overflow: "auto",
                // height: "104px",
                lineHeight: "22px",
              }}
            >
              <div
                // style={{ padding: "0 90px 0 10px" }}
                dangerouslySetInnerHTML={{
                  __html: props.viewitem.Paragraph,
                }}
                // title={props.viewitem.Paragraph}
                className={styles.paragraphbox}
              />
            </div>
          </div>
          <div className={styles.footer}>
            <div className={styles.footercontainer}>
              <div className={styles.peoplebox}>
                <div>
                  <Persona
                    showOverflowTooltip
                    styles={poersonaStyles}
                    size={PersonaSize.size24}
                    presence={PersonaPresence.none}
                    showInitialsUntilImageLoads
                    imageUrl={`/_layouts/15/userphoto.aspx?size=S&username=${props.viewitem.Author?.Email}`}
                  />
                </div>
                <div className={styles.namediv}>
                  <h4>{props.viewitem.Author?.Title}</h4>
                  <h5 className={styles.datediv}>
                    {props.viewitem.Created || ""}
                  </h5>
                </div>
              </div>
            </div>
            <div className={styles.likecontainer}>
              <div className={styles.likebox}>
                <i
                  className="pi pi-thumbs-up-fill"
                  style={{
                    color: curuserlikes ? "#0a4b48" : "#b3b0b0",
                  }}
                />
                {/* <Icon
                  iconName="LikeSolid"
                  style={{
                    color: curuserlikes ? "#0a4b48" : "#b3b0b0",
                  }}
                  className={styles.likeicon}
                /> */}
                <label style={{ cursor: "auto" }}>
                  {totaluserlikescount || "0"}
                </label>
              </div>
              <div className={styles.eyecontainer}>
                {/* <Icon iconName="RedEye12" className={styles.eyeicon} /> */}
                <VisibilityOutlined
                  style={{
                    color: "orange",
                    fontSize: "21px",
                  }}
                />
                <label style={{ cursor: "auto" }}>
                  {userviewcounts || "0"}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ViewComponent;
