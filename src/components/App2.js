import { Tabs, Tab } from 'react-bootstrap'
import ECoin from '../abis/eCoin.json'
import React, { useEffect, useState } from 'react';
import Token from '../abis/Token.json'
import eCoinPng from '../dbank.png';
import Web3 from 'web3';
import './App.css';

const deposit = async (amount, eCoin, account) => {
    if (eCoin !== undefined) {
        try {
            await eCoin.methods.deposit().send({ value: amount.toString(), from: account })
        } catch (e) {
            console.log('Error, deposit: ', e)
        }
    }
}

const withdraw = async (e, eCoin, account) => {
    e.preventDefault()

    if (eCoin !== undefined) {
        try {
            await eCoin.methods.withdraw().send({ from: account })
        } catch(e) {
            console.log('Error, withdraw: ', e)
        }
    }
}

const borrow = async (amount, eCoin, account) => {
    if (eCoin !== undefined) {
        try {
            await eCoin.methods.borrow().send({ value: amount.toString(), from: account})
        } catch(e) {
            console.log('Error, borrow: ', e)
        }
    }
}

const payOff = async (e, eCoin, account, token, eCoinAddress) => {
    e.preventDefault()

    if (eCoin !== undefined) {
        try {
            const collateralEther = await eCoin.methods.collateralEther(account).call({from: account})
            const tokenBorrowed = collateralEther/2
            await token.methods.approve(eCoinAddress, tokenBorrowed.toString()).send({from: account})
            await eCoin.methods.payOff().send({from: account})
        } catch(e) {
            console.log('Error, pay off: ', e)
        }
    }
}

const App = () => {
    const [web3, setWeb3] = useState(undefined)
    const [account, setAccount] = useState('')
    const [token, setToken] = useState(null)
    const [eCoin, setECoin] = useState(null)
    const [balance, setBalance] = useState(0)
    const [eCoinAddress, setECoinAddress] = useState(null)

    useEffect(() => {
        loadBlockchainData()
    }, [])

    const loadBlockchainData = async () => {
        if (typeof window.ethereum!=='undefined') {
            const web3 = new Web3(window.ethereum)
            const netId = await web3.eth.net.getId()
            const accounts = await web3.eth.getAccounts()
          console.log(web3)
          console.log(netId)
          console.log(accounts)
            //load balance
            if(typeof accounts[0] !=='undefined'){
            const balance = await web3.eth.getBalance(accounts[0])
            setAccount(accounts[0])
            setBalance(balance)
            setWeb3(web3)
            } else {
            window.alert('Please login with MetaMask')
            }

            //load contracts
            try {
            const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
            const eCoin = new web3.eth.Contract(ECoin.abi, ECoin.networks[netId].address)
            const eCoinAddress = eCoin.networks[netId].address
            setToken(token)
            setECoin(eCoin)
            setECoinAddress(eCoinAddress)
            } catch (e) {
            console.log('Error', e)
            window.alert('Contracts not deployed to the current network')
            }

        } else {
            window.alert('Please install MetaMask')
        }
    }

    return (
        <div className='text-monospace'>
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
            <a
                className="navbar-brand col-sm-3 col-md-2 mr-0"
                href="http://www.dappuniversity.com/bootcamp"
                target="_blank"
                rel="noopener noreferrer"
            >
            <img src={eCoinPng} className="App-logo" alt="logo" height="32"/>
            <b>d₿ank</b>
            </a>
            </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Welcome to d₿ank</h1>
          <h2>{account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                <Tab eventKey="deposit" title="Deposit">
                  <div>
                  <br></br>
                    How much do you want to deposit?
                    <br></br>
                    (min. amount is 0.01 ETH)
                    <br></br>
                    (1 deposit is possible at the time)
                    <br></br>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = e.target.value
                      amount = amount * 10**18 //convert to wei
                      deposit(amount, eCoin, account)
                    }}>
                      <div className='form-group mr-sm-2'>
                      <br></br>
                        <input
                          id='depositAmount'
                          step="0.01"
                          type='number'
                          className="form-control form-control-md"
                          placeholder='amount...'
                          required />
                      </div>
                      <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                    </form>

                  </div>
                </Tab>
                <Tab eventKey="withdraw" title="Withdraw">
                  <br></br>
                    Do you want to withdraw + take interest?
                    <br></br>
                    <br></br>
                  <div>
                    <button type='submit' className='btn btn-primary' onClick={(e) => withdraw(e, eCoin, account)}>WITHDRAW</button>
                  </div>
                </Tab>
                <Tab eventKey="borrow" title="Borrow">
                  <div>

                  <br></br>
                    Do you want to borrow tokens?
                    <br></br>
                    (You'll get 50% of collateral, in Tokens)
                    <br></br>
                    Type collateral amount (in ETH)
                    <br></br>
                    <br></br>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = e.target.value
                      amount = amount * 10 **18 //convert to wei
                      borrow(amount, eCoin, account)
                    }}>
                      <div className='form-group mr-sm-2'>
                        <input
                          id='borrowAmount'
                          step="0.01"
                          type='number'
                          className="form-control form-control-md"
                          placeholder='amount...'
                          required />
                      </div>
                      <button type='submit' className='btn btn-primary'>BORROW</button>
                    </form>
                  </div>
                </Tab>
                <Tab eventKey="payOff" title="Payoff">
                  <div>
                  <br></br>
                    Do you want to payoff the loan?
                    <br></br>
                    (You'll receive your collateral - fee)
                    <br></br>
                    <br></br>
                    <button type='submit' className='btn btn-primary' onClick={(e) => payOff(e, eCoin, account, token, eCoinAddress)}>PAYOFF</button>
                  </div>
                </Tab>
              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
}

export default App;