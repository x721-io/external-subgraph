import { ERC1155Token, ERC1155Balance, Contract, OwnerContract } from "../generated/schema";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { ContractAddress } from "./enum";


export function fetchOrCreateNFTOwnerBalance(tokenId: string, owner: string, timestamp: BigInt, contract: string): ERC1155Balance {
    let id = generateCombineKey([tokenId, owner, contract]);
    let nft = fetchOrCreateNFT1155(tokenId, timestamp , contract);
    let nftOwnerBalance = ERC1155Balance.load(id);
    if (nftOwnerBalance == null) {
      nftOwnerBalance = new ERC1155Balance(id);
      nftOwnerBalance.id = id;
      nftOwnerBalance.owner = owner;
      nftOwnerBalance.balance = BigInt.fromI32(0);
      nftOwnerBalance.burnQuantity = BigInt.fromI32(0);
      nftOwnerBalance.stakedAmount = BigInt.fromI32(0);
      nftOwnerBalance.token = nft.id;
      nftOwnerBalance.lastUpdated = timestamp;
      nftOwnerBalance.owner = owner
    }
    nft.save();
    return nftOwnerBalance;
  }

  export function generateCombineKey(keys: string[]): string {
    return keys.join('-');
  }

  export function fetchOrCreateNFT1155(tokenId: string, timestamp: BigInt, contract: string): ERC1155Token {
  let id = generateCombineKey([contract, tokenId]);
    let nft = ERC1155Token.load(id);
    if (nft == null) {
      nft = new ERC1155Token(id);
      nft.id = id;
      nft.contract = contract;
      nft.tokenID = BigInt.fromString(tokenId)
      nft.tokenURI = '';
      nft.balance = BigInt.fromString('0')
      nft.createdAt = timestamp;
    }
    return nft;
  }


  export function updateOwner1155(from: Address, to: Address ,contractAddress: Address, tokenId: String,amount: BigInt , timestamp: BigInt, type: String): void {
    // // ----------------------------------------------------------------------------
    // Try to load or create the Contract entity
    let contractId = contractAddress.toHexString();
    let contract = Contract.load(contractId);
    
    log.info('=========Delete updateOwner1155=======: from: {}, to: {}, contract:{}, amount:{}', [from.toHexString(), to.toHexString() ,contractAddress.toHexString(), amount.toString()])

    let fromID = generateCombineKey([contractAddress.toHexString(), from.toHexString()])
    let toID = generateCombineKey([contractAddress.toHexString(), to.toHexString()])
    
    if(!contract){
        contract = new Contract(contractId);
        contract.contract = contractAddress.toHexString();
        contract.count = BigInt.fromI32(0);
    }
    
    // Load the "from" owner record
    let ownerFrom = OwnerContract.load(fromID);
    if (!ownerFrom) {
      ownerFrom = new OwnerContract(fromID);
      ownerFrom.contract = contractAddress.toHexString();
      ownerFrom.count = amount.neg();
      ownerFrom.user = from.toHexString();
      ownerFrom.timestamp = timestamp;
    } else {
      ownerFrom.count = ownerFrom.count.minus(amount);
    }
    if(ownerFrom.count.le(BigInt.fromI32(0))){
      ownerFrom.count = BigInt.fromI32(0)
    }
    // Load the "to" owner record
    let ownerTo = OwnerContract.load(toID);
    if (!ownerTo) {
      ownerTo = new OwnerContract(toID);
      ownerTo.contract = contractAddress.toHexString();
      ownerTo.count = amount;
      ownerTo.user = to.toHexString();
      ownerTo.timestamp = timestamp;
      
      // Increment contract count if "to" didn't exist before and addresses are valid
      if (to.toHexString() != ContractAddress.ZERO) {
        if((type == 'ERC1155') && (to.toHexString() != ContractAddress.erc1155marketplace.toLowerCase())){
          contract.count = contract.count.plus(BigInt.fromI32(1));
        }
      }
    } else {
      let preCount = ownerTo.count;
      ownerTo.count = ownerTo.count.plus(amount);
      if(preCount.equals(BigInt.fromI32(0)) && ownerTo.count.gt(BigInt.fromI32(0)) && to.toHexString() != ContractAddress.ZERO){
        if((type == 'ERC1155') && (to.toHexString() != ContractAddress.erc1155marketplace.toLowerCase())){
          contract.count = contract.count.plus(BigInt.fromI32(1));
        }
      }
    }
    // // // Adjust contract count based on "from" quantity
    if (ownerFrom.count.equals(BigInt.fromI32(0)) && (from.toHexString() != ContractAddress.ZERO)) {
        if((type == 'ERC1155')){
          if(from.toHexString() != ContractAddress.erc1155marketplace.toLowerCase()){
            contract.count = contract.count.minus(BigInt.fromI32(1));
          }
        }
    }
    // // Save changes
    ownerTo.save();
    ownerFrom.save();
    contract.save();
  }


  export function updateOwner721(from: Address, to: Address ,contractAddress: Address, tokenId: String,amount: BigInt , timestamp: BigInt, type: String): void {
    // // ----------------------------------------------------------------------------
    // Try to load or create the Contract entity
    let contractId = contractAddress.toHexString();
    let contract = Contract.load(contractId);
    

    let fromID = generateCombineKey([contractAddress.toHexString(), from.toHexString()])
    let toID = generateCombineKey([contractAddress.toHexString(), to.toHexString()])
    
    if(!contract){
        contract = new Contract(contractId);
        contract.contract = contractAddress.toHexString();
        contract.count = BigInt.fromI32(0);
    }
    
    // Load the "from" owner record
    let ownerFrom = OwnerContract.load(fromID);
    if (!ownerFrom) {
      ownerFrom = new OwnerContract(fromID);
      ownerFrom.contract = contractAddress.toHexString();
      ownerFrom.count = amount.neg();
      ownerFrom.user = from.toHexString();
      ownerFrom.timestamp = timestamp;
    } else {
      ownerFrom.count = ownerFrom.count.minus(amount);
    }
    if(ownerFrom.count.le(BigInt.fromI32(0))){
      ownerFrom.count = BigInt.fromI32(0)
    }
    // Load the "to" owner record
    let ownerTo = OwnerContract.load(toID);
    if (!ownerTo) {
      ownerTo = new OwnerContract(toID);
      ownerTo.contract = contractAddress.toHexString();
      ownerTo.count = amount;
      ownerTo.user = to.toHexString();
      ownerTo.timestamp = timestamp;
      
      // Increment contract count if "to" didn't exist before and addresses are valid
      if (to.toHexString() != ContractAddress.ZERO) {
        contract.count = contract.count.plus(BigInt.fromI32(1));
      }
    } else {
      let preCount = ownerTo.count;
      ownerTo.count = ownerTo.count.plus(amount);
      if(preCount.equals(BigInt.fromI32(0)) && ownerTo.count.gt(BigInt.fromI32(0)) && to.toHexString() != ContractAddress.ZERO){
        contract.count = contract.count.plus(BigInt.fromI32(1));
      }
    }
    // // // Adjust contract count based on "from" quantity
    if (ownerFrom.count.equals(BigInt.fromI32(0)) && (from.toHexString() != ContractAddress.ZERO)) {
      contract.count = contract.count.minus(BigInt.fromI32(1));
    }
    // // Save changes
    ownerTo.save();
    ownerFrom.save();
    contract.save();
  }