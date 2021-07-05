import { useState, useEffect } from "react";
import {
  Grid,
  LinearProgress,
  Paper,
  Box,
  TextField,
  Button,
  Link,
  Typography,
  Divider,
} from "@material-ui/core";
import { Twitter, GitHub, LinkedIn, Language } from "@material-ui/icons";
import axios from "axios";
// Components
import ConnectWallet from "./components/ConnectWallet";
// ABIs
const uniPairABI = require("./abis/UniswapPair.json");
const tokenABI = require("./abis/ERC20.json");
const stratABI = require("./abis/ForceDAO_QIStrat.json");
// BN
const { BN, toWei } = require("web3-utils");

const truncateWithDots = (
  str,
  firstCharCount = 6,
  endCharCount = 4,
  dotCount = 4
) => {
  var convertedStr = "";
  convertedStr += str.substring(0, firstCharCount);
  convertedStr += ".".repeat(dotCount);
  convertedStr += str.substring(str.length - endCharCount, str.length);
  return convertedStr;
};

const SupportedPool = ({ name, price }) => (
  <Grid item xs={3}>
    <Paper
      elevation={0}
      style={{
        padding: "2rem 3rem",
        border: "2px solid black",
      }}
    >
      <Grid
        container
        direction="row"
        alignItems="center"
        style={{
          minHeight: "100%",
        }}
      >
        <Typography
          variant="body2"
          display="inline"
          gutterBottom
          style={{
            fontWeight: "bold",
            paddingLeft: "1rem",
          }}
        >
          {name} @ ${price}
        </Typography>
      </Grid>
    </Paper>
  </Grid>
);

