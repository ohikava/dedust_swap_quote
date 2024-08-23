import {Pool, ReadinessStatus} from '@dedust/sdk';
import { TonClient, toNano, fromNano } from '@ton/ton';
import "dotenv/config";

const client = new TonClient({
    endpoint: process.env.TON_RPC,
  });
  

async function validatePool(PoolCa: string) {
    const pool = Pool.createFromAddress(PoolCa);
    const contract = client.provider(PoolCa);

    const status = await pool.getReadinessStatus(contract)
    if (status == ReadinessStatus.READY) {
        return true;
    }

    return false;


}
async function estimateSwapOut(PoolCA: string, amount: number, tokenCA="") {
    const pool = Pool.createFromAddress(PoolCA);
    const contract = client.provider(PoolCA);

    const assets = await pool.getAssets(contract);

    let mainAsset;

    for (let ix = 0; ix < assets.length; ix++) {
        if (!tokenCA && assets[ix]['type'] == 0) {
            mainAsset = assets[ix];
        } else if (tokenCA && assets[ix]['address']?.toString() == tokenCA) {
            mainAsset = assets[ix];
        }
    }

    if (!mainAsset) {
        return "Error. Wrong token CA"
    }

    const estimatedSwapOut = await pool.getEstimatedSwapOut(contract, {"assetIn": mainAsset, "amountIn": toNano(amount)});

    return fromNano(estimatedSwapOut['amountOut'])

}
const CA = "EQBg2Qw7kxsXPWgsdu6tCKq1thT2izht6ru9D7aTrZa-h-0H";

(async () => {
    console.log(await validatePool(CA))
    await new Promise(resolve => setTimeout(resolve, 3000)); // sleep to make sure there is no rate limit exceed
    console.log(await estimateSwapOut(CA, 10, "EQCJbp0kBpPwPoBG-U5C-cWfP_jnksvotGfArPF50Q9Qiv9h"))
    await new Promise(resolve => setTimeout(resolve, 3000)); // sleep to make sure there is no rate limit exceed
    console.log(await estimateSwapOut(CA, 10)) // TON

}) ()
