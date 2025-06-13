📄 NFT_Create_API
An Express.js API to:

✅ Create user Algorand accounts and store them in PostgreSQL

✅ Prompt user to fund accounts

✅ Mint NFTs on Algorand Testnet tied to a user’s email

✅ Test easily with Postman

📂 Project Structure
plaintext
Copy
Edit
NFT_Create_API/
├── algorand/
│   └── client.js         # Algorand client config & SDK helper
├── routes/
│   ├── accountRoutes.js  # Routes for account creation & listing
│   └── nftRoutes.js      # Routes for NFT minting
├── db.js                 # PostgreSQL connection setup
├── index.js              # Express server entry point
├── .env                  # Environment variables (create manually)
├── package.json
└── README.md             # 📌 You are here!
⚙️ Setup Instructions
1️⃣ Clone Repo
bash
Copy
Edit
git clone <your-repo-url>
cd NFT_Create_API
2️⃣ Install Dependencies
bash
Copy
Edit
npm install
3️⃣ Create .env
Create a .env file in root with your DB & Algorand config:
Example:

env
Copy
Edit
PORT=3000
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<your_db_name>
ALGOD_TOKEN=<your_algod_api_key>
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=""
✅ Tip: For Testnet, you can use public Algonode or PureStake.

4️⃣ Run the Server
bash
Copy
Edit
node index.js
You’ll see:

sql
Copy
Edit
✅ Server running at http://localhost:3000
✅ Table 'accounts' ready.
🗂️ API Endpoints
🔑 1) Create Account
POST /api/create-account

Field	Type	Required
name	string	✅
email	string	✅
occupation	string	✅

Example JSON:

json
Copy
Edit
{
  "name": "Alice",
  "email": "alice@example.com",
  "occupation": "Developer"
}
Response:

json
Copy
Edit
{
  "message": "Account created successfully",
  "address": "<algorand_address>"
}
🧾 2) List Accounts
GET /api/accounts

Returns all registered accounts with no sensitive mnemonic.

🎨 3) Create NFT
POST /api/create-nft

Field	Type	Required
email	string	✅
assetName	string	✅
unitName	string	✅
assetURL	string	✅

Example JSON:

json
Copy
Edit
{
  "email": "alice@example.com",
  "assetName": "MyNFT",
  "unitName": "MYNFT",
  "assetURL": "https://example.com/my-nft.json"
}
Behavior:

Checks account balance.

Prompts you in the terminal to fund account if needed (via faucet).

Waits for your confirmation.

Mints NFT on Algorand Testnet.

Response:

json
Copy
Edit
{
  "message": "✅ NFT created successfully!",
  "assetId": 12345678,
  "explorerURL": "https://testnet.explorer.perawallet.app/assets/12345678"
}
🧪 Testing
Use Postman to test each route.

Fund generated accounts using Testnet Faucet.

Watch the server logs for prompts and confirmations.

✅ Notes
This project uses Algorand Testnet only.

Accounts are stored securely in PostgreSQL with mnemonic (handle securely in production).

For production, never expose mnemonics — use secure vaults or hardware wallets.

Make sure your DB has the accounts table:

sql
Copy
Edit
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  occupation VARCHAR(255),
  address VARCHAR(255),
  mnemonic TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
💡 Contributing
PRs are welcome! Feel free to fork & improve:

Add unit tests

Add multi-account support

Switch to KMD wallet or Pera for signing

📜 License
MIT — free to use, modify, and share.

🚀 Happy Minting!
🔗 Questions?

Algorand Docs: developer.algorand.org

Algorand Discord: Join here