function App() {
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState("");
  const [inputDisabled, setInputDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);

  const [totalLpAmount, setTotalLpAmount] = useState("");
  const [totalLpAmountInBNWei, setTotalLpAmountInBNWei] = useState("");
  const [userSharesAmount, setUserSharesAmount] = useState("");
  const [userSharesAmountInBNWei, setUserSharesAmountInBNWei] = useState("");
  const [prices, setPrices] = useState([0, 0]);
  const [totalToken0Share, setTotalToken0Share] = useState("");
  const [totalToken1Share, setTotalToken1Share] = useState("");
  const [totalToken0UsdVal, setTotalToken0UsdVal] = useState();
  const [totalToken1UsdVal, setTotalToken1UsdVal] = useState();
  const [userToken0Share, setUserToken0Share] = useState("");
  const [userToken1Share, setUserToken1Share] = useState("");
  const [userToken0UsdVal, setUserToken0UsdVal] = useState(0);
  const [userToken1UsdVal, setUserToken1UsdVal] = useState(0);
  const [userLpBalance, setUserLpBalance] = useState(0);
  const [userMaiBalance, setUserMaiBalance] = useState(0);
  const [maiToDeposit, setMaiToDeposit] = useState(0);

  const [toDepositAmount, setToDepositAmount] = useState();
  const [toWithdrawAmount, setToWithdrawAmount] = useState();

  const [qiUsdVal, setQiUsdVal] = useState(0);
  const [maiUsdVal, setMaiUsdVal] = useState(0);

  const [stratContract, setStratContract] = useState();
  const [qiContract, setQiContract] = useState();
  const [maiContract, setMaiContract] = useState();
  const [underlyingContract, setUnderlyingContract] = useState();
  const [pricePerShare, setPricePerShare] = useState();
  const [pricePerShareInBNWei, setPricePerShareInBNWei] = useState();
  const [apy, setApy] = useState(0);
  const [pendingRewards, setPendingRewards] = useState("");
  const [pendingRewardsUsd, setPendingRewardsUsd] = useState("");

  const qiAddress = "0x580A84C73811E1839F75d86d75d88cCa0c241fF4";
  const maiAddress = "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1";
  const token0Name = "QI";
  const token1Name = "MAI";

  const underlyingAddress = "0x7AfcF11F3e2f01e71B7Cc6b8B5e707E42e6Ea397";

  const stratAddress = "0xfBb07FdC7a566Faa7254c3eD8CAe8Ab00285526B";
  const deployedAtTimestamp = 1625378950;

  const fetchPrices = async () => {
    setLoading(true);
    try {
      var tokenAddressesForPrice = {
        string: "",
        array: [],
      };
      tokenAddressesForPrice.string = qiAddress;
      tokenAddressesForPrice.array.push(qiAddress.toLowerCase());

      tokenAddressesForPrice.string += "," + maiAddress;
      tokenAddressesForPrice.array.push(maiAddress.toLowerCase());
      const res = await getPrice(tokenAddressesForPrice);

      setPrices(res);

      setQiUsdVal(parseFloat(res[0].toFixed(2)));
      setMaiUsdVal(parseFloat(res[1].toFixed(2)));

      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getPrice = async ({ string, array }) => {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/token_price/polygon-pos",
      {
        params: {
          contract_addresses: string,
          vs_currencies: "usd",
        },
      }
    );

    return [response.data[array[0]].usd, response.data[array[1]].usd];
  };

  const calculate = async () => {
    setLoading(true);
    try {
      const lpTotalSupply = await underlyingContract.methods
        .totalSupply()
        .call();

      const userLPUnderlying = userSharesAmountInBNWei
        .mul(pricePerShareInBNWei)
        .div(toWei(new BN("1"), "ether"));

      const reserve0 = await qiContract.methods
        .balanceOf(underlyingAddress)
        .call();
      const _totalToken0Share = new BN(reserve0)
        .mul(totalLpAmountInBNWei)
        .div(new BN(lpTotalSupply));
      const _userToken0Share = new BN(reserve0)
        .mul(userLPUnderlying)
        .div(new BN(lpTotalSupply));
      setTotalToken0Share(await toDecimal(qiContract, _totalToken0Share));
      setUserToken0Share(await toDecimal(qiContract, _userToken0Share));

      const reserve1 = await maiContract.methods
        .balanceOf(underlyingAddress)
        .call();
      const _totalToken1Share = new BN(reserve1)
        .mul(totalLpAmountInBNWei)
        .div(new BN(lpTotalSupply));
      const _userToken1Share = new BN(reserve1)
        .mul(userLPUnderlying)
        .div(new BN(lpTotalSupply));
      setTotalToken1Share(await toDecimal(maiContract, _totalToken1Share));
      setUserToken1Share(await toDecimal(maiContract, _userToken1Share));

      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const toDecimal = async (tokenInstance, amount, isETH) => {
    var decimals = isETH
      ? 18
      : parseInt(await tokenInstance.methods.decimals().call());

    let amountInString = amount.toString();
    if (amountInString.length <= decimals) {
      const pad = Array(decimals + 1 - amountInString.length + 1).join("0");
      amountInString = pad + amountInString;
    }

    return (
      amountInString.slice(0, -decimals) + "." + amountInString.slice(-decimals)
    );
  };

  const numberWithCommas = (x) => {
    if (x) {
      return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    } else {
      return "0";
    }
  };

  const fetchLpAmountAndRewards = async () => {
    const res_total_balance = await stratContract.methods.balance().call();
    const res_user_shares_balance = await stratContract.methods
      .balanceOf(account)
      .call();
    const res_user_lp_balance = await underlyingContract.methods
      .balanceOf(account)
      .call();
    const res_user_mai_balance = await maiContract.methods
      .balanceOf(account)
      .call();
    const res_pricePerShare = await stratContract.methods
      .pricePerShare()
      .call();

    setTotalLpAmountInBNWei(new BN(res_total_balance));
    setTotalLpAmount(
      await toDecimal(
        null,
        res_total_balance,
        true // isETH==true bcoz lp tokens also have fixed 18 decimals
      )
    );
    setUserSharesAmountInBNWei(new BN(res_user_shares_balance));
    setUserSharesAmount(
      await toDecimal(
        null,
        res_user_shares_balance,
        true // isETH==true bcoz share tokens also have fixed 18 decimals
      )
    );
    setPricePerShareInBNWei(new BN(res_pricePerShare));
    setPricePerShare(
      await toDecimal(
        null,
        res_pricePerShare,
        true // isETH==true bcoz represented in 18 decimals
      )
    );
    setUserLpBalance(
      await toDecimal(
        null,
        res_user_lp_balance,
        true // isETH==true bcoz lp tokens also have fixed 18 decimals
      )
    );
    setUserMaiBalance(
      await toDecimal(
        null,
        res_user_mai_balance,
        true // isETH==true bcoz MAI tokens also have fixed 18 decimals
      )
    );

    // APY calculations
    const initialPricePerShare = new BN(toWei("1"));
    const currTimestamp = Math.floor(Date.now() / 1000);
    const timeElapsedSinceDeployed = currTimestamp - deployedAtTimestamp;
    const weiGainPerShare = new BN(res_pricePerShare).sub(initialPricePerShare);
    const weiGainPerSharePerSecond = weiGainPerShare.div(
      new BN(timeElapsedSinceDeployed.toString())
    );
    // extrapolate
    const weiGainPerSharePerYear = weiGainPerSharePerSecond.mul(
      new BN("" + 60 * 60 * 24 * 365)
    );
    const gainPercentagePerYear = weiGainPerSharePerYear
      .mul(new BN("100"))
      .div(initialPricePerShare);

    setApy(gainPercentagePerYear);

    const rewards = await stratContract.methods.pendingRewards().call();
    const rewardsWithDecimals = await toDecimal(
      null,
      rewards,
      true // isETH==true bcoz QI has 18 decimals
    );
    setPendingRewards(rewardsWithDecimals);
    setPendingRewardsUsd(
      parseFloat((prices[1] * rewardsWithDecimals).toFixed(2))
    );
  };

  const refresh = () => {
    fetchPrices();
    fetchLpAmountAndRewards();
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  useEffect(() => {
    if (web3) {
      setInputDisabled(false);
      setStratContract(new web3.eth.Contract(stratABI, stratAddress));
      setQiContract(new web3.eth.Contract(tokenABI, qiAddress));
      setMaiContract(new web3.eth.Contract(tokenABI, maiAddress));
      setUnderlyingContract(
        new web3.eth.Contract(uniPairABI, underlyingAddress)
      );
    }
  }, [web3]);

  useEffect(() => {
    if (stratContract && account) {
      fetchLpAmountAndRewards();
    }
  }, [stratContract, account]);

  useEffect(() => {
    if (
      totalLpAmountInBNWei &&
      userSharesAmountInBNWei &&
      pricePerShareInBNWei
    ) {
      console.log({
        userSharesAmountInBNWei: userSharesAmountInBNWei.toString(),
      });
      console.log({ userSharesAmount: userSharesAmount });
      calculate();
    }
  }, [totalLpAmountInBNWei, userSharesAmountInBNWei, pricePerShareInBNWei]);

  useEffect(() => {
    if (
      prices[0] > 0 &&
      prices[1] > 0 &&
      totalToken0Share &&
      totalToken1Share &&
      userToken0Share &&
      userToken1Share
    ) {
      setTotalToken0UsdVal(
        parseFloat((prices[0] * totalToken0Share).toFixed(2))
      );
      setTotalToken1UsdVal(
        parseFloat((prices[1] * totalToken1Share).toFixed(2))
      );

      setUserToken0UsdVal(parseFloat((prices[0] * userToken0Share).toFixed(2)));
      setUserToken1UsdVal(parseFloat((prices[1] * userToken1Share).toFixed(2)));
    }
  }, [
    prices,
    totalToken0Share,
    totalToken1Share,
    userToken0Share,
    userToken1Share,
  ]);

  useEffect(() => {
    if (
      apy &&
      totalLpAmount &&
      totalToken0UsdVal &&
      totalToken1UsdVal &&
      totalToken0Share &&
      totalToken0UsdVal &&
      totalToken1Share &&
      totalToken1UsdVal
    ) {
      setIsDataFetched(true);
    }
  }, [
    apy,
    totalLpAmount,
    totalToken0UsdVal,
    totalToken1UsdVal,
    totalToken0Share,
    totalToken0UsdVal,
    totalToken1Share,
    totalToken1UsdVal,
  ]);

  return (
    <Grid container direction="column">
      <Grid
        container
        style={{
          marginBottom: "40px",
          marginTop: "40px",
          paddingBottom: "30px",
          borderBottom: "2px solid black",
        }}
      >
        <Grid item xs={3} />
        <Grid
          item
          xs={6}
          container
          justify="center"
          style={{
            paddingRight: "2rem",
          }}
        >
          <Box
            fontWeight="fontWeightBold"
            fontSize="2.5rem"
            fontFamily="fontFamily"
            fontStyle=""
            color="#673ab7"
          >
            🚜 QI/MAI Strategy Dashboard 👨‍🌾
          </Box>
        </Grid>
        <Grid
          item
          xs={3}
          container
          justify="flex-end"
          style={{
            paddingRight: "2rem",
          }}
        >
          {!web3 ? (
            <ConnectWallet setWeb3={setWeb3} setAccount={setAccount} />
          ) : (
            <Grid container direction="column" alignItems="flex-end">
              <Grid item>
                <Box
                  fontWeight="fontWeightBold"
                  fontSize="1.2rem"
                  fontFamily="fontFamily"
                  fontStyle=""
                  style={{
                    color: "green",
                    marginRight: "0.5rem",
                  }}
                >
                  • Connected
                </Box>
              </Grid>
              <Grid item>
                <Box
                  fontWeight="fontWeightBold"
                  fontFamily="fontFamily"
                  style={{
                    color: "#04ad04",
                  }}
                >
                  {`(${truncateWithDots(account)})`}
                </Box>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
      <LinearProgress
        style={{
          marginLeft: "9.5%",
          maxWidth: "81%",
          ...(loading ? { display: "block" } : { display: "none" }),
        }}
      />
      <Paper
        elevation={2}
        style={{
          margin: "auto",
          padding: "2rem 10rem",
          minWidth: "60%",
        }}
      >
        <Grid container justify="space-between">
          <SupportedPool name={"MAI"} price={maiUsdVal} />
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
          <SupportedPool name={"QI"} price={qiUsdVal} />
        </Grid>
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
            <>
              <Box
                textAlign="center"
                fontWeight="fontWeightBold"
                fontFamily="Monospace"
                fontSize={24}
                marginBottom={2}
              >
                Price per Share: {numberWithCommas(parseFloat(pricePerShare))}
              </Box>
              <Box
                textAlign="center"
                fontWeight="fontWeightBold"
                fontFamily="Monospace"
                fontSize={24}
                marginBottom={2}
                style={{
                  textDecoration: "underline",
                }}
              >
                APY: {numberWithCommas(parseFloat(apy))}%
              </Box>

              <Box textAlign="center" fontFamily="Monospace" fontSize={20}>
                ⚠ Strategy has not been audited, use at your own risk
              </Box>

              <Divider style={{ width: "100%" }} />

              <Grid item>
                <Grid item>
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
                    Overall Strategy Stats
                  </Box>
                  <Box
                    textAlign="center"
                    fontWeight="fontWeightBold"
                    fontFamily="Monospace"
                    fontSize={24}
                    marginBottom={2}
                  >
                    Total LP Deposited:{" "}
                    {numberWithCommas(parseFloat(totalLpAmount))}
                  </Box>
                  <Box
                    textAlign="center"
                    fontWeight="fontWeightBold"
                    fontFamily="Monospace"
                    fontSize={24}
                    marginBottom={2}
                  >
                    Total Value Deposited: $
                    {numberWithCommas(
                      parseFloat(totalToken0UsdVal + totalToken1UsdVal).toFixed(
                        2
                      )
                    )}
                  </Box>
                </Grid>
                <Grid
                  container
                  direction="row"
                  style={{
                    minWidth: "450px",
                  }}
                >
                  <Grid item>
                    <Box
                      textAlign="left"
                      fontWeight="fontWeightBold"
                      fontFamily="fontFamily"
                    >
                      Underlying {token0Name} Amount:
                    </Box>
                  </Grid>
                  <Grid
                    item
                    style={{
                      marginLeft: "auto",
                    }}
                  >
                    <Box textAlign="right" fontFamily="fontFamily">
                      {totalToken0Share}
                    </Box>
                    <Box
                      textAlign="right"
                      fontWeight="fontWeightBold"
                      fontFamily="fontFamily"
                    >
                      (${numberWithCommas(totalToken0UsdVal)})
                    </Box>
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
                    <Box
                      textAlign="left"
                      fontWeight="fontWeightBold"
                      fontFamily="fontFamily"
                    >
                      Underlying {token1Name} Amount:
                    </Box>
                  </Grid>
                  <Grid
                    item
                    style={{
                      marginLeft: "auto",
                    }}
                  >
                    <Box textAlign="right" fontFamily="fontFamily">
                      {totalToken1Share}
                    </Box>
                    <Box
                      textAlign="right"
                      fontWeight="fontWeightBold"
                      fontFamily="fontFamily"
                    >
                      (${numberWithCommas(totalToken1UsdVal)})
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid item>
                  <Box
                    textAlign="center"
                    fontWeight="fontWeightBold"
                    fontFamily="Monospace"
                    fontSize={24}
                    marginBottom={2}
                  >
                    Net Pending Rewards:{" "}
                    {numberWithCommas(parseFloat(pendingRewards))} QI
                  </Box>
                  <Box
                    textAlign="center"
                    fontWeight="fontWeightBold"
                    fontFamily="Monospace"
                    fontSize={24}
                    marginBottom={2}
                  >
                    Net Pending Rewards: $
                    {numberWithCommas(parseFloat(pendingRewardsUsd).toFixed(2))}
                  </Box>

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
                      disabled={inputDisabled}
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

              <Divider style={{ width: "100%" }} />

              <Grid item>
                <Grid item>
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
                    Your Stats:
                  </Box>
                  <Box
                    textAlign="center"
                    fontWeight="fontWeightBold"
                    fontFamily="Monospace"
                    fontSize={24}
                    marginBottom={2}
                  >
                    Your Strategy Shares:{" "}
                    {numberWithCommas(parseFloat(userSharesAmount))}
                  </Box>
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
                <Grid
                  container
                  direction="row"
                  style={{
                    minWidth: "450px",
                  }}
                >
                  <Grid item>
                    <Box
                      textAlign="left"
                      fontWeight="fontWeightBold"
                      fontFamily="fontFamily"
                    >
                      Underlying {token0Name} Amount:
                    </Box>
                  </Grid>
                  <Grid
                    item
                    style={{
                      marginLeft: "auto",
                    }}
                  >
                    <Box textAlign="right" fontFamily="fontFamily">
                      {userToken0Share}
                    </Box>
                    <Box
                      textAlign="right"
                      fontWeight="fontWeightBold"
                      fontFamily="fontFamily"
                    >
                      (${numberWithCommas(userToken0UsdVal)})
                    </Box>
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
                    <Box
                      textAlign="left"
                      fontWeight="fontWeightBold"
                      fontFamily="fontFamily"
                    >
                      Underlying {token1Name} Amount:
                    </Box>
                  </Grid>
                  <Grid
                    item
                    style={{
                      marginLeft: "auto",
                    }}
                  >
                    <Box textAlign="right" fontFamily="fontFamily">
                      {userToken1Share}
                    </Box>
                    <Box
                      textAlign="right"
                      fontWeight="fontWeightBold"
                      fontFamily="fontFamily"
                    >
                      (${numberWithCommas(userToken1UsdVal)})
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item>
                <Box
                  textAlign="left"
                  fontWeight="fontWeightMedium"
                  fontFamily="fontFamily"
                  color="#807474"
                >
                  Your QI/MAI Balance:{" "}
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setToDepositAmount(userLpBalance);
                    }}
                  >
                    {userLpBalance}
                  </Link>
                </Box>
                <TextField
                  id="to-deposit-amount"
                  label="LP Amount to Deposit"
                  variant="outlined"
                  style={{
                    marginTop: "1rem",
                    minWidth: "450px",
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Underlying Farm deducts 0.5% as Deposit Fee"
                  autoComplete="off"
                  value={toDepositAmount || ""}
                  type="number"
                  onChange={(e) => setToDepositAmount(e.target.value)}
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
                    await stratContract.methods
                      .deposit(toWei(toDepositAmount.toString()))
                      .send({
                        from: account,
                        gasLimit: "250000",
                        gasPrice: "2000000000",
                      });

                    refresh();
                  }}
                >
                  Deposit LP
                </Button>
              </Grid>

              <Grid item>
                <Box
                  textAlign="left"
                  fontWeight="fontWeightMedium"
                  fontFamily="fontFamily"
                  color="#807474"
                >
                  Your MAI Balance:{" "}
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setMaiToDeposit(userMaiBalance);
                    }}
                  >
                    {userMaiBalance}
                  </Link>
                </Box>
                <TextField
                  id="to-deposit-mai-amount"
                  label="MAI Amount to Deposit"
                  variant="outlined"
                  style={{
                    marginTop: "1rem",
                    minWidth: "450px",
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  autoComplete="off"
                  value={maiToDeposit || ""}
                  type="number"
                  onChange={(e) => setMaiToDeposit(e.target.value)}
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
                    await stratContract.methods
                      .depositWithMAI(toWei(maiToDeposit.toString()))
                      .send({
                        from: account,
                        gasLimit: "550000",
                        gasPrice: "2000000000",
                      });

                    refresh();
                  }}
                >
                  Deposit MAI
                </Button>
              </Grid>

              <Grid item>
                <Box
                  textAlign="left"
                  fontWeight="fontWeightMedium"
                  fontFamily="fontFamily"
                  color="#807474"
                >
                  Your Strategy Shares Balance:{" "}
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setToWithdrawAmount(userSharesAmount);
                    }}
                  >
                    {userSharesAmount}
                  </Link>
                </Box>
                <TextField
                  id="to-withdraw-amount"
                  label="LP tokens to Withdraw"
                  variant="outlined"
                  style={{
                    marginTop: "1rem",
                    minWidth: "450px",
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  autoComplete="off"
                  value={toWithdrawAmount || ""}
                  type="number"
                  onChange={(e) => setToWithdrawAmount(e.target.value)}
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
                    await stratContract.methods
                      .withdraw(toWei(toWithdrawAmount.toString()))
                      .send({
                        from: account,
                        gasLimit: "150000",
                        gasPrice: "2000000000",
                      });

                    refresh();
                  }}
                >
                  Withdraw LP
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
      <Grid
        container
        style={{
          marginTop: "30px",
          paddingBottom: "40px",
          paddingTop: "30px",
          borderTop: "2px solid black",
          backgroundColor: "black",
        }}
      >
        <Grid item xs={3} />
        <Grid
          item
          xs={6}
          container
          justify="center"
          style={{
            paddingRight: "2rem",
          }}
        >
          <Grid container direction="column">
            <Box
              fontWeight="fontWeightBold"
              fontSize="1.75rem"
              fontFamily="fontFamily"
              fontStyle=""
              color="white"
            >
              Developed by:{" "}
              <Link
                href="https://apoorvlathey.com/"
                target="_blank"
                rel="noopener"
                style={{
                  color: "white",
                  textDecoration: "underline",
                }}
              >
                Apoorv Lathey
              </Link>
            </Box>
            <Grid
              item
              style={{
                marginTop: "1rem",
              }}
            >
              <Link
                href="https://apoorvlathey.com/"
                target="_blank"
                rel="noopener"
                style={{
                  color: "white",
                  padding: "1rem",
                  paddingLeft: "0",
                }}
              >
                <Language />
              </Link>
              <Link
                href="https://twitter.com/apoorvlathey"
                target="_blank"
                rel="noopener"
                style={{
                  color: "white",
                  padding: "1rem",
                }}
              >
                <Twitter />
              </Link>
              <Link
                href="https://github.com/CodinMaster"
                target="_blank"
                rel="noopener"
                style={{
                  color: "white",
                  padding: "1rem",
                }}
              >
                <GitHub />
              </Link>
              <Link
                href="https://www.linkedin.com/in/apoorvlathey/"
                target="_blank"
                rel="noopener"
                style={{
                  color: "white",
                  padding: "1rem",
                }}
              >
                <LinkedIn />
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default App;
