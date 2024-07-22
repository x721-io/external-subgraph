import { TransferBatch, TransferSingle, ERC1155, URI } from "../../generated/ERC1155External/ERC1155";
import {DEAD, ZERO} from "../const";
import { fetchOrCreateNFT1155, fetchOrCreateNFTOwnerBalance, generateCombineKey } from "../utils";
import { log } from "@graphprotocol/graph-ts";
import { ERC1155Token } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts"
import { ContractAddress } from '../enum';

export function handleTransfer(event: TransferSingle): void {
    tokenTransfer(event);
  }
  
export function handleTransferBatch(event: TransferBatch): void {
    tokenTransferBatch(event)
}

export function tokenTransfer(event: TransferSingle): void {
  if (event.params.to.toHexString() == ContractAddress.erc1155marketplace.toLowerCase()) {
    return;
  }
  if (event.params.from.toHexString() == ContractAddress.erc1155marketplace.toLowerCase()) {
    return;
  }
  
    let nft = fetchOrCreateNFT1155(event.params.id.toString(), event.block.timestamp, event.address.toHexString());
  
    let nftOwnerBalanceFrom = fetchOrCreateNFTOwnerBalance(event.params.id.toString(), event.params.from.toHexString(), event.block.timestamp,event.address.toHexString());
    let nftOwnerBalanceTo = fetchOrCreateNFTOwnerBalance(event.params.id.toString(), event.params.to.toHexString(), event.block.timestamp, event.address.toHexString());
  
    if (event.params.from == event.params.to) {
      return;
    }
    
    if (event.params.from.toHexString() != ZERO) {
      log.info('balance: {} , address {} ', [nftOwnerBalanceTo.balance.toString(), nftOwnerBalanceTo.owner]);
      if (event.params.to.toHexString() == DEAD) {
        nftOwnerBalanceFrom.burnQuantity = nftOwnerBalanceFrom.burnQuantity.plus(event.params.value);
        nftOwnerBalanceFrom.balance = nftOwnerBalanceFrom.balance.minus(event.params.value);
      } else {
        nftOwnerBalanceFrom.owner = event.params.from.toHexString();
        nftOwnerBalanceTo.owner = event.params.to.toHexString();
        nftOwnerBalanceFrom.balance = nftOwnerBalanceFrom.balance.minus(event.params.value);
        nftOwnerBalanceTo.balance = nftOwnerBalanceTo.balance.plus(event.params.value);
      }
      
      nftOwnerBalanceFrom.save();
      nftOwnerBalanceTo.save();
    } else {
      nftOwnerBalanceTo.owner = event.params.to.toHexString();
      nftOwnerBalanceTo.balance = nftOwnerBalanceTo.balance.plus(event.params.value);
      nft.balance = nft.balance.plus(event.params.value);
      const nftContract = ERC1155.bind(event.address);
      let tokenURIResult = nftContract.try_uri(event.params.id);
      if (!tokenURIResult.reverted) {
        nft.tokenURI = tokenURIResult.value;
      }
      nft.save();
      nftOwnerBalanceTo.save();
    }
  }

  export function handleURI(event: URI): void {
    let id = generateCombineKey([event.address.toHexString(), event.params.id.toString()]);
    let uniceran = ERC1155Token.load(id);
  
    if (uniceran != null) {
      uniceran.tokenURI = event.params.value.toString();
      uniceran.save();
    }
    else {
        uniceran = new ERC1155Token(id);
        uniceran.tokenID = event.params.id
        uniceran.tokenURI = event.params.value;
        uniceran.contract = event.address.toHexString();
        uniceran.balance = BigInt.fromString('0')
        uniceran.createdAt = event.block.timestamp;
        uniceran.save()
    }
  }

export function tokenTransferBatch(event: TransferBatch): void {
  if (event.params.to.toHexString() == ContractAddress.erc1155marketplace.toLowerCase()) {
    return;
  }
  if (event.params.from.toHexString() == ContractAddress.erc1155marketplace.toLowerCase()) {
    return;
  }
    for (let i = 0; i < event.params.ids.length; i++) {
      let nft = fetchOrCreateNFT1155(event.params.ids[i].toString(), event.block.timestamp, event.address.toHexString());
  
    let nftOwnerBalanceFrom = fetchOrCreateNFTOwnerBalance(event.params.ids[i].toString(), event.params.from.toHexString(), event.block.timestamp, event.address.toHexString());
    let nftOwnerBalanceTo = fetchOrCreateNFTOwnerBalance(event.params.ids[i].toString(), event.params.to.toHexString(), event.block.timestamp, event.address.toHexString());
  
    if (event.params.from == event.params.to) {
      return;
    }
    
    if (event.params.from.toHexString() != ZERO) {
      log.info('balance: {} , address {} ', [nftOwnerBalanceTo.balance.toString(), nftOwnerBalanceTo.owner]);
      if (event.params.to.toHexString() == DEAD) {
        nftOwnerBalanceFrom.burnQuantity = nftOwnerBalanceFrom.burnQuantity.plus(event.params.values[i]);
      } else {
        nftOwnerBalanceFrom.owner = event.params.from.toHexString();
        nftOwnerBalanceTo.owner = event.params.to.toHexString();
        nftOwnerBalanceFrom.balance = nftOwnerBalanceFrom.balance.minus(event.params.values[i]);
        nftOwnerBalanceTo.balance = nftOwnerBalanceTo.balance.plus(event.params.values[i]);
      }
      
      nftOwnerBalanceFrom.save();
      nftOwnerBalanceTo.save();
    } else {
      nftOwnerBalanceTo.owner = event.params.to.toHexString();
      nftOwnerBalanceTo.balance = nftOwnerBalanceTo.balance.plus(event.params.values[i]);
      nft.balance = nft.balance.plus(event.params.values[i]);
      const nftContract = ERC1155.bind(event.address);
      let tokenURIResult = nftContract.try_uri(event.params.ids[i]);
      if (!tokenURIResult.reverted) {
        nft.tokenURI = tokenURIResult.value;
      }
        nft.save();
        nftOwnerBalanceTo.save();
      }
    }
  }