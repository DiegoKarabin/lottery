const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const web3 = new Web3(ganache.provider())
const { abi, evm: { bytecode: { object } } } = require('../compile')

let accounts, testingAccount, lottery

beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts()

    testingAccount = accounts[0]

    // Use one of those accounts to deploy the contract
    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: object })
        .send({ from: testingAccount, gas: '1000000' })
})

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address)
    })
})
