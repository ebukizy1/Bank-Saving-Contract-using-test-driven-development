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
            expect(balanceOfUserWithOurToken).to.equal(amountOfTokenOwnerTransferToUser);

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
            const {owner, saveContract} = await loadFixture(deploySavingContract);
               const zeroAddress = await saveContract.returnAddressZero();
                expect(owner.address).is.not.equal(zeroAddress);
    
        });
        it("test amount must be greater than zero ", async ()=>{
            const {owner , saveContract, emaxToken, totalAmountMinted, allowedAmountToSpend} = await loadFixture(deploySavingContract);

            const ownerBalance = await emaxToken.balanceOf(owner.address);
            expect(ownerBalance).to.equal(totalAmountMinted);
            await emaxToken.connect(owner).approve(saveContract.target,allowedAmountToSpend);

            await expect(saveContract.deposit(0)).to.be.revertedWith("can't save zero value");
        })


        it("test that user balance must be greater than or equal to the amount deposit", async () => {
            const { owner, saveContract, emaxToken, totalAmountMinted, otherAccount } = await loadFixture(deploySavingContract);
        
            await emaxToken.connect(owner).transfer(otherAccount.address, 4000);
            await emaxToken.connect(otherAccount).approve(saveContract.target, 40000);
        
            try {
                await saveContract.deposit(10000000);
                assert.fail("Expected revert not received");
            } catch (error) {
                assert(`Expected "VM Exception" but got ${error}`);
                assert(`Expected "not enough token" but got ${error}`);
            }
        });
        describe("Event Test For Deposit", async ()=>{
            const {owner, saveContract, emaxToken, allowedAmountToSpend,
                amountDepositedByUser, totalAmountMinted} = await loadFixture(deploySavingContract);
                //test that owner can save token in our contract 
                const ownerBalance = await emaxToken.balanceOf(owner.address);
                expect(ownerBalance).to.equal(totalAmountMinted);
    
        
                await emaxToken.connect(owner).approve(saveContract.target,allowedAmountToSpend);
    
                await expect(saveContract.deposit(amountDepositedByUser))
                .to.emit(saveContract, "SavingSuccessful").withArgs(owner, amountDepositedByUser);
        })
        
    });

    


})
    
