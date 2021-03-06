// transaction handlers
const adminEvents = require('./admin-events/admin-events');
const failedTransactions = require('./failed-transactions/failed-transactions');

// block handlers
const accountBalance = require('./account-balance/account-balance');
const pendingTransactions = require('./pending-transactions/pending-transactions');
const priceSpreadRatio = require('./price-spread-ratio/price-spread-ratio');
const usdcBalanceChange = require('./usdc-balance-change/usdc-balance-change');

const txHandlers = [
  adminEvents,
  failedTransactions,
];

const blockHandlers = [
  accountBalance,
  pendingTransactions,
  priceSpreadRatio,
  usdcBalanceChange,
];

// returns findings over all txHandler's handleTransaction functions
function provideHandleTransaction(agents) {
  return async function handleTransaction(txEvent) {
    const findings = (
      await Promise.all(
        agents.map((agent) => agent.handleTransaction(txEvent)),
      )
    ).flat();

    return findings;
  };
}

// returns findings over all blockHandler's handleBlock functions
function provideHandleBlock(agents) {
  return async function handleBlock(blockEvent) {
    const findings = (
      await Promise.all(
        agents.map((agent) => agent.handleBlock(blockEvent)),
      )
    ).flat();

    return findings;
  };
}

// returns a promise of all the async initialize calls
function provideInitialize(agents) {
  return async function initialize() {
    return Promise.all(agents.map(async (agent) => {
      if (typeof agent.initialize === 'function') {
        return agent.initialize();
      }
      return Promise.resolve();
    }));
  };
}

module.exports = {
  provideInitialize,
  initialize: provideInitialize([...txHandlers, ...blockHandlers]),
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(txHandlers),
  provideHandleBlock,
  handleBlock: provideHandleBlock(blockHandlers),
};
