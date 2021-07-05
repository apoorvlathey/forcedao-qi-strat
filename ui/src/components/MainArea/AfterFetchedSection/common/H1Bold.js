import React from "react";
import { Box } from "@material-ui/core";

function H1Bold({ text, style }) {
  return (
    <Box
      textAlign="left"
      fontWeight="fontWeightBold"
      fontFamily="Monospace"
      fontSize={24}
      marginBottom={2}
      style={style}
    >
      {text}
    </Box>
  );
}

export default H1Bold;
