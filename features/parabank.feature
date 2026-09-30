@parabank @e2e
Feature: ParaBank retail banking journeys
  As an online banking customer
  I want to manage my accounts, transfer funds, and pay a bill
  So that common banking journeys work end to end

  Scenario: Sign in and view the API-seeded default account
    Given a ParaBank customer is seeded through the API
    When I sign in to ParaBank as that customer
    Then the ParaBank Accounts Overview should show the seeded account and balance

  Scenario: Open a savings account and verify it in Accounts Overview
    Given a ParaBank customer is seeded through the API
    And I sign in to ParaBank as that customer
    When I open a savings account funded from the seeded account
    Then the new account should appear in Accounts Overview

  Scenario: Transfer funds between own accounts and reconcile balances
    Given a ParaBank customer is seeded through the API
    And I sign in to ParaBank as that customer
    When I transfer "5.00" from the seeded account to another account
    Then the transfer confirmation should be displayed
    And the source and destination balances should reconcile

  Scenario: Pay a bill and reconcile the account debit
    Given a ParaBank customer is seeded through the API
    And I sign in to ParaBank as that customer
    When I pay "7.50" to the "ANZ Electricity" biller
    Then the bill payment confirmation should be displayed
    And the source account balance should reflect the payment
