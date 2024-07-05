import { ERC1155Token, ERC1155Balance } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts/index"

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