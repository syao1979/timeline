import React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

function CheckCtl({ label, checked, callback }) {
  return (
    <FormGroup style={{ marginLeft: 10 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onClick={callback}
            sx={{ "& .MuiSvgIcon-root": { fontSize: 14 } }}
          />
        }
        label={label}
      />
    </FormGroup>
  );
}

export default CheckCtl;
