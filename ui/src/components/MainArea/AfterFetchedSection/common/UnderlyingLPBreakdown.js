import React from "react";
import { Grid } from "@material-ui/core";
import H2Bold from "../common/H2Bold";
import H2 from "../common/H2";

import numberWithCommas from "../../../../utils/numberWithCommas";

function UnderlyingLPBreakdown({
  token0Name,
  token0Share,
  token0UsdVal,
  token1Name,
  token1Share,
  token1UsdVal,
}) {
  return (
    <>
      <Grid
        container
        direction="row"
        style={{
          minWidth: "450px",
        }}
      >
        <Grid item>
          <H2Bold
            textAlign={"left"}
            text={`Underlying ${token0Name} Amount:`}
          />
        </Grid>
        <Grid
          item
          style={{
            marginLeft: "auto",
          }}
        >
          <H2 textAlign={"right"} text={token0Share} />
          <H2Bold
            textAlign={"right"}
            text={`($${numberWithCommas(token0UsdVal)})`}
          />
        </Grid>
      </Grid>
      <Grid
        container
        direction="row"
        style={{
          minWidth: "450px",
        }}
      >
        <Grid item>
          <H2Bold
            textAlign={"left"}
            text={`Underlying ${token1Name} Amount:`}
          />
        </Grid>
        <Grid
          item
          style={{
            marginLeft: "auto",
          }}
        >
          <H2 textAlign={"right"} text={token1Share} />
          <H2Bold
            textAlign={"right"}
            text={`($${numberWithCommas(token1UsdVal)})`}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default UnderlyingLPBreakdown;
