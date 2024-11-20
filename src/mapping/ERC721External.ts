import { ERC721Token} from './../../generated/schema';
import {ERC721, Transfer, } from "../../generated/ERC721External/ERC721";
import { generateCombineKey, updateOwner721 } from '../utils';
import { ContractAddress } from '../enum';
import { Address, BigInt, log } from "@graphprotocol/graph-ts";

export function handleTransfer(event: Transfer): void {
  updateOwner721(event.params.from, event.params.to, event.address, event.params.tokenId.toString(),BigInt.fromI32(1),event.block.timestamp,'ERC721');
  tokenTransfer(event);
}
export function tokenTransfer(event: Transfer): void {
  if (event.params.to.toHexString() == ContractAddress.erc721marketplace.toLowerCase()) {
    return;
  }
  // if (event.params.from.toHexString() == ContractAddress.erc721marketplace.toLowerCase()) {
  //   return;
  // }
  let id = generateCombineKey([event.address.toHexString(), event.params.tokenId.toString()]);
  let token = ERC721Token.load(id)
  if (!token) {
    token = new ERC721Token(id)
    token.tokenID = event.params.tokenId
    token.contract = event.address.toHexString();
    token.tokenURI = ""
    if (event.params.from.toHexString() != ContractAddress.erc721marketplace.toLowerCase()) {
      token.createdAt = event.block.timestamp
    }
    let nftContract = ERC721.bind(event.address)
    let tokenURIResult = nftContract.try_tokenURI(token.tokenID)
    if (!tokenURIResult.reverted) {
      token.tokenURI = tokenURIResult.value;
    }
  }
  if (event.params.from.toHexString() != ContractAddress.erc721marketplace.toLowerCase()) {
    token.updatedAt = event.block.timestamp
  }
  token.owner = event.params.to.toHexString()
  token.save();
}
