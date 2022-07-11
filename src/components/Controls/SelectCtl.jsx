import React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";

const SelectCtl = ({ label, value, valueArray, handleChange, width }) => {
  const selectw = width ? width : 40;
  // console.log(valueArray, "[SelectCtl]");
  return (
    <div style={{ marginLeft: 20 }}>
      <FormControl variant="standard" sx={{ m: 1, minWidth: selectw }}>
        <Select
          value={value}
          onChange={handleChange}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
        >
          {valueArray.map((val) => (
            <MenuItem key={`${label}-${val}`} value={val}>
              {val}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{label}</FormHelperText>
      </FormControl>
    </div>
  );
};

export default SelectCtl;
