import { PricePerShareLog } from "../../generated/ForceDAO_QIStrat/ForceDAO_QIStrat";
import { PricePerShare } from "../../generated/schema";

export function handlePricePerShareLog(event: PricePerShareLog): void {
  let pricePerShare = new PricePerShare(event.block.timestamp.toString());
  pricePerShare.price = event.params.param0;
  pricePerShare.save();
}
