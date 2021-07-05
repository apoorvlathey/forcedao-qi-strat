import React from "react";
import { LinearProgress } from "@material-ui/core";

function index({ isLoading }) {
  return (
    <LinearProgress
      style={{
        marginLeft: "9.5%",
        maxWidth: "81%",
        ...(isLoading ? { display: "block" } : { display: "none" }),
      }}
    />
  );
}

export default index;
