import { ethers, network, waffle } from "hardhat";
import { parseEther } from "@ethersproject/units";
import { AddressZero, MaxUint256, HashZero } from "@ethersproject/constants";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Signer } from "ethers";
import { solidity } from "ethereum-waffle";
import chai from "chai";
import time from "../utils/time";

chai.use(solidity);
const { expect } = chai;
const { deployContract } = waffle;

// artifacts
import StratArtifact from "../artifacts/contracts/ForceDAO_QIStrat.sol/ForceDAO_QIStrat.json";
import IERC20Artifact from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

// types
import { ForceDAOQIStrat } from "../typechain/ForceDAOQIStrat";
import { IERC20 } from "../typechain/IERC20";

describe("QI Strategy", () => {
  let strategy: ForceDAOQIStrat;
  let underlyingLP: IERC20;
  let mai: IERC20;
  let qi: IERC20;

  const underlyingLPAddress = "0x7AfcF11F3e2f01e71B7Cc6b8B5e707E42e6Ea397";
  const maiAddress = "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1";
  const qiAddress = "0x580A84C73811E1839F75d86d75d88cCa0c241fF4";

  // whate address with underyling and mai tokens for test
  const whaleAddress = "0x86fE8d6D4C8A007353617587988552B6921514Cb";

  let deployer: SignerWithAddress;
  let whale: Signer;

  before(async () => {
    [deployer] = await ethers.getSigners();

    // deploy strategy
    strategy = await ethers
      .getContractFactory("ForceDAO_QIStrat", deployer)
      .then(async (factory) => {
        return (await factory.deploy()) as ForceDAOQIStrat;
      });

    // tokens
    underlyingLP = (await ethers.getContractAt(
      "IERC20",
      underlyingLPAddress
    )) as IERC20;
    mai = (await ethers.getContractAt("IERC20", maiAddress)) as IERC20;
    qi = (await ethers.getContractAt("IERC20", qiAddress)) as IERC20;

    // impersonate whale
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [whaleAddress],
    });
    whale = await ethers.provider.getSigner(whaleAddress);
  });

  it("should `deposit` into strategy with underlying LP", async () => {
    const underlyingBalance = await underlyingLP.balanceOf(whaleAddress);

    // approve
    await underlyingLP
      .connect(whale)
      .approve(strategy.address, underlyingBalance);

    // deposit
    await expect(strategy.connect(whale).deposit(underlyingBalance)).to.emit(
      strategy,
      "PricePerShareLog"
    );

    expect(await strategy.balanceOf(whaleAddress)).to.be.gt(0);
    expect(await strategy.balance()).to.be.gt(0);
    expect(await strategy.pricePerShare()).to.be.gt(0);
  });

  it("should `deposit` into strategy with just MAI", async () => {
    const maiBalance = await mai.balanceOf(whaleAddress);

    // approve
    await mai.connect(whale).approve(strategy.address, maiBalance);

    const preWhaleSharesBalance = await strategy.balanceOf(whaleAddress);
    const preStrategyBalance = await strategy.balance();

    // deposit
    await expect(strategy.connect(whale).depositWithMAI(maiBalance)).to.emit(
      strategy,
      "PricePerShareLog"
    );

    expect(await strategy.balanceOf(whaleAddress)).to.be.gt(
      preWhaleSharesBalance
    );
    expect(await strategy.balance()).to.be.gt(preStrategyBalance);
  });

  it("should `deposit` into strategy with just QI", async () => {
    const qiBalance = await qi.balanceOf(whaleAddress);

    // approve
    await qi.connect(whale).approve(strategy.address, qiBalance);

    const preWhaleSharesBalance = await strategy.balanceOf(whaleAddress);
    const preStrategyBalance = await strategy.balance();

    // deposit
    await expect(strategy.connect(whale).depositWithQI(qiBalance)).to.emit(
      strategy,
      "PricePerShareLog"
    );

    expect(await strategy.balanceOf(whaleAddress)).to.be.gt(
      preWhaleSharesBalance
    );
    expect(await strategy.balance()).to.be.gt(preStrategyBalance);
  });

  it("should `harvest` rewards", async () => {
    // increase blocks by roughly 1 hr
    const iniBlock = await time.latestBlock();
    await time.advanceBlockTo(iniBlock.add((60 * 60) / 15));

    const prePricePerShare = await strategy.pricePerShare();

    await expect(strategy.connect(whale).harvest()).to.emit(
      strategy,
      "PricePerShareLog"
    );

    expect(await strategy.pricePerShare()).to.be.gt(prePricePerShare);
  });

  it("should `withdraw` from strategy", async () => {
    const whaleSharesBalance = await strategy.balanceOf(whaleAddress);
    const preWhaleUnderlyingBalance = await underlyingLP.balanceOf(
      whaleAddress
    );

    await strategy.connect(whale).withdraw(whaleSharesBalance);

    expect(await strategy.balanceOf(whaleAddress)).to.eq(0);
    expect(await underlyingLP.balanceOf(whaleAddress)).to.be.gt(
      preWhaleUnderlyingBalance
    );
  });
});
