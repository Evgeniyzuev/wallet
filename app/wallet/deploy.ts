import { beginCell, Cell, Address, toNano } from '@ton/core';
import { TonClient } from '@ton/ton';
import path from 'path';
import fs from 'fs';

// Get the directory name from the current module's URL
// const __filename = new URL(import.meta.url).pathname;
// const __dirname = path.dirname(__filename);

// Read contract code from file
const contractCode = Cell.fromBoc(
    fs.readFileSync('D:/AI/wallet2/wallet/app/wallet/ToncoinUsdContract.fc.cell')
)[0];
const ownerAddress = Address.parse(process.env.NEXT_PUBLIC_DESTINATION_ADDRESS ?? '');

// Create initial data cell
const dataCell = beginCell()
    .storeAddress(ownerAddress)  // owner address
    .storeDict(null)            // empty users dictionary
    .storeCoins(0)             // initial TON price
    .endCell();

// Create state init
const stateInit = beginCell()
    .storeBit(0)               // No split_depth
    .storeBit(0)               // No special
    .storeBit(1)               // We have code
    .storeRef(contractCode)
    .storeBit(1)               // We have data
    .storeRef(dataCell)
    .storeBit(0)               // No library
    .endCell();

// Calculate contract address
const contractAddress = new Address(0, stateInit.hash());
console.log(`Contract address: ${contractAddress.toString()}`);

// Create deployment message
const deployMessage = beginCell()
    .storeUint(0, 32)              // Initial message with op = 0
    .storeStringTail('Deploy')     // Comment
    .endCell();

// Create external message for deployment
const externalMessage = beginCell()
    .storeUint(0b10, 2)  // indicate that it is an incoming external message
    .storeUint(0, 2)     // src -> addr_none
    .storeAddress(contractAddress)
    .storeCoins(0)       // Import fee
    .storeBit(1)         // We have State Init
    .storeBit(1)         // We store State Init as a reference
    .storeRef(stateInit) // Store State Init as a reference
    .storeBit(1)         // We store Message Body as a reference
    .storeRef(deployMessage) // Store Message Body as a reference
    .endCell();

// Connect to TON
const client = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
    apiKey: process.env.NEXT_PUBLIC_MAINNET_TONCENTER_API_KEY
});

async function deployContract() {
    try {
        // Send the deployment message
        await client.sendFile(externalMessage.toBoc());
        console.log('Contract deployed successfully');
        
        // Save contract address to .env
        console.log('Updating NEXT_PUBLIC_DESTINATION_ADDRESS in .env...');
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const updatedEnvContent = envContent.replace(
            /NEXT_PUBLIC_DESTINATION_ADDRESS=.*/,
            `NEXT_PUBLIC_DESTINATION_ADDRESS=${contractAddress.toString()}`
        );
        fs.writeFileSync(envPath, updatedEnvContent);
    } catch (error) {
        console.error('Error deploying contract:', error);
        throw error;
    }
}

deployContract().catch(console.error);