import React from "react";
import { Grid, Box, Link, TextField, Button } from "@material-ui/core";
const { BN, toWei } = require("web3-utils");

function TransactionComponent({
  account,
  shouldApproveFirst,
  tokenName,
  tokenContract,
  setToTransactAmount,
  toTransactAmount,
  userTokenBalance,
  tfLabel,
  helperText,
  stratAddress,
  stratFunctionToCall,
  showPleaseApprove,
  setShowPleaseApprove,
  showPleaseApproveIndex,
  gasLimit,
  refresh,
  btnText,
}) {
  const UINT256MAX =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";

  return (
    <>
      <Grid item>
        <Box
          textAlign="left"
          fontWeight="fontWeightMedium"
          fontFamily="fontFamily"
          color="#807474"
        >
          Your {tokenName} Balance:{" "}
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setToTransactAmount(userTokenBalance);
            }}
          >
            {userTokenBalance}
          </Link>
        </Box>
        <TextField
          label={tfLabel}
          variant="outlined"
          style={{
            marginTop: "1rem",
            minWidth: "450px",
          }}
          InputLabelProps={{
            shrink: true,
          }}
          helperText={helperText}
          autoComplete="off"
          value={toTransactAmount || ""}
          type="number"
          onChange={(e) => setToTransactAmount(e.target.value)}
        />
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          style={{
            minHeight: "55px",
            maxWidth: "200px",
          }}
          onClick={async () => {
            if (shouldApproveFirst) {
              const allowance = await tokenContract.methods
                .allowance(account, stratAddress)
                .call();
              if (new BN(allowance).lte(toWei(toTransactAmount.toString()))) {
                let newArr = [...showPleaseApprove];
                newArr[showPleaseApproveIndex] = true;
                setShowPleaseApprove(newArr);
                await tokenContract.methods
                  .approve(stratAddress, UINT256MAX)
                  .send({
                    from: account,
                    gasPrice: "2000000000",
                  });
                newArr = [...showPleaseApprove];
                newArr[showPleaseApproveIndex] = false;
                setShowPleaseApprove(newArr);
              }
            }
            await stratFunctionToCall(toWei(toTransactAmount.toString())).send({
              from: account,
              gasLimit: gasLimit,
              gasPrice: "2000000000",
            });

            refresh();
          }}
        >
          {btnText}
        </Button>
      </Grid>
      {shouldApproveFirst && (
        <Grid item>
          {showPleaseApprove[showPleaseApproveIndex] && (
            <Box
              textAlign="left"
              fontWeight="fontWeightMedium"
              fontFamily="fontFamily"
              color="darkorange"
            >
              Please confirm token approval...
            </Box>
          )}
        </Grid>
      )}
    </>
  );
}

export default TransactionComponent;
