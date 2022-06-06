/**
 *Submitted for verification at BscScan.com on 2022-01-11
*/

// SPDX-License-Identifier: MIT AND Unlicense
pragma solidity ^0.8.0;

interface AggregatorV3Interface {

  function decimals()
    external
    view
    returns (
      uint8
    );

  function description()
    external
    view
    returns (
      string memory
    );

  function version()
    external
    view
    returns (
      uint256
    );

  // getRoundData and latestRoundData should both raise "No data present"
  // if they do not have data to report, instead of returning unset values
  // which could be misinterpreted as actual reported values.
  function getRoundData(
    uint80 _roundId
  )
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );

  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );

}


pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}



pragma solidity ^0.8.0;


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _setOwner(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _setOwner(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _setOwner(newOwner);
    }

    function _setOwner(address newOwner) private {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


pragma solidity ^0.8.4;

interface IPriceConsumer {
    /**
     * @notice Returns the latest price
     * @param _pair Supported currency pair
     * @return latest price
     */
    function getLatestPrice(address _pair)
        external
        view
        returns (uint256);
}



pragma solidity ^0.8.4;
/**
 * ChainLink Price Consumer Contract for BNB/USD, BUSD/BNB,
 * CAKE/BNB, ADA/BNB, DOT/BNB, ETH/BNB, USDT/USD.
 *
 * Network: Binance Smart Chain(Mainnet)
 * Aggregator: BNB/USD
 * Address: 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE
 */
contract ChainLinkPriceConsumer is Ownable, IPriceConsumer {

    uint256 public constant defaultDigits = 8;

    mapping(address => address) public feedRegistry;
    mapping(address => uint256) public priceDigits;

    /**
     * @notice Register price feed aggregator per pair
     * @param _pair Supported currency pair
     * @param _aggregatorAddress Aggregator address
     *      https://docs.chain.link/docs/binance-smart-chain-addresses/
     * @param _digits price digits
     */
    function registerPriceFeed(
        address _pair,
        address _aggregatorAddress,
        uint256 _digits
    ) external onlyOwner {
        require(_pair != address(0), "Non zero pair");
        require(_aggregatorAddress != address(0), "Non zero aggregator");
        feedRegistry[_pair] = _aggregatorAddress;
        priceDigits[_pair] = _digits;
    }

    /**
     * @notice Get data from the latest round
     * @param _pair Supported currency pair
     * @return roundId The round ID
     * @return answer The price
     * @return startedAt Timestamp of when the round started
     * @return updatedAt Timestamp of when the round was updated
     * @return answeredInRound Timestamp of when the round was updated
     */
    function getLatestRoundData(address _pair)
        external
        view
        onlyOwner
        returns
    (
        uint80 roundId,
        int answer,
        uint startedAt,
        uint updatedAt,
        uint80 answeredInRound
    ) {
        require(_pair != address(0), "Non zero pair");
        address priceFeed = feedRegistry[_pair];
        require(priceFeed != address(0), "Not registered pair");

        return AggregatorV3Interface(priceFeed).latestRoundData();
    }

    /**
     * @notice Returns the latest price
     * @param _pair Supported currency pair
     * @return the latest price
     */
    function getLatestPrice(address _pair)
        external
        override
        view
        returns (uint256)
    {
        require(_pair != address(0), "Non zero pair");
        address priceFeed = feedRegistry[_pair];
        require(priceFeed != address(0), "Not registered pair");

        (, int price,,,) = AggregatorV3Interface(priceFeed).latestRoundData();
        return uint256(price) / 10 ** (priceDigits[_pair] - defaultDigits);
    }
}