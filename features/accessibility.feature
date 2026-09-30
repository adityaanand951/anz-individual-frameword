@web @accessibility
Feature: ACME Demo login accessibility

  Scenario: The login form exposes usable controls
    Given I open the ACME login page
    Then the login page should be loaded
    And the username field should have an accessible identifier
    And the password field should be masked
    And the sign in control should be enabled
