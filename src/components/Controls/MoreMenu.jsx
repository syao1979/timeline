import React from "react";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Menu, MenuItem } from "@mui/material";
import Avatar from "@mui/material/Avatar";

import classes from "./Controls.module.css";
const MoreMenu = ({ children }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={classes.MoreMenu}>
      <IconButton
        id="menu-button"
        aria-controls={open ? "menu-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MoreVertIcon color="primary" />
      </IconButton>
      <Menu
        id="menu"
        aria-labelledby="menu-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        className={classes.Menu}
      >
        {children?.map((d, idx) => {
          return (
            <MenuItem key={`menu-${idx}`} style={{ minWidth: 150 }}>
              {d}
            </MenuItem>
          );
        })}
        {/* <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem> */}
      </Menu>
    </div>
  );
};

export default MoreMenu;
