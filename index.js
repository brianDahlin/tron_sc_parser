const TronWeb = require("tronweb");
const USDT = require("./USDT.json");
require("dotenv").config();
const PK = process.env.PRIVATE_KEY;

const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  solidityNode: "https://api.trongrid.io",
  eventServer: "https://api.trongrid.io",
  privateKey: PK,
});

const addr = [
  "TTKqYUUeMdKJ4WCAXGeFiSKXUskwU7kRPk",
  "TC5q3NzHmFztvMwSgaFamQ44BUwYz737n1",
  "TJnKsHfWm9V5f5NAVXzWBHWBPtMuM7ozb6",
  "TYffgGWWx9M9AVQxihdUQw6juDrdSesHbU",
  "TRb5XT8WQCoz4K6Q9869x9yVoUTaC6UmzQ",
  "TGYy98cEEVJ6gVJbNaFdyRYpV5Ja9YA2pw",
  "TVveTPqKZfCRQvgcRNoMXuacmJqemwV7ek",
  "TRG2Att7mgUvYJXh3smyoZDXJWLHJo38g2",
  "TJ3j2JaqvzndrofqmniT6w7UxLSM8H25sG",
  "TFRjs9saquU7kdDJZ2F8HmqMzrSaWJDUZe",
  "TUuCGGcB91wKqWR4vfpx1fNCzfoKssCZD4",
  "TQNvqoS8m5T56XwrWnFm6Gx4CoVya4qjui",
  "TG3vYt7w9DWQhA1uSKFVvak3TVqoPabx4K",
];

const balanceHistory = []; // Array to store balance history with timestamps

async function checkBalanceUSDT() {
  //обращаемся к абишнику токену по которому нужно получить result
  const token = await tronWeb.contract(
    USDT.abi,
    "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
  );
  // проходимся циклом по всем контрактам и кладем результат в balance
  let balance = 0;
  for (let i = 0; i < addr.length; i++) {
    let j = await token.balanceOf(addr[i]).call();
    balance += j.toNumber();
    process.stdout.write(
      `Balance of pool with address ${addr[i]} is ${
        (j.toNumber() / 1000000).toLocaleString()
      } USDT\n`
    );
  }

  const timestamp = new Date().getTime(); // Get current timestamp
  balanceHistory.push({ timestamp, balance }); // Store balance with timestamp

  const border = Array(10).fill("*").join("");
  process.stdout.write(`\n${border}\n`);

  process.stdout.write(`Total balance\n`);
  process.stdout.write(`${(balance / 1000000).toLocaleString()} USDT\n`);

  calculateAverageIncreaseRate(); // Calculate and display rolling one-hour window average increase rate

  process.stdout.moveCursor(0, -(addr.length + 5));

  setTimeout(checkBalanceUSDT, 1000);
}

function calculateAverageIncreaseRate() {
  const oneHourAgo = new Date().getTime() - 3600000; // Calculate timestamp of one hour ago
  const relevantBalances = balanceHistory.filter(
    (entry) => entry.timestamp >= oneHourAgo
  ); // Filter balance history for entries within the one-hour window

  if (relevantBalances.length > 1) {
    const totalBalanceIncrease = relevantBalances[relevantBalances.length - 1].balance - relevantBalances[0].balance;
    const timeDifference = relevantBalances[relevantBalances.length - 1].timestamp - relevantBalances[0].timestamp;
    const averageIncreaseRate = totalBalanceIncrease / (timeDifference / 1000) * 3600; // Calculate average increase rate per hour

    const formattedAverageIncreaseRate = (averageIncreaseRate >= 0 ? "+" : "") + (averageIncreaseRate / 1000000).toLocaleString();
    process.stdout.write(`${formattedAverageIncreaseRate} USDT per hour on average\n`);
  }
}

checkBalanceUSDT();
