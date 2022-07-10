import React from "react";
import { styled } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import InputBase from "@mui/material/InputBase";

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    border: "1px solid #ced4da",
    fontSize: 12,
    padding: "2px",
    width: 80,
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:focus": {
      borderRadius: 4,
      borderColor: "#80bdff",
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
    },
  },
}));

const SelectCtl = ({ label, value, valueArray, handleChange, width }) => {
  const selectw = width ? width : 40;
  // console.log(valueArray, "[SelectCtl]");
  return (
    <div style={{ marginLeft: 20 }}>
      <FormControl
        variant="standard"
        size="small"
        sx={{ m: 1, minWidth: selectw, maxHeight: 20 }}
      >
        {/* <InputLabel id="demo-simple-select-standard-label">{label}</InputLabel> */}

        <Select
          labelId={`${label}-select`}
          id={`${label}-select`}
          value={value}
          onChange={handleChange}
          //   label={label}
          style={{ padding: "0px 10px" }}
          input={<BootstrapInput />}
        >
          {valueArray.map((val) => (
            <MenuItem key={`${label}-${val}`} value={val}>
              {val}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default SelectCtl;
