import React from "react";
import { Grid, Paper, Box } from "@material-ui/core";
import PriceRefreshCol from "./PriceRefreshCol";
import AfterFetchedSection from "./AfterFetchedSection";

function MainArea({
  account,
  refresh,
  inputDisabled,
  isDataFetched,
  qiUsdVal,
  maiUsdVal,
  pricePerShare,
  apy,
  totalLpAmount,
  token0Name,
  totalToken0Share,
  totalToken0UsdVal,
  token1Name,
  totalToken1Share,
  totalToken1UsdVal,
  pendingRewards,
  pendingRewardsUsd,
  userToken0UsdVal,
  userToken1UsdVal,
  userToken0Share,
  userToken1Share,
  stratContract,
  stratAddress,
  showPleaseApprove,
  setShowPleaseApprove,
  underlyingContract,
  setToDepositAmount,
  toDepositAmount,
  userLpBalance,
  maiContract,
  setMaiToDeposit,
  maiToDeposit,
  userMaiBalance,
  qiContract,
  setQiToDeposit,
  qiToDeposit,
  userQiBalance,
  setToWithdrawAmount,
  toWithdrawAmount,
  userSharesAmount,
}) {
  return (
    <Paper
      elevation={2}
      style={{
        margin: "auto",
        padding: "2rem 10rem",
        minWidth: "60%",
      }}
    >
      <PriceRefreshCol
        inputDisabled={inputDisabled}
        refresh={refresh}
        qiUsdVal={qiUsdVal}
        maiUsdVal={maiUsdVal}
      />
      <Grid
        container
        direction="column"
        spacing={3}
        alignItems="center"
        style={{
          marginTop: "3rem",
        }}
      >
        {inputDisabled && (
          <Grid item>
            <Box
              fontWeight="fontWeightBold"
              fontFamily="fontFamily"
              color="#ff6961"
            >
              Connect Wallet to Continue ⬈
            </Box>
          </Grid>
        )}
        {isDataFetched && (
          <AfterFetchedSection
            account={account}
            pricePerShare={pricePerShare}
            apy={apy}
            stratAddress={stratAddress}
            totalLpAmount={totalLpAmount}
            token0Name={token0Name}
            totalToken0Share={totalToken0Share}
            totalToken0UsdVal={totalToken0UsdVal}
            token1Name={token1Name}
            totalToken1Share={totalToken1Share}
            totalToken1UsdVal={totalToken1UsdVal}
            pendingRewards={pendingRewards}
            pendingRewardsUsd={pendingRewardsUsd}
            userToken0UsdVal={userToken0UsdVal}
            userToken1UsdVal={userToken1UsdVal}
            userToken0Share={userToken0Share}
            userToken1Share={userToken1Share}
            stratContract={stratContract}
            showPleaseApprove={showPleaseApprove}
            setShowPleaseApprove={setShowPleaseApprove}
            refresh={refresh}
            underlyingContract={underlyingContract}
            setToDepositAmount={setToDepositAmount}
            toDepositAmount={toDepositAmount}
            userLpBalance={userLpBalance}
            maiContract={maiContract}
            setMaiToDeposit={setMaiToDeposit}
            maiToDeposit={maiToDeposit}
            userMaiBalance={userMaiBalance}
            qiContract={qiContract}
            setQiToDeposit={setQiToDeposit}
            qiToDeposit={qiToDeposit}
            userQiBalance={userQiBalance}
            setToWithdrawAmount={setToWithdrawAmount}
            toWithdrawAmount={toWithdrawAmount}
            userSharesAmount={userSharesAmount}
          />
        )}
      </Grid>
    </Paper>
  );
}

export default MainArea;
