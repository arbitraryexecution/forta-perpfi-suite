const {
  Finding, FindingSeverity, FindingType,
} = require('forta-agent');

// addresses we are interested in monitoring
const contractAddresses = require('../../account-addresses.json');
const config = require('../../agent-config.json');

const initializeData = {};

// formats provided data into a Forta alert
function createAlert(name, address, failedTxs, blockWindow, everestId) {
  return Finding.fromObject({
    name: 'Failed transactions alert',
    description: `${name} has sent ${failedTxs.length} failed transactions `
    + `in the past ${blockWindow} blocks`,
    protocol: 'Perp.Fi',
    alertId: 'AE-PERP.FI-FAILED-TRANSACTIONS',
    severity: FindingSeverity.Medium,
    type: FindingType.Info,
    everestId,
    metadata: {
      name,
      address,
      failedTxs,
    },
  });
}

function provideHandleTransaction(data) {
  return async function handleTransaction(txEvent) {
    const findings = [];
    const {
      blockWindow, everestId, addresses, failedTxs, failedTxLimit,
    } = data;

    // we are only interested with failed transactions
    if (txEvent.receipt.status) {
      return findings;
    }

    // check each watched address to see if it failed
    Object.entries(addresses).forEach(([name, address]) => {
      // skip addresses we are not interested in
      if (txEvent.from !== address) return;

      // add new occurance
      failedTxs[name][txEvent.hash] = txEvent.blockNumber;

      // filter out occurences older than blockWindow
      Object.entries(failedTxs[name]).forEach(([hash, blockNumber]) => {
        if (blockNumber < txEvent.blockNumber - blockWindow) delete failedTxs[name][hash];
      });

      // create finding if there are too many failed txs
      if (Object.keys(failedTxs[name]).length >= failedTxLimit) {
        findings.push(
          createAlert(name, address, Object.keys(failedTxs[name]), blockWindow, everestId),
        );
      }
    });
    return findings;
  };
}

function provideInitialize(data) {
  return async function initialize() {
    /* eslint-disable no-param-reassign */
    data.addresses = {};
    data.failedTxs = {};

    // add all addresses we will watch as lower case and initialize failed tx object
    Object.entries(contractAddresses).forEach(([name, address]) => {
      data.addresses[name] = address.toLowerCase();
      data.failedTxs[name] = {};
    });

    // assign configurable fields
    Object.assign(data, config.failedTransactions);
    data.blockWindow = config.failedTransactions.blockWindow;
    data.failedTxLimit = config.failedTransactions.failedTxLimit;
    data.everestId = config.perpfiEverestId;
    /* eslint-enable no-param-reassign */
  };
}

module.exports = {
  provideInitialize,
  initialize: provideInitialize(initializeData),
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(initializeData),
  createAlert,
};