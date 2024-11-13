
require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia:{
      url:'https://eth-sepolia.g.alchemy.com/v2/U7ZCES8-cQ5XOje5tX8_BirWj3qNYCQF',
      accounts:['e802cadcd9365ebd6f418e9d6df644313f37cfbe26c158ab0fdb03a9269fbb11']
    }
  }
};