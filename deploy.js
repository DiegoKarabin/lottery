const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const mnemonicPhrase = 'decline pony reason plug credit miss setup photo north sense ancient foam'
const provider = new HDWalletProvider({
    mnemonic: {
        phrase: mnemonicPhrase
    },
    providerOrUrl: 'https://rinkeby.infura.io/v3/aa7bd2c1ab904355a230832068c6d7fa'
})
const web3 = new Web3(provider)
const { abi, evm: { bytecode: { object } } } = require('./compile')

const deploy = async () => {
    const accounts = await web3.eth.getAccounts()
    const deployingAccount = accounts[0]

    console.log('Attempting to deploy from account', deployingAccount)

    const result = await new web3.eth.Contract(abi)
        .deploy({ data: object })
        .send({ gas: '1000000', from: deployingAccount })

    console.log('Contract deployed to', result.options.address)
}
deploy()

provider.engine.stop()
