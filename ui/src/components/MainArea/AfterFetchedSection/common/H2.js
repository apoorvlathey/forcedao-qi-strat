import React from "react";
import { Box } from "@material-ui/core";

function H2({ text, textAlign }) {
  return (
    <Box textAlign={textAlign} fontFamily="fontFamily">
      {text}
    </Box>
  );
}

export default H2;
