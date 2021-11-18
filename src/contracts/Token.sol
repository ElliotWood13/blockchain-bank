// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address public minter;

    // this event can be used on the front end
    event MinterChanged(address indexed from, address to);

    // public to deploy contract
    // payable to send funds
    constructor() public payable ERC20("Elliot Coin", "ECOIN") {
        // msg = global variable inside Ethereum - sender is personal who deployed
        minter = msg.sender;
    }

    function passMinterRole(address eCoin) public returns (bool) {
        require(
            msg.sender == minter,
            "Error, only owner can change pass minter role"
        );
        minter = eCoin;

        emit MinterChanged(msg.sender, eCoin);
        return true;
    }

    function mint(address account, uint256 amount) public {
        // if msg.sender !== minter then function won't be called
        require(
            msg.sender == minter,
            "Error, msg.sender does not have minter role"
        );
        // _mint is a function inherited from ERC20
        _mint(account, amount);
    }
}
