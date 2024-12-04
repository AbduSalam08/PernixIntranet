/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-debugger */
/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEffect, useState } from "react";
import "../../../assets/styles/Style.css";
import "./Style.css";
import SendIcon from "@mui/icons-material/Send";

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
// import FloatingLabelTextarea from "../../../components/common/CustomInputFields/CustomTextArea";
import DefaultButton from "../../../components/common/Buttons/DefaultButton";
import CircularSpinner from "../../../components/common/Loaders/CircularSpinner";
import QuillEditor from "../../../components/common/QuillEditor/QuillEditor";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsersList } from "../../../services/HelpDeskMainServices/ticketServices";
import { ToastContainer } from "react-toastify";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type

//interface

interface TaggedPerson {
  id: number | null;
  email: string;
  name: string;
}

interface Comment {
  id: number | null;
  name: string | any;
  date: string | any;
  comment: string;
  email: string | any;
  Taggedperson: TaggedPerson[];
}

function ViewComponent(props: any) {
  const dispatch = useDispatch();
  const AllUsersData: any = useSelector(
    (state: any) => state.AllUsersData?.value
  );

  const [taggedPerson, setTaggedPerson] = useState({
    results: [],
  });

  const [curuser, setcuruser] = useState<any>({
    Id: null,
    Email: "",
    Title: "",
  });
  const [Loading, setisLoading] = useState<boolean>(false);
  const [allComment, setAllComment] = useState<Comment[]>([]);

  const [comment, setComment] = useState<string>("");
  console.log("comment: ", comment);
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
  const getcurrentuser = async (): Promise<any> => {
    await getcuruserdetails().then(async (arr) => {
      setcuruser({
        ...curuser,
        Id: arr.Id,
        Email: arr.Email,
        Title: arr.Title,
      });

      // get comments from which blog user click
      await getComments(props?.viewitem?.Id)
        .then((res) => {
          let data: Comment[] = res?.map((val: any) => ({
            id: val.ID || null,
            name: val.Author?.Title,
            date: val?.Created,
            comment: val?.Comments ? val?.Comments : "",
            email: val?.Author?.EMail,
            Taggedperson: val?.TaggedPerson
              ? val?.TaggedPerson?.map((val: any) => ({
                  id: val?.ID || null,
                  email: val?.EMail || "",
                  name: val?.Title || "",
                }))
              : [],
          }));

          setAllComment([...data]);

          setisLoading(false);
        })
        .catch((err) => {
          setisLoading(false);
          console.log(err);
        });
    });
  };

  const handleComment = async (): Promise<void> => {
    if (comment) {
      await addComments(
        comment,
        props.viewitem.Id,
        taggedPerson,
        setAllComment,
        allComment,
        curuser
      ).then((res: any) => {
        if (res) {
          getComments(props?.viewitem?.Id)
            .then((res: any) => {
              let data: Comment[] = res?.map((val: any) => ({
                id: val.ID || null,
                name: val.Author?.Title,
                date: val?.Created,
                comment: val?.Comments,
                email: val?.Author?.EMail,
                Taggedperson: val?.TaggedPerson
                  ? val?.TaggedPerson?.map((val: any) => ({
                      id: val?.ID || null,
                      email: val?.EMail || "",
                      name: val?.Title || "",
                    }))
                  : [],
              }));
              setAllComment([...data]);
              setComment("");
              setisLoading(false);
            })
            .catch((err) => {
              setisLoading(false);

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

    getAllUsersList(dispatch);
    // .then((val: any) => {
    //   console.log(val, "allusers");

    //   val && setAlluser([val]);
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
  }, [props]);

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
                {allComment?.length > 0 ? (
                  allComment?.map((val: Comment) => (
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
                            data-pr-tooltip={val?.name}
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
                                {moment(val?.date).format("DD MMM YYYY HH:mm")}
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
                  }}166
                />
              </div>
            )} */}
                            </div>
                          </div>
                          <div
                            className={styles.commentSpace}
                            // dangerouslySetInnerHTML={{ __html: content }}
                            dangerouslySetInnerHTML={{ __html: val?.comment }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "150px",
                      color: "#000",
                      fontSize: "15px",
                      fontWeight: 500,
                    }}
                  >
                    {" "}
                    No Comments Found !!!
                  </div>
                )}
              </>

              <div
                style={{
                  position: "relative",
                }}
                className="blogQuill"
              >
                {/* <FloatingLabelTextarea
                  value={comment}
                  onChange={(e: any) => {
                    const value = e.trimStart();
                    setComment(value);
                  }}
                  rows={4}
                  placeholder="Add a comment..."
                /> */}
                <QuillEditor
                  style={{ width: "80% !important", position: "relative" }}
                  suggestionList={AllUsersData ?? []}
                  onChange={(e: any) => {
                    // let x = e.replace(/<(.|\n)*?>/g, "").trim().length === 0;
                    // let x = e.replace(/<(.|\n)*?>/g, "");
                    // console.log("x: ", x);
                    const value: string = e?.trimStart();
                    if (value == "<p><br></p>") {
                      setComment("");
                    } else if (
                      value.replace(/<(.|\n)*?>/g, "").trim().length == 0
                    ) {
                      setComment("");
                    } else {
                      setComment(value);
                    }
                  }}
                  defaultValue={comment}
                  getMentionedEmails={(e: any) => {
                    setTaggedPerson((prev: any) => ({
                      ...prev,
                      results: e?.map((item: any) => item?.id),
                    }));
                  }}
                  placeHolder={"Enter Comments..."}
                ></QuillEditor>

                <DefaultButton
                  btnType="primaryGreen"
                  title="Edit Layout"
                  text={<SendIcon />}
                  style={{ position: "absolute", bottom: 0, right: 0 }}
                  disabled={!comment}
                  onClick={async () => {
                    await handleComment();
                  }}
                  onlyIcon
                  // onClick={resetPopup}
                />

                {/* <DefaultButton
                  btnType="primaryGreen"
                  style={{ position: "absolute", bottom: 0, right: 0 }}
                  text={"send"}
                  disabled={!comment}
                  onClick={async () => {
                    await handleComment();
                  }}
                /> */}
              </div>
            </div>
          </div>
        </>
      )}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
export default ViewComponent;
