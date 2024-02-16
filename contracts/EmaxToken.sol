// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EmaxToken is ERC20, Ownable {

    constructor(address initialOwner)
        ERC20("EmaxToken", "EMX")
        Ownable(initialOwner)
    {
        mint(initialOwner, 30000000000 );
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}