const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getAlgodClient, algosdk } = require('../algorand/client');

// ✅ Utility: Prompt user to fund account manually
async function promptToFundAccount(address) {
  console.log(`\n⏳ Please manually fund this address with at least 0.2 ALGO (200000 microAlgos)`);
  console.log(`👉 Faucet: https://dispenser.testnet.aws.algodev.network/`);
  console.log(`🔗 Address: ${address}`);
  console.log(`🚀 Press Enter once funded to continue...`);

  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', () => resolve());
  });
}

// ✅ Utility: Robust custom confirmation
async function waitForConfirmationCustom(client, txId, timeout) {
  const status = await client.status().do();
  const startRound = status['last-round'] + 1;
  let currentRound = startRound;

  while (currentRound < startRound + timeout) {
    const pendingInfo = await client.pendingTransactionInformation(txId).do();
    if (pendingInfo) {
      if (pendingInfo['confirmed-round'] && pendingInfo['confirmed-round'] > 0) {
        console.log(`✅ Transaction confirmed in round ${pendingInfo['confirmed-round']}`);
        return pendingInfo;
      } else if (pendingInfo['pool-error'] && pendingInfo['pool-error'].length > 0) {
        throw new Error(`Transaction ${txId} rejected - pool error: ${pendingInfo['pool-error']}`);
      }
    }
    console.log(`⏳ Waiting for confirmation... (round ${currentRound})`);
    await client.statusAfterBlock(currentRound).do();
    currentRound++;
  }
  throw new Error(`Transaction ${txId} not confirmed after ${timeout} rounds`);
}

// ✅ POST: Create NFT using email
router.post('/create-nft', async (req, res) => {
  const { email, assetName, unitName, assetURL } = req.body;

  if (!email || !assetName || !unitName || !assetURL) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // 1️⃣ Get account from DB
    const result = await pool.query('SELECT * FROM accounts WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const { mnemonic } = result.rows[0];
    const algodClient = getAlgodClient();
    const account = algosdk.mnemonicToSecretKey(mnemonic);

    // 2️⃣ Check balance & prompt to fund if needed
    let accountInfo = await algodClient.accountInformation(account.addr).do();
    const minBalance = 200_000;

    if (accountInfo.amount < minBalance) {
      console.log(`❌ Balance too low (${accountInfo.amount} microAlgos).`);
      await promptToFundAccount(account.addr);
      // Re-check balance after user funds it
      accountInfo = await algodClient.accountInformation(account.addr).do();
      if (accountInfo.amount < minBalance) {
        return res.status(400).json({
          error: 'Still insufficient balance after funding. Please try again.',
        });
      }
    }

    // 3️⃣ Create NFT transaction
    const suggestedParams = await algodClient.getTransactionParams().do();
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      total: 1,
      decimals: 0,
      assetName,
      unitName,
      assetURL,
      manager: account.addr,
      reserve: account.addr,
      freeze: account.addr,
      clawback: account.addr,
      suggestedParams,
    });

    // 4️⃣ Sign and send
    const signedTxn = algosdk.signTransaction(txn, account.sk);
    await algodClient.sendRawTransaction(signedTxn.blob).do();

    // console.log(`🚀 Transaction sent with txId: ${txId}`);

    // 5️⃣ Wait for confirmation (robust)
     const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      signedTxn.txID,
      10
    );

    const assetId = confirmedTxn.assetIndex?.toString() ?? "Not found";


    // 6️⃣ Respond to client
    res.json({
      message: '✅ NFT created successfully!',
      assetId,
      explorerURL: `https://testnet.explorer.perawallet.app/assets/${assetId}`,
    });

  } catch (err) {
    console.error('❌ Error creating NFT:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
