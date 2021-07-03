// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

library Babylonian {
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
        // else z = 0
    }
}

interface IUniswapV2Pair {
    function token0() external pure returns (address);

    function token1() external pure returns (address);

    function getReserves()
        external
        view
        returns (
            uint112 _reserve0,
            uint112 _reserve1,
            uint32 _blockTimestampLast
        );
}

interface IUniswapV2Router02 {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        );

    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    )
        external
        payable
        returns (
            uint256 amountToken,
            uint256 amountETH,
            uint256 liquidity
        );

    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH);

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);
}

interface IFarm {
    function deposit(uint256 _pid, uint256 _amount) external;

    function withdraw(uint256 _pid, uint256 _amount) external;

    function deposited(uint256 _pid, address _user)
        external
        view
        returns (uint256);

    function pending(uint256 _pid, address _user)
        external
        view
        returns (uint256);
}

contract ForceDAO_QIStrat is ERC20 {
    using SafeERC20 for IERC20;

    IUniswapV2Router02 public constant quickswapRouter =
        IUniswapV2Router02(0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff);

    IERC20 public constant underlying =
        IERC20(0x7AfcF11F3e2f01e71B7Cc6b8B5e707E42e6Ea397);
    IFarm public constant farm =
        IFarm(0x574Fe4E8120C4Da1741b5Fd45584de7A5b521F0F);
    uint256 public constant pid = 2;
    address public constant QI = 0x580A84C73811E1839F75d86d75d88cCa0c241fF4;
    address public constant MAI = 0xa3Fa99A148fA48D14Ed51d610c367C61876997F1; // formerly miMatic

    event PricePerShareLog(uint256);

    constructor() ERC20("Force MAI/QI Strategy", "F_MAI/QI") {}

    // --- Execute Functions ---

    // deposit() and withdraw() both result in the claiming of rewards (QI)
    // from the farm, so it's advised to call harvest() just after these calls to
    // instantly put the new rewards to work by compounding

    // ! the underlying farm has 0.5% deposit fees
    function deposit(uint256 amountIn) external {
        uint256 _pool = balance();
        _deposit(_pool, amountIn, true);
    }

    function _deposit(
        uint256 _pool,
        uint256 amountIn,
        bool shouldTransferFrom
    ) internal {
        // get underlying tokens from user
        if (shouldTransferFrom) {
            underlying.safeTransferFrom(msg.sender, address(this), amountIn);
        }

        // stake into farm
        underlying.safeApprove(address(farm), amountIn);
        farm.deposit(pid, amountIn);

        // mint shares for user
        uint256 shares = 0;
        if (totalSupply() == 0) {
            shares = amountIn;
        } else {
            shares = (amountIn * totalSupply()) / _pool;
        }
        _mint(msg.sender, shares);

        _emitPricePerShare();
    }

    function depositWithMAI(uint256 maiAmountIn) external {
        uint256 _pool = balance();

        // get MAI from user
        IERC20(MAI).safeTransferFrom(msg.sender, address(this), maiAmountIn);

        /// --- get `underlying` LP ---
        // get amount to swap
        (, uint256 res1, ) = IUniswapV2Pair(address(underlying)).getReserves();
        // token0: QI
        // token1: MAI
        uint256 maiAmountToSwap = calculateSwapInAmount(res1, maiAmountIn);

        // swap required MAI to QI
        address[] memory path = new address[](2);
        path[0] = MAI;
        path[1] = QI;

        IERC20(MAI).safeApprove(address(quickswapRouter), 0);
        IERC20(MAI).safeApprove(address(quickswapRouter), maiAmountIn);
        uint256 qiReceived = quickswapRouter.swapExactTokensForTokens(
            maiAmountToSwap,
            1,
            path,
            address(this),
            block.timestamp
        )[path.length - 1];

        // add QI and MAI to Sushiswap Pool, get underlying
        // MAI already approved above, so just approveing QI here
        IERC20(QI).safeApprove(address(quickswapRouter), 0);
        IERC20(QI).safeApprove(address(quickswapRouter), qiReceived);
        quickswapRouter.addLiquidity(
            QI,
            MAI,
            qiReceived,
            maiAmountIn - maiAmountToSwap,
            1,
            1,
            address(this),
            block.timestamp
        );
        uint256 underlyingReceived = underlying.balanceOf(address(this));

        // stake and mint shares for user
        _deposit(_pool, underlyingReceived, false);
    }

    function withdraw(uint256 shares) external {
        _emitPricePerShare();

        // burn user shares
        uint256 underlyingAmt = (balance() * shares) / totalSupply();
        _burn(msg.sender, shares);

        // withdraw underlying from farm
        farm.withdraw(pid, underlyingAmt);

        // send underlying to user
        underlying.safeTransfer(msg.sender, underlyingAmt);
    }

    function _emitPricePerShare() internal {
        emit PricePerShareLog(pricePerShare());
    }

    // 1. claim QI reward
    // 2. swap some QI to MAI
    // 3. Add QI+MAI to Sushiswap Pool, get underlying
    // 4. Stake underlying back into farm
    function harvest() external {
        // claim rewards
        farm.deposit(pid, 0);
        uint256 QIBalance = IERC20(QI).balanceOf(address(this));

        // get amount to swap
        (uint256 res0, , ) = IUniswapV2Pair(address(underlying)).getReserves();
        // token0: QI
        // token1: MAI
        uint256 QIAmountToSwap = calculateSwapInAmount(res0, QIBalance);

        // swap required QI to MAI
        address[] memory path = new address[](2);
        path[0] = QI;
        path[1] = MAI;

        IERC20(QI).safeApprove(address(quickswapRouter), 0);
        IERC20(QI).safeApprove(address(quickswapRouter), QIBalance);
        uint256 maiReceived = quickswapRouter.swapExactTokensForTokens(
            QIAmountToSwap,
            1,
            path,
            address(this),
            block.timestamp
        )[path.length - 1];

        // add QI and MAI to Sushiswap Pool, get underlying
        // QI already approved above, so just approveing MAI here
        IERC20(MAI).safeApprove(address(quickswapRouter), 0);
        IERC20(MAI).safeApprove(address(quickswapRouter), maiReceived);
        quickswapRouter.addLiquidity(
            QI,
            MAI,
            maiReceived,
            QIBalance - QIAmountToSwap,
            1,
            1,
            address(this),
            block.timestamp
        );

        // stake into farm
        uint256 underlyingReceived = underlying.balanceOf(address(this));
        underlying.safeApprove(address(farm), underlyingReceived);
        farm.deposit(pid, underlyingReceived);
    }

    // --- Public View Functions ---

    function pendingRewards() external view returns (uint256 amount) {
        return farm.pending(pid, address(this));
    }

    // total underlying tokens staked in farming contract
    function balance() public view returns (uint256) {
        return farm.deposited(pid, address(this));
    }

    function pricePerShare() public view returns (uint256) {
        if (totalSupply() == 0) {
            return 0;
        }

        return (balance() * 1e18) / totalSupply();
    }

    // --- Internal View Functions ---

    function calculateSwapInAmount(uint256 reserveIn, uint256 userIn)
        internal
        pure
        returns (uint256)
    {
        return
            (Babylonian.sqrt(
                reserveIn * ((userIn * 3988000) + (reserveIn * 3988009))
            ) - (reserveIn * 1997)) / 1994;
    }
}
