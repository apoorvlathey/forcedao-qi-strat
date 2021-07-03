import { BigNumber } from "ethers";
const { ethers } = require("hardhat");

async function advanceBlock() {
  return ethers.provider.send("evm_mine", []);
}

async function advanceBlockTo(blockNumber: BigNumber) {
  for (let i = await ethers.provider.getBlockNumber(); i < blockNumber; i++) {
    await advanceBlock();
  }
}

async function latestBlock() {
  const block = await ethers.provider.getBlock("latest");
  return BigNumber.from(block.number);
}

export default {
  advanceBlock,
  advanceBlockTo,
  latestBlock,
};
