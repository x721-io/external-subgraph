import { ERC1155Token, ERC1155Balance } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts/index"

export function fetchOrCreateNFTOwnerBalance(tokenId: string, owner: string, timestamp: BigInt): ERC1155Balance {
    let id = generateCombineKey([tokenId, owner]);
    let nftOwnerBalance = ERC1155Balance.load(id);
    if (nftOwnerBalance == null) {
      nftOwnerBalance = new ERC1155Balance(tokenId);
      nftOwnerBalance.id = id;
      nftOwnerBalance.owner = owner;
      nftOwnerBalance.balance = BigInt.fromI32(0);
      nftOwnerBalance.burnQuantity = BigInt.fromI32(0);
      nftOwnerBalance.stakedAmount = BigInt.fromI32(0);
      nftOwnerBalance.token = tokenId;
      nftOwnerBalance.lastUpdated = timestamp;
      nftOwnerBalance.owner = owner
    }
    return nftOwnerBalance;
  }

  export function generateCombineKey(keys: string[]): string {
    return keys.join('-');
  }

  export function fetchOrCreateNFT1155(tokenId: string, timestamp: BigInt, contract: string): ERC1155Token {
    let nft = ERC1155Token.load(tokenId);
    if (nft == null) {
      nft = new ERC1155Token(tokenId);
      nft.id = tokenId;
      nft.contract = contract;
      nft.tokenID = BigInt.fromString(tokenId)
      nft.tokenURI = '';
      nft.balance = BigInt.fromString('0')
      nft.createdAt = timestamp;
    }
    return nft;
  }