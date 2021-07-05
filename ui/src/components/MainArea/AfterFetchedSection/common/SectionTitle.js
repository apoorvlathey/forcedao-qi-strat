import React from "react";
import { Box } from "@material-ui/core";

function SectionTitle({ text }) {
  return (
    <Box
      textAlign="center"
      fontWeight="fontWeightBold"
      fontFamily="Monospace"
      fontSize={28}
      marginBottom={2}
      style={{
        textDecoration: "underline",
      }}
    >
      {text}
    </Box>
  );
}

export default SectionTitle;
