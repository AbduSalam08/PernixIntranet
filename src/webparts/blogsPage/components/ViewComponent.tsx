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
import {
  addComments,
  getComments,
  getcuruserdetails,
} from "../../../services/BlogsPage/BlogsPageServices";
import { VisibilityOutlined } from "@mui/icons-material";
//import CustomInput from "../../../components/common/CustomInputFields/CustomInput";
import { Avatar } from "primereact/avatar";
import moment from "moment";
import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type

function ViewComponent(props: any) {
  console.log("viewprops: ", props);

  const [curuser, setcuruser] = useState<any>({
    Id: null,
    Email: "",
    Title: "",
  });
  const [Loading, setisLoading] = useState<boolean>(false);
  const [allComment, setAllComment] = useState<any>([]);

  const [comment, setComment] = useState<string>("");
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
    await getcuruserdetails().then(async (arr) => {
      setcuruser({
        ...curuser,
        Id: arr.Id,
        Email: arr.Email,
        Title: arr.Title,
      });

      await getComments(props?.viewitem?.Id)
        .then((res) => {
          let data = res?.map((val: any) => ({
            id: val.ID || null,
            name: val.Author?.Title,
            date: val?.Created,
            comment: val?.Comments,
            email: val?.Author?.EMail,
          }));

          setAllComment([...data]);

          setisLoading(false);

          console.log(res, "viewres");
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };

  // const comments = [
  //   {
  //     id: 1,
  //     name: "Kumaresan M",
  //     date: "08/11/1997",
  //     comment:
  //       "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptates nobis fugiat illo aliquam distinctio consequatur. Dolorem ducimus totam voluptatibus.",
  //     avatar: "P",
  //   },
  //   {
  //     id: 2,
  //     name: "John Doe",
  //     date: "12/07/1985",
  //     comment:
  //       "This is a great example! Thanks for sharing. Looking forward to implementing this design.",
  //     avatar: "J",
  //   },
  //   {
  //     id: 3,
  //     name: "Jane Smith",
  //     date: "02/15/1992",
  //     comment:
  //       "Awesome design! Really clean and modern. The flexibility of this component is fantastic.",
  //     avatar: "J",
  //   },
  // ];

  const handleComment = async (): Promise<void> => {
    if (comment) {
      await addComments(
        comment,
        props.viewitem.Id,
        setAllComment,
        allComment,
        curuser
      ).then((res) => {
        if (res) {
          getComments(props?.viewitem?.Id)
            .then((res) => {
              let data = res?.map((val: any) => ({
                id: val.ID || null,
                name: val.Author?.Title,
                date: val?.Created,
                comment: val?.Comments,
                email: val?.Author?.EMail,
              }));

              setAllComment([...data]);
              setComment("");
              setisLoading(false);

              console.log(res, "viewres");
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    }
  };
  useEffect(() => {
    setisLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getcurrentuser();
  }, []);

  // useEffect(() => {
  //   setisLoading(true);

  // }, [props]);
  return (
    <div>
      {Loading ? (
        <CircularSpinner></CircularSpinner>
      ) : (
        <>
          <div className={styles.backbox}>
            <div
              // className={styles.roundiconbutton}
              onClick={() => {
                props.resetstate();
              }}
            >
              <i
                className="pi pi-arrow-circle-left"
                style={{
                  fontSize: "1.2rem",
                  color: "#E0803D",
                  cursor: "pointer",
                }}
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

              <>
                {allComment?.map((val: any) => (
                  <div key={val.id}>
                    <div
                      className={`${styles.commentCard} ${styles.fadeIn}`}
                      // style={{ animationDelay: `${index * 0.02}s` }} // Delay based on index
                    >
                      <div className={styles.userProfile}>
                        <Avatar
                          image={`/_layouts/15/userphoto.aspx?size=S&username=${val?.email}`}
                          // size="small"
                          shape="circle"
                          style={{
                            width: "30px !important",
                            height: "30px !important",
                          }}
                          data-pr-tooltip={val.receiverName}
                        />
                      </div>
                      <div
                        className={`${styles.commentCardMain} ${
                          ""
                          // ownComment ? styles.authorHighlightWrap : ""
                        }`}
                      >
                        <div
                          className={`${styles.commentHeader} ${
                            ""
                            // ownComment ? styles.authorHighlight : ""
                          }`}
                        >
                          <div className={styles.texts}>
                            <div className={styles.author}>{val?.name} </div>
                            <div className={styles.info}>
                              {moment(val?.date).format("DD MMM YYYY HH.mm")}
                            </div>
                            {/* <div className={styles.info}>Commented on {date}</div> */}
                            {/* {edited && <div className={styles.extraInfo}>Edited</div>} */}
                          </div>
                          <div className={styles.hamb}>
                            {/* {role && <span className={styles.roleBadge}>{role}</span>} */}
                            {/* {ownComment && (
              <div onClick={handleMenuClick}>
                <MoreVert
                  sx={{
                    color: "#555",
                    cursor: "pointer",
                  }}
                />
              </div>
            )} */}
                          </div>
                        </div>
                        <div
                          className={styles.commentSpace}
                          // dangerouslySetInnerHTML={{ __html: content }}
                        >
                          {val?.comment}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  borderTop: "1px solid #ddd",
                  background: "#f9f9f9",
                }}
              >
                <FloatingLabelTextarea
                  value={comment}
                  onChange={(e: any) => {
                    const value = e.trimStart();
                    setComment(value);
                  }}
                  rows={4}
                  placeholder="Add a comment..."
                />
                <DefaultButton
                  btnType="primaryGreen"
                  text={"send"}
                  disabled={!comment}
                  onClick={async () => {
                    await handleComment();
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default ViewComponent;
