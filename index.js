require('dotenv').config(); 
const Web3 = require('web3');
const Discord = require('discord.js'); 

const contractAddress = '0xc6c5F7B1a27528DD6F34EF164377965114bfA7D9';
const abi = [{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_player","type":"address"}],"name":"PlayerSeeksVerification","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_player","type":"address"},{"indexed":true,"internalType":"address","name":"_judge","type":"address"}],"name":"PlayerVerifiedToWin","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"player","type":"address"}],"name":"PlayerWon","type":"event"},{"inputs":[{"internalType":"address","name":"judge","type":"address"}],"name":"addJudge","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getJudges","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"hasBeenVerifiedToWin","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"hasNotWonBefore","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"hasTokens","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"judge","type":"address"}],"name":"isJudge","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"isWinner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"judge","type":"address"}],"name":"removeJudge","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"seekVerification","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"verifyPlayer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"win","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const client = new Discord.Client({intents: ['GUILDS', 'GUILD_MESSAGES']});
// log in the bot
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// set up connection to Polygon
const provider = new Web3.providers.WebsocketProvider(process.env.NODE_URL);
const web3 = new Web3(provider);
const contract = new web3.eth.Contract(abi, contractAddress);

// nonsense function to keep dyno alive
async function getMeme(){
    const res = await axios.get('https://memeapi.pythonanywhere.com/');
    return res.data.memes[0].url;
}

const options = {
    fromBlock: 25330221
}

let interval;

client.on('messageCreate', async msg => {
    switch (msg.content) {
        case "!connect-seek-verify":
            msg.channel.send("You are now subscribed to notifications of verification requests.");

            contract.events.PlayerSeeksVerification(options)
                .on('data', event => {
                    console.log(event);
                    msg.channel.send("Player is seeking verification: https://fweb3.xyz/?wallet=" + event['returnValues']['_player']);
                })
                .on('changed', changed => console.log(changed))
                .on('error', err => console.log(err))
                .on('connected', str => console.log(str))

            interval = setInterval (function () {
                getMeme()
            }, 30000);
            break;
        case "!connect-verified":
            msg.channel.send("You are now subscribed to notifications of successful verifications.");

            contract.events.PlayerVerifiedToWin(options)
                .on('data', event => {
                    console.log(event);
                    msg.channel.send("Player " + event['returnValues']['_player'] + " has been verified by " + event['returnValues']['_judge']);
                })
                .on('changed', changed => console.log(changed))
                .on('error', err => console.log(err))
                .on('connected', str => console.log(str))
            break;
        case "!connect-winners":
            msg.channel.send("You are now subscribed to notifications of new winners.");

            contract.events.PlayerWon(options)
                .on('data', event => {
                    console.log(event);
                    msg.channel.send("Player " + event['returnValues']['_player'] + " has won!!!");
                })
                .on('changed', changed => console.log(changed))
                .on('error', err => console.log(err))
                .on('connected', str => console.log(str))
            break;
        case "!stop":
            msg.channel.send("Notifications are stopping. It may take a while to fully shut down.")
            clearInterval(interval);
    }
})


//make sure this line is the last line
client.login(process.env.DISCORD_CLIENT_TOKEN); 

