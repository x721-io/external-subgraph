import { ERC721Token} from './../../generated/schema';
import {ERC721, Transfer, } from "../../generated/ERC721External/ERC721";
import { generateCombineKey } from '../utils';
import { ContractAddress } from '../enum';

export function handleTransfer(event: Transfer): void {
  tokenTransfer(event);
}
export function tokenTransfer(event: Transfer): void {
  let id = generateCombineKey([event.address.toHexString(), event.params.tokenId.toString()]);
  let token = ERC721Token.load(id)
  if (!token) {
    token = new ERC721Token(id)
    token.tokenID = event.params.tokenId
    token.contract = event.address.toHexString();
    token.tokenURI = ""
    token.createdAt = event.block.timestamp
    let nftContract = ERC721.bind(event.address)
    let tokenURIResult = nftContract.try_tokenURI(token.tokenID)
    if (!tokenURIResult.reverted) {
      token.tokenURI = tokenURIResult.value;
    }
  }
  token.updatedAt = event.block.timestamp
  if (event.params.to.toHexString() != ContractAddress.erc721marketplace) {
    token.owner = event.params.to.toHexString()
  }
  token.save();
}
