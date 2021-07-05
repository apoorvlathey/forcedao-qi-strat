import React from "react";
import { Grid, Box } from "@material-ui/core";
import H1Bold from "../common/H1Bold";
import SectionTitle from "../common/SectionTitle";
import UnderlyingLPBreakdown from "../common/UnderlyingLPBreakdown";

import numberWithCommas from "../../../../utils/numberWithCommas";

function YourStats({
  userSharesAmount,
  userToken0UsdVal,
  userToken1UsdVal,
  token0Name,
  userToken0Share,
  token1Name,
  userToken1Share,
}) {
  return (
    <Grid item>
      <Grid item>
        <SectionTitle text={"Your Stats:"} />

        <H1Bold
          text={`Your Strategy Shares: ${numberWithCommas(
            parseFloat(userSharesAmount)
          )}`}
        />
        <Box
          textAlign="center"
          fontWeight="fontWeightBold"
          fontFamily="Monospace"
          fontSize={24}
          marginBottom={2}
        >
          Your Value Deposited in Strategy: $
          {numberWithCommas(
            parseFloat(userToken0UsdVal + userToken1UsdVal).toFixed(2)
          )}
        </Box>
      </Grid>

      <UnderlyingLPBreakdown
        token0Name={token0Name}
        token0Share={userToken0Share}
        token0UsdVal={userToken0UsdVal}
        token1Name={token1Name}
        token1Share={userToken1Share}
        token1UsdVal={userToken1UsdVal}
      />
    </Grid>
  );
}

export default YourStats;
