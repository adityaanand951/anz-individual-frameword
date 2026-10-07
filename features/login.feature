@web @mobile @functional
Feature: ACME Demo login

  Background:
    Given I open the ACME login page

  Scenario: A valid user signs in
    When I sign in with the valid user credentials
    Then I should be on the dashboard
    And the dashboard should be loaded

  Scenario: The login page exposes usable form controls
    Then the login page should be loaded
    And the password field should be masked
    And the sign in control should be enabled

  Scenario: Remember Me can be selected
    When I select Remember Me
    Then Remember Me should be selected

  Scenario: Remember Me can be cleared
    When I select Remember Me
    And I clear Remember Me
    Then Remember Me should not be selected

  Scenario: The dashboard shows the financial overview
    When I sign in with the valid user credentials
    Then the dashboard financial overview should be visible

  Scenario: The dashboard shows recent transactions
    When I sign in with the valid user credentials
    Then recent transactions should be visible
    And there should be at least 5 transactions

  Scenario: A known transaction is displayed
    When I sign in with the valid user credentials
    Then the transaction "Starbucks coffee" should be displayed

  Scenario: The dashboard search accepts text
    When I sign in with the valid user credentials
    And I search for "coffee"
    Then the dashboard search should contain "coffee"

  Scenario Outline: Dashboard quick actions are available
    When I sign in with the valid user credentials
    Then the "<action>" quick action should be visible

    Examples:
      | action         |
      | Add Account    |
      | Make Payment   |

  Scenario Outline: Card and lending navigation is available
    When I sign in with the valid user credentials
    Then the "<link>" sidebar link should be visible

    Examples:
      | link          |
      | Credit cards  |
      | Debit cards   |
      | Loans         |
      | Mortgages     |
