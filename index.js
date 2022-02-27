require('dotenv').config(); 
const axios = require('axios');
const Web3 = require('web3');
const { send } = require("@ayshptk/msngr");

const contractAddress = '0xc6c5F7B1a27528DD6F34EF164377965114bfA7D9';
const abi = [{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_player","type":"address"}],"name":"PlayerSeeksVerification","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_player","type":"address"},{"indexed":true,"internalType":"address","name":"_judge","type":"address"}],"name":"PlayerVerifiedToWin","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"player","type":"address"}],"name":"PlayerWon","type":"event"},{"inputs":[{"internalType":"address","name":"judge","type":"address"}],"name":"addJudge","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getJudges","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"hasBeenVerifiedToWin","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"hasNotWonBefore","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"hasTokens","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"judge","type":"address"}],"name":"isJudge","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"isWinner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"judge","type":"address"}],"name":"removeJudge","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"seekVerification","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"verifyPlayer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"win","outputs":[],"stateMutability":"nonpayable","type":"function"}];

// set up connection to Polygon
const provider = new Web3.providers.WebsocketProvider(process.env.NODE_URL);
const web3 = new Web3(provider);
const contract = new web3.eth.Contract(abi, contractAddress);
const fweb3_api = 'https://fweb3.xyz/api/polygon?wallet_address=';
const webhook = process.env.WEBHOOK_URL;

contract.events.PlayerSeeksVerification().on('data', async event => {
    console.log(event);
    axios.get(fweb3_api + event['returnValues']['_player']).then(async function(res) {
        let won = true;
        for (const [key, value] of Object.entries(res.data)) {
            if (key === "tokenBalance") {
                won = value >= 100;
            } else if (key !== 'hasWonGame' && key !== 'trophyColor') {
                won = value;
            }
            if (!won) {
                console.log(res.data)
                await send(webhook, "Player is seeking verification, but has NOT completed: https://fweb3.xyz/?wallet=" + event['returnValues']['_player'] + '\n');
                break;
            }
        }
        if (won) {
            await send(webhook, "Player is seeking verification, and has completed: https://fweb3.xyz/?wallet=" + event['returnValues']['_player'] + '\n');
        }
    })
})

