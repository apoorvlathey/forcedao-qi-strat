import React from "react";
import { Grid, Button } from "@material-ui/core";
import TokenPriceBox from "./TokenPriceBox";

function PriceRefreshCol({ inputDisabled, refresh, qiUsdVal, maiUsdVal }) {
  return (
    <Grid container justify="space-between">
      <TokenPriceBox name={"QI"} price={qiUsdVal} />
      <Button
        variant="contained"
        color="primary"
        style={{
          minHeight: "55px",
          maxWidth: "200px",
        }}
        disabled={inputDisabled}
        onClick={() => {
          refresh();
        }}
      >
        🔄 REFRESH STATS 🔄
      </Button>
      <TokenPriceBox name={"MAI"} price={maiUsdVal} />
    </Grid>
  );
}

export default PriceRefreshCol;
