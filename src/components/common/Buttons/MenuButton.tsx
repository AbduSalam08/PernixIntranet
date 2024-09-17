/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useState } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import styles from "./Buttons.module.scss";

interface MenuButtonProps {
  buttonText: string;
  externalController?: any;
  menuVisibility?: any;
  disabled?: boolean;
  menuItems: { icon?: JSX.Element; text: string; onClick: () => void }[];
}

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === "light"
        ? "rgb(55, 65, 81)"
        : theme.palette.grey[300],
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 14,
        color: theme.palette.text.secondary,
        textDecoration: "none",
        fontFamily: "Inter",
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: "#C9B7FF40 !important",
      },
    },
  },
}));

const MenuButton: React.FC<MenuButtonProps> = ({
  buttonText,
  menuItems,
  menuVisibility,
  externalController,
  disabled,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement | any>(null);
  const open = Boolean(menuVisibility === null ? menuVisibility : anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
    externalController((prev: any) => ({
      ...prev,
      menuBtnExternalController: event.currentTarget,
    }));
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        disabled={disabled}
        className={`primaryBtn ${disabled ? styles.disabledBtn : ""}`}
        aria-controls={open ? "customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {buttonText}
      </Button>
      {!disabled && (
        <StyledMenu
          id="customized-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          {menuItems?.map((item, index) => (
            <MenuItem
              key={index}
              onClick={item.onClick}
              sx={{
                color: "#000",
                fontFamily: "interRegular, sans-serif !important",
              }}
              disableRipple
            >
              {item.icon}
              {item.text}
            </MenuItem>
          ))}
        </StyledMenu>
      )}
    </>
  );
};

export default memo(MenuButton);
