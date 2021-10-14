const ethers = require('ethers');
const {
  getJsonRpcUrl, Finding, FindingSeverity, FindingType,
} = require('forta-agent');

const accountAddressesData = require('../../account-addresses.json');
const { PERPFI_EVEREST_ID, accountBalance: accountData } = require('../../agent-config.json');

// Stores information about each account
const initializeData = {};

// Initializes data required for handler
function provideInitialize(data) {
  return async function initialize() {
    /* eslint-disable no-param-reassign */
    data.accountThresholds = accountData;
    data.accountAddresses = accountAddressesData;
    data.accountNames = Object.keys(data.accountThresholds);
    data.provider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl());
    /* eslint-enable no-param-reassign */
  };
}

// helper function to create alerts
function createAlert(accountName, accountBalance, thresholdEth) {
  const threshold = ethers.utils.parseEther(thresholdEth.toString());
  return Finding.fromObject({
    name: 'Perp.Fi Low Account Balance',
    description: `The ${accountName} account has a balance below ${thresholdEth} ETH`,
    alertId: 'AE-PERPFI-LOW-ACCOUNT-BALANCE',
    severity: FindingSeverity.Medium,
    type: FindingType.Degraded,
    protocol: 'Perp.Fi',
    everestId: PERPFI_EVEREST_ID,
    metadata: {
      accountName,
      accountBalance: accountBalance.toString(),
      threshold: threshold.toString(),
    },
  });
}

function provideHandleBlock(data) {
  return async function handleBlock() {
    const findings = [];
    const {
      accountThresholds, accountAddresses, accountNames, provider,
    } = data;
    if (!accountThresholds) {
      throw new Error('handleBlock called before initialization');
    }

    await Promise.all(accountNames.map(async (accountName) => {
      const accountBalance = await provider.getBalance(accountAddresses[accountName]);

      // If balance < threshold add an alert to the findings
      if (accountBalance < (accountThresholds[accountName] * 1000000000000000000)) {
        findings.push(createAlert(accountName, accountBalance, accountThresholds[accountName]));
      }
    }));

    return findings;
  };
}

// exports
module.exports = {
  createAlert,
  provideHandleBlock,
  handleBlock: provideHandleBlock(initializeData),
  provideInitialize,
  initialize: provideInitialize(initializeData),
};
