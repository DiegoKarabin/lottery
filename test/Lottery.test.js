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

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: testingAccount,
            value: web3.utils.toWei('0.02', 'ether')
        })

        const players = await lottery.methods.getPlayers().call({ from: testingAccount })

        assert.strict(1, players.length)
        assert.strictEqual(testingAccount, players[0])
    })

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        })

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        })

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        })

        const players = await lottery.methods.getPlayers().call({ from: testingAccount })

        assert.strict(3, players.length)
        assert.strictEqual(accounts[0], players[0])
        assert.strictEqual(accounts[1], players[1])
        assert.strictEqual(accounts[2], players[2])
    })

    it('requires a minimum amount of ether', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 200
            })

            assert(false)
        } catch (error) {
            assert.ok(error)
        }
    })

    it('only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({ from: accounts[1] })

            assert(false)
        } catch (error) {
            assert.ok(error)
        }
    })

    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.enter().send({
            from: testingAccount,
            value: web3.utils.toWei('2', 'ether')
        })

        const initialBalance = await web3.eth.getBalance(testingAccount)

        await lottery.methods.pickWinner().send({ from: testingAccount })

        const finalBalance = await web3.eth.getBalance(testingAccount)
        const difference = finalBalance - initialBalance

        assert(difference > web3.utils.toWei('1.8', 'ether'))

        const players = await lottery.methods.getPlayers().call({ from: testingAccount })

        assert.strictEqual(players.length, 0)
    })
})
