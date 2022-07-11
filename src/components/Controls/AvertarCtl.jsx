import React from "react";

import Avatar from "@mui/material/Avatar";
import SpaceBarIcon from "@mui/icons-material/SpaceBar";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import Tooltip from "@mui/material/Tooltip";

import SpiralIcon from "../../assets/images/spiral.png";

import classes from "./Controls.module.css";
export const TYPE_SPIRAL = "TYPE_SPIRAL";
export const TYPE_MARK = "TYPE_MARK";
export const TYPE_SCALE = "TYPE_SCALE";
export const TYPE_RESET = "TYPE_RESET";

const AvertarCtl = ({ type, label, callback, checked, size }) => {
  const style = { width: 24, height: 24, color: "#1974D2" };

  const getIcon = () => {
    return type === TYPE_SPIRAL ? (
      <img src={SpiralIcon} style={style} />
    ) : type === TYPE_MARK ? (
      <MoreTimeIcon style={style} />
    ) : type === TYPE_SCALE ? (
      <SpaceBarIcon style={style} />
    ) : type === TYPE_RESET ? (
      <AutorenewIcon style={style} />
    ) : null;
  };
  const width = size ? size : 38;
  const height = width;
  return (
    <Tooltip title={label} placement="top" arrow>
      <Avatar
        sx={{ bgcolor: checked ? "#16E2F5" : "", width, height, margin: 1 }}
        onClick={callback}
      >
        {getIcon()}
      </Avatar>
    </Tooltip>
  );
};

export default AvertarCtl;
