///<refeerence types="ethers" />
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { EmaxToken } from "../typechain-types";
import { SaveERC20 } from "../typechain-types";

describe("Save Contract " , async ()=>{


        const deploySavingContract = async()=>{

            const totalAmountMinted = 30000000000;
            const allowedAmountToSpend = 500000;
            const amountOfTokenOwnerTransferToUser = 30000;
            const amountDepositedByUser = 3000;

            const initialOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            const [owner, otherAccount, otherAccount1] = await ethers.getSigners();
            const EmaxToken = await ethers.getContractFactory("EmaxToken");
            const emaxToken = await EmaxToken.deploy(owner.address)
            const SaveContract = await ethers.getContractFactory("SaveERC20")
            const saveContract = await SaveContract.deploy(emaxToken.target)


            return {emaxToken, saveContract, owner, otherAccount, totalAmountMinted,
             allowedAmountToSpend, amountDepositedByUser, amountOfTokenOwnerTransferToUser}
        }


    describe("deposit test", ()=>{
        
        it("test that user can save money calling the deposit function", async ()=>{
         
            const {owner, otherAccount, saveContract, emaxToken, allowedAmountToSpend,
            amountDepositedByUser, amountOfTokenOwnerTransferToUser,totalAmountMinted} = await loadFixture(deploySavingContract);
            //test that owner can save token in our contract 
            const ownerBalance = await emaxToken.balanceOf(owner.address);
            expect(ownerBalance).to.equal(totalAmountMinted);
            await emaxToken.connect(owner).transfer(otherAccount.address,amountOfTokenOwnerTransferToUser );


            const balanceOfUserWithOurToken = await emaxToken.balanceOf(otherAccount.address);
            expect(balanceOfUserWithOurToken).to.equal(amountOfTokenOwnerTransferToUser)

            await emaxToken.connect(owner).approve(saveContract.target,allowedAmountToSpend);

            await saveContract.deposit(amountDepositedByUser);

            const userSavingOne = await saveContract.checkUserBalance(owner.address);
            expect(userSavingOne).to.equal(amountDepositedByUser);

            //test that i can allow another user to save token 
            await emaxToken.connect(otherAccount).approve(saveContract.target,4000);
            await saveContract.connect(otherAccount).deposit(amountDepositedByUser);
            const userSavingTwo = await saveContract.checkUserBalance(otherAccount.address);
            expect(userSavingTwo).to.equal(amountDepositedByUser);
            
            //checking the contract address
            const contractBalance = await saveContract.checkContractBalance();
            expect(contractBalance).to.equal(6000);
         
        });
    });

    describe("Address Zero Test", async ()=>{
        it("test that address zero cannot deposit ", async()=>{
            const {owner, saveContract, emaxToken, allowedAmountToSpend,
                amountDepositedByUser} = await loadFixture(deploySavingContract);
               const zeroAddress = saveContract.returnAddressZero();

                await emaxToken.connect(owner).approve(saveContract.target,allowedAmountToSpend);

                await expect(saveContract.connect(zeroAddress).deposit(amountDepositedByUser))
                .to.be.revertedWith("address zero detected");
        })
    })


})
    
//     const deploymentOfSavingsContract = async()=>{
//         const [owner, otherAccount, otherAccount1] = await ethers.getSigners();
//             return { owner, otherAccount};
//     }

//     describe("Deployment Test ", async ()=>{
//         it("test save contract and token havebeen deployed ",async()=>{
//             assert.isNotNull(emaxToken);
//             assert.isNotNull(saveContract);
//         });
//     });


//     describe("Savings Test", async () => {
//         it("test that user can deposit to the saving contract", async () => {
//             const { owner, otherAccount } = await loadFixture(deploymentOfSavingsContract);
    
//             // Transfer tokens from emaxToken to owner
//             await emaxToken.transfer(owner.address, 40000);
    
//             // Approve otherAccount to spend tokens on behalf of owner
//             await emaxToken.approve(otherAccount.address, 5000);
    
//             // Deposit tokens to the saving contract
//             await saveContract.connect(otherAccount).deposit(4000);
    
//             // Check the user balance in the savings contract
//             const userBalance = await saveContract.checkUserBalance(otherAccount.address);
//             expect(userBalance).to.equal(4000);
//         });
//     });
    
// })