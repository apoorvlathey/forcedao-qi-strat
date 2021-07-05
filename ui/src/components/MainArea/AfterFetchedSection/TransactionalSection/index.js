import React from "react";
import TransactionComponent from "./TransactionComponent";

function TransactionalSection({
  account,
  stratAddress,
  stratContract,
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
      <TransactionComponent
        account={account}
        shouldApproveFirst={true}
        tokenName={"QI/MAI"}
        tokenContract={underlyingContract}
        setToTransactAmount={setToDepositAmount}
        toTransactAmount={toDepositAmount}
        userTokenBalance={userLpBalance}
        tfLabel={"LP Amount to Deposit"}
        helperText={"Underlying Farm deducts 0.5% as Deposit Fee"}
        stratAddress={stratAddress}
        showPleaseApprove={showPleaseApprove}
        setShowPleaseApprove={setShowPleaseApprove}
        showPleaseApproveIndex={0}
        gasLimit={"250000"}
        refresh={refresh}
        btnText={"Deposit LP"}
        stratFunctionToCall={stratContract.methods.deposit}
      />

      <TransactionComponent
        account={account}
        shouldApproveFirst={true}
        tokenName={"MAI"}
        tokenContract={maiContract}
        setToTransactAmount={setMaiToDeposit}
        toTransactAmount={maiToDeposit}
        userTokenBalance={userMaiBalance}
        tfLabel={"MAI Amount to Deposit"}
        helperText={"Underlying Farm deducts 0.5% as Deposit Fee"}
        stratAddress={stratAddress}
        showPleaseApprove={showPleaseApprove}
        setShowPleaseApprove={setShowPleaseApprove}
        showPleaseApproveIndex={1}
        gasLimit={"550000"}
        refresh={refresh}
        btnText={"Deposit MAI"}
        stratFunctionToCall={stratContract.methods.depositWithMAI}
      />

      <TransactionComponent
        account={account}
        shouldApproveFirst={true}
        tokenName={"QI"}
        tokenContract={qiContract}
        setToTransactAmount={setQiToDeposit}
        toTransactAmount={qiToDeposit}
        userTokenBalance={userQiBalance}
        tfLabel={"QI Amount to Deposit"}
        helperText={"Underlying Farm deducts 0.5% as Deposit Fee"}
        stratAddress={stratAddress}
        showPleaseApprove={showPleaseApprove}
        setShowPleaseApprove={setShowPleaseApprove}
        showPleaseApproveIndex={2}
        gasLimit={"550000"}
        refresh={refresh}
        btnText={"Deposit QI"}
        stratFunctionToCall={stratContract.methods.depositWithQI}
      />

      <TransactionComponent
        account={account}
        shouldApproveFirst={false}
        tokenName={"Strategy Shares"}
        setToTransactAmount={setToWithdrawAmount}
        toTransactAmount={toWithdrawAmount}
        userTokenBalance={userSharesAmount}
        tfLabel={"LP tokens to Withdraw"}
        gasLimit={"350000"}
        refresh={refresh}
        btnText={"Withdraw LP"}
        stratFunctionToCall={stratContract.methods.withdraw}
      />
    </>
  );
}

export default TransactionalSection;
