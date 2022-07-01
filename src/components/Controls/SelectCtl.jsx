import React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";

const SelectCtl = ({ label, value, valueArray, handleChange, width }) => {
  const selectw = width ? width : 40;
  // console.log(valueArray, "[SelectCtl]");
  return (
    <div style={{ marginLeft: 20 }}>
      <FormControl variant="standard" sx={{ m: 1, minWidth: selectw }}>
        <InputLabel id="demo-simple-select-standard-label">{label}</InputLabel>
        <Select
          labelId={`${label}-select`}
          id={`${label}-select`}
          value={value}
          onChange={handleChange}
          //   label={label}
          style={{ padding: "0px 10px" }}
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
