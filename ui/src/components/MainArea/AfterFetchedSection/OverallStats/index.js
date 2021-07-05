import React from "react";
import { Grid, Box, Button } from "@material-ui/core";
import SectionTitle from "../common/SectionTitle";
import H1Bold from "../common/H1Bold";
import UnderlyingLPBreakdown from "../common/UnderlyingLPBreakdown";

import numberWithCommas from "../../../../utils/numberWithCommas";

function OverallStats({
  account,
  refresh,
  totalLpAmount,
  totalToken0UsdVal,
  totalToken1UsdVal,
  token0Name,
  totalToken0Share,
  token1Name,
  totalToken1Share,
  pendingRewards,
  pendingRewardsUsd,
  stratContract,
}) {
  return (
    <>
      <Grid item>
        <Grid item>
          <SectionTitle text={"Overall Strategy Stats"} />

          <H1Bold
            text={`Total LP Deposited: ${numberWithCommas(
              parseFloat(totalLpAmount)
            )}`}
          />
          <H1Bold
            text={`Total Value Deposited: $
            ${numberWithCommas(
              parseFloat(totalToken0UsdVal + totalToken1UsdVal).toFixed(2)
            )}`}
          />
        </Grid>

        <UnderlyingLPBreakdown
          token0Name={token0Name}
          token0Share={totalToken0Share}
          token0UsdVal={totalToken0UsdVal}
          token1Name={token1Name}
          token1Share={totalToken1Share}
          token1UsdVal={totalToken1UsdVal}
        />
      </Grid>
      <Grid item>
        <Grid item>
          <H1Bold
            text={`Net Pending Rewards: ${numberWithCommas(
              parseFloat(pendingRewards)
            )} ${token0Name}`}
          />
          <H1Bold
            text={`Net Pending Rewards: $
            ${numberWithCommas(parseFloat(pendingRewardsUsd).toFixed(2))}`}
          />

          <Box
            textAlign="center"
            fontWeight="fontWeightBold"
            fontFamily="Monospace"
            fontSize={24}
            marginBottom={2}
          >
            <Button
              variant="contained"
              color="primary"
              style={{
                minHeight: "55px",
                maxWidth: "200px",
              }}
              onClick={async () => {
                await stratContract.methods.harvest().send({
                  from: account,
                  gasLimit: "500000",
                  gasPrice: "2000000000",
                });

                refresh();
              }}
            >
              👨‍🌾 Harvest 🔁
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default OverallStats;
