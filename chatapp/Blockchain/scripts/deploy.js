const hre = require("hardhat");

const main = async () => {

  const desiredOwnerAddress ="0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  

  const UserDetails= await hre.ethers.getContractFactory("UserDetails");

  const userDetails=await UserDetails.deploy();

  await userDetails.deployed();

  console.log("Deployed to: ",userDetails.address);
}

const runMain=async ()=>{
  try{
    await main();
    process.exit(0);
  }catch(error){
    console.error(error);
    process.exit(1);
  }
}

runMain();