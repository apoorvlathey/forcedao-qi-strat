import { useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import axios from "axios";
// Components
import NavBar from "./components/NavBar";
import LoadingBar from "./components/LoadingBar";
import MainArea from "./components/MainArea";
import Footer from "./components/Footer";
// ABIs
const uniPairABI = require("./abis/UniswapPair.json");
const tokenABI = require("./abis/ERC20.json");
const stratDeployedInfo = require("./abis/ForceDAO_QIStrat.json");
// BN
const { BN, toWei } = require("web3-utils");

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
  const [userQiBalance, setUserQiBalance] = useState(0);
  const [maiToDeposit, setMaiToDeposit] = useState(0);
  const [qiToDeposit, setQiToDeposit] = useState(0);

  const [toDepositAmount, setToDepositAmount] = useState();
  const [toWithdrawAmount, setToWithdrawAmount] = useState();
  const [showPleaseApprove, setShowPleaseApprove] = useState([
    false,
    false,
    false,
  ]);

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

  const stratAddress = stratDeployedInfo.address;
  const deployedAtTimestamp =
    parseInt(+new Date("Jul-05-2021 05:25:46 AM UTC")) / 1000;

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

  const fetchLpAmountAndRewards = async () => {
    setLoading(true);
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
    const res_user_qi_balance = await qiContract.methods
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
    setUserQiBalance(
      await toDecimal(
        null,
        res_user_qi_balance,
        true // isETH==true bcoz QI tokens also have fixed 18 decimals
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
    // some QI tokens might be lying in strategy contract because of other users depositing/withdrawing
    const stratQiBalance = await qiContract.methods
      .balanceOf(stratAddress)
      .call();
    const rewardsWithDecimals = await toDecimal(
      null,
      new BN(rewards).add(new BN(stratQiBalance)),
      true // isETH==true bcoz QI has 18 decimals
    );
    setPendingRewards(rewardsWithDecimals);
    setPendingRewardsUsd(
      parseFloat((prices[0] * rewardsWithDecimals).toFixed(2))
    );

    setLoading(false);
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
      setLoading(true);
      setInputDisabled(false);
      setStratContract(
        new web3.eth.Contract(stratDeployedInfo.abi, stratAddress)
      );
      setQiContract(new web3.eth.Contract(tokenABI, qiAddress));
      setMaiContract(new web3.eth.Contract(tokenABI, maiAddress));
      setUnderlyingContract(
        new web3.eth.Contract(uniPairABI, underlyingAddress)
      );
      setLoading(false);
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
      apy !== undefined &&
      totalLpAmount !== undefined &&
      totalToken0UsdVal !== undefined &&
      totalToken1UsdVal !== undefined &&
      totalToken0Share !== undefined &&
      totalToken0UsdVal !== undefined &&
      totalToken1Share !== undefined &&
      totalToken1UsdVal !== undefined
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
      <NavBar
        web3={web3}
        setWeb3={setWeb3}
        account={account}
        setAccount={setAccount}
      />
      <LoadingBar isLoading={loading} />
      <MainArea
        account={account}
        refresh={refresh}
        inputDisabled={inputDisabled}
        isDataFetched={isDataFetched}
        qiUsdVal={qiUsdVal}
        maiUsdVal={maiUsdVal}
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
        stratAddress={stratAddress}
        showPleaseApprove={showPleaseApprove}
        setShowPleaseApprove={setShowPleaseApprove}
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
      <Footer />
    </Grid>
  );
}

export default App;
