# Forta Perp.Fi Suite

Forta agent suite to monitor Perpetual Finance.

## Description

This agent monitors various aspects of Perpetual Finance (Perp.Fi).  The Perp.Fi suite currently contains
the following handlers:

- account-balance
- admin-events
- failed-transactions
- pending-transactions
- price-spread-ratio
- usdc-balance-change

## Supported Chains

- Ethereum Rinkeby

## Alerts

<!-- -->
- AE-PERPFI-LOW-ACCOUNT-BALANCE
  - Fired when an account in account-addresses.json has a balance lower than the threshold set in agent-config.json
  - Severity is always set to "critical"
  - Type is always set to "degraded"
  - Metadata field contains account name, account balance, and threshold

<!-- -->
- AE-PERPFI-ADMIN-EVENT
  - Fired on any event in admin-events.json
  - Severity is set to the value in admin-events.json
  - Type is set to the value in admin-events.json
  - Metadata field contains contract name, contract address, event name, and event arguments

<!-- -->
- AE-PERPFI-FAILED-TRANSACTIONS
  - Fired when there are more failed transactions than the specified limit within a specified time window
  - Severity is always set to "critical"
  - Type is always set to "info"
  - Metadata field contains Perp.Fi account name, account address, and list of failed transactions

<!-- -->
- AE-PERPFI-HIGH-PENDING-TX
  - Fired when the number of pending transactions for specific Perpetual Finance addresses exceeds a threshold
  - Severity is always set to "critical"
  - Type is always set to "degraded"
  - Metadata field contains Perp.Fi account name, account address, and number of pending transactions

<!-- -->
- AE-PERPFI-PRICE-SPREAD-RATIO
  - Fired when the price spread ratio between the Perpetual Finance price and the FTX price exceed a threshold for a period of time
  - Severity is always set to "critical"
  - Type is always set to "degraded"
  - Metadata field contains Perp.Fi account name, account address, price spread ratio, lower limit, upper limit, time threshold, and time that price has been outside limits


<!-- -->
- AE-PERPFI-USDC-BALANCE-CHANGE
  - Fired when the USDC balance of a contract or account changes by 10% or more within
    approximately 1 minute
  - Severity is always set to "critical"
  - Type is always set to "suspicious"
  - Metadata field contains account/contract address, USDC balance, and percentage change

## Test Data

To run all of the tests for this agent, use the following command: `npm run test`
