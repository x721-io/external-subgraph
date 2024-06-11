import { ERC721Token} from './../../generated/schema';
import {ERC721, Transfer, } from "../../generated/ERC721External/ERC721";

export function handleTransfer(event: Transfer): void {
  tokenTransfer(event);
}
export function tokenTransfer(event: Transfer): void {
  let token = ERC721Token.load(event.params.tokenId.toString())
  if (!token) {
    token = new ERC721Token(event.params.tokenId.toString())
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
  token.owner = event.params.to.toHexString()
  token.save();
}
