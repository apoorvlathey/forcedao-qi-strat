import React from "react";
import { Box } from "@material-ui/core";

function H2Bold({ text, textAlign }) {
  return (
    <Box
      textAlign={textAlign}
      fontWeight="fontWeightBold"
      fontFamily="fontFamily"
    >
      {text}
    </Box>
  );
}

export default H2Bold;
