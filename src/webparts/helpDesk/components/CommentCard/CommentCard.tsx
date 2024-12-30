/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// import { MoreVert } from "@mui/icons-material";
import styles from "./CommentCard.module.scss"; // Import the SCSS module
import Popup from "../../../../components/common/Popups/Popup";
import { togglePopupVisibility } from "../../../../utils/popupUtils";
import { Lock } from "@mui/icons-material";
import CustomDropDown from "../../../../components/common/CustomInputFields/CustomDropDown";

const CommentCard = ({
  data,
  ownComment,
  index,
  lastItem,
  isAuthor,
  author,
  role,
  date,
  content,
  avatarSrc,
  edited,
  handleDelete,
  isPrivateComment,
  commentTypeValue,
  commentTypeOnChange,
  enableUtilDropDown,
}: any): JSX.Element => {
  const initialPopupController = [
    {
      open: false,
      popupTitle: "Confirmation",
      popupWidth: "450px",
      popupType: "confirmation",
      defaultCloseBtn: false,
      confirmationTitle: "Are you sure want to delete the comment?",
      popupData: "",
      isLoading: {
        inprogress: false,
        error: false,
        success: false,
      },
      messages: {
        success: "News Deleted successfully!",
        error: "Something went wrong!",
        successDescription: "The new news 'ABC' has been Deleted successfully.",
        errorDescription:
          "An error occured while Deleting news, please try again later.",
        inprogress: "Deleting new news, please wait...",
      },
    },
  ];

  const [popupController, setPopupController] = useState(
    initialPopupController
  );

  // Handlers for the menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // const handleMenuClick = (event: React.MouseEvent<HTMLElement>): any => {
  //   setAnchorEl(event.currentTarget);
  // };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const popupActions: any = [
    [
      {
        text: "Cancel",
        btnType: "darkGreyVariant",
        disabled: false,
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: () => {
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "close"
          );
        },
      },
      {
        text: "Delete",
        btnType: "primaryGreen",
        endIcon: false,
        startIcon: false,
        size: "large",
        onClick: async () => {
          // await handleSubmit();
          togglePopupVisibility(
            setPopupController,
            initialPopupController[0],
            0,
            "close"
          );
          handleDelete?.(data);
        },
      },
    ],
  ];

  return (
    <div
      className={`${styles.commentCard} ${styles.fadeIn}`}
      style={{ animationDelay: `${index * 0.02}s` }} // Delay based on index
    >
      <div className={styles.userProfile}>
        <Avatar alt={author} src={avatarSrc} sx={{ width: 30, height: 30 }} />
      </div>
      <div
        className={`${styles.commentCardMain} ${
          ownComment ? styles.authorHighlightWrap : ""
        }`}
      >
        <div
          className={`${styles.commentHeader} ${
            ownComment ? styles.authorHighlight : ""
          }`}
        >
          <div className={styles.texts}>
            <div className={styles.author}>{author}</div>
            <div className={styles.rhsInfo}>
              {edited && <div className={styles.extraInfo}>Edited</div>}
              {enableUtilDropDown && (
                <div className={styles.extraInfo}>
                  {isPrivateComment && (
                    <Lock
                      sx={{
                        fontSize: "14px",
                        transform: "translateX(5px)",
                      }}
                    />
                  )}
                  {/* Private */}
                  <CustomDropDown
                    noErrorMsg
                    floatingLabel={false}
                    size="SM"
                    options={["Public", "Private"]}
                    value={commentTypeValue}
                    placeholder="Select"
                    onChange={(e: any) => {
                      const value: any = e;
                      commentTypeOnChange(value);
                    }}
                    width={"80px"}
                    height={"20px"}
                    dropDownBackgroundColor={
                      ownComment ? "#c4692420" : "#1f363b15"
                    }
                    noPadding={true}
                    highlightDropdown={false}
                    customFontsize="13px"
                  />
                  <div
                    className={
                      ownComment ? styles.dividerDotAuthor : styles.dividerDot
                    }
                  />
                </div>
              )}
              {!enableUtilDropDown && isPrivateComment && (
                <div className={styles.extraInfo}>
                  <Lock
                    sx={{
                      fontSize: "14px",
                      transform: "translateX(5px)",
                    }}
                  />
                  Private
                  <div
                    className={
                      ownComment ? styles.dividerDotAuthor : styles.dividerDot
                    }
                  />
                </div>
              )}
              <div className={styles.info}>{date}</div>
              {/* <div className={styles.info}>Commented on {date}</div> */}
            </div>
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
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              PaperProps={{
                style: {
                  fontFamily: '"osMedium", sans-serif',
                  minWidth: "100px",
                  boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              {/* <MenuItem
                sx={{
                  fontSize: "14px",
                }}
                onClick={handleMenuClose}
              >
                Edit
              </MenuItem> */}
              <MenuItem
                sx={{
                  fontSize: "14px",
                }}
                onClick={() => {
                  handleMenuClose();
                  togglePopupVisibility(
                    setPopupController,
                    initialPopupController[0],
                    index,
                    "open"
                  );
                }}
              >
                Delete
              </MenuItem>
            </Menu>
          </div>
        </div>
        <div
          className={`${styles.commentSpace} commentSpace`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <input
          type="text"
          style={{
            opacity: 0,
            height: "1px",
          }}
          autoFocus={lastItem}
          readOnly
        />
      </div>
      {popupController?.map((popupData: any, index: number) => (
        <Popup
          popupCustomBgColor="#fff"
          key={index}
          isLoading={popupData?.isLoading}
          messages={popupData?.messages}
          // resetPopup={() => {
          // setPopupController((prev: any): any => {
          //    resetPopupController(prev, index, true);
          // });
          // }}
          PopupType={popupData.popupType}
          onHide={() => {
            togglePopupVisibility(
              setPopupController,
              initialPopupController[0],
              index,
              "close"
            );
            // resetFormData(formData, setFormData);
          }}
          popupTitle={
            popupData.popupType !== "confimation" && popupData.popupTitle
          }
          popupActions={popupActions[index]}
          visibility={popupData.open}
          // content={popupInputs[index]}
          popupWidth={popupData.popupWidth}
          defaultCloseBtn={popupData.defaultCloseBtn || false}
          confirmationTitle={popupData?.confirmationTitle}
          popupHeight={index === 0 ? true : false}
          noActionBtn={false}
        />
      ))}
    </div>
  );
};

export default CommentCard;
