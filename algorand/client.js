const algosdk = require('algosdk');

function getAlgodClient() {
  const algodToken = "";
  const algodServer = "https://testnet-api.algonode.cloud";
  const algodPort = "";
  return new algosdk.Algodv2(algodToken, algodServer, algodPort);
}

module.exports = { getAlgodClient, algosdk };
