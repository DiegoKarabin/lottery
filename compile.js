const path = require('path')
const fs = require('fs')
const solc = require('solc')

const filename = 'Lottery.sol'
const lotteryPath = path.resolve(__dirname, 'contracts', filename)
const source = fs.readFileSync(lotteryPath, 'utf8')

const input = {
    language: 'Solidity',
    sources: {
        'Lottery.sol': {
            content: source
        }
    },
    settings: {
        optimizer: {
            enabled: true
        },
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
}

module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts[filename].Lottery
