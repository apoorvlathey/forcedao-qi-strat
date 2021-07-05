import React from "react";
import { Box, Link } from "@material-ui/core";
import OverallStats from "./OverallStats";
import H1Bold from "./common/H1Bold";
import HR from "./common/HR";

import numberWithCommas from "../../../utils/numberWithCommas";
import YourStats from "./YourStats";
import TransactionalSection from "./TransactionalSection";

function AfterFetchedSection({
  account,
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
  refresh,
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
    <>
      <H1Bold
        text={`Price per Share: ${numberWithCommas(parseFloat(pricePerShare))}`}
      />
      <H1Bold
        style={{ textDecoration: "underline" }}
        text={`APY: ${numberWithCommas(parseFloat(apy))}%`}
      />

      <Box textAlign="center" fontFamily="Monospace" fontSize={20}>
        ⚠{" "}
        <Link
          target="_blank"
          rel="​noopener"
          href={"https://polygonscan.com/address/" + stratAddress}
        >
          Strategy
        </Link>{" "}
        has not been audited, use at your own risk
      </Box>

      <HR />

      <OverallStats
        account={account}
        refresh={refresh}
        totalLpAmount={totalLpAmount}
        token0Name={token0Name}
        totalToken0Share={totalToken0Share}
        totalToken0UsdVal={totalToken0UsdVal}
        token1Name={token1Name}
        totalToken1Share={totalToken1Share}
        totalToken1UsdVal={totalToken1UsdVal}
        pendingRewards={pendingRewards}
        pendingRewardsUsd={pendingRewardsUsd}
        stratContract={stratContract}
      />

      <HR />

      <YourStats
        userSharesAmount={userSharesAmount}
        userToken0UsdVal={userToken0UsdVal}
        userToken1UsdVal={userToken1UsdVal}
        token0Name={token0Name}
        userToken0Share={userToken0Share}
        token1Name={token1Name}
        userToken1Share={userToken1Share}
      />

      <TransactionalSection
        account={account}
        stratAddress={stratAddress}
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
    </>
  );
}

export default AfterFetchedSection;
