const Token = artifacts.require("Token");
const eCoin = artifacts.require("eCoin");

module.exports = async function(deployer) {
    // deploy token (Truffle)
    await deployer.deploy(Token)

    //assign token into variable to get it's address
    const token = await Token.deployed()

	//pass token address for eCoin contract(for future minting)
    await deployer.deploy(eCoin, token.address)

    //assign eCoin contract into variable to get it's address
    const eCoin = await eCoin.deployed()

	//change token's owner/minter from deployer to eCoin
    await token.passMinterRole(eCoin.address)
};