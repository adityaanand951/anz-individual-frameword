@mobile
Feature: ACME Demo mobile smoke

  Scenario: ACME Demo opens in the installed Chrome browser
    Given I open the ACME login page
    Then the login page should be loaded
    And the mobile page title should identify ACME Demo
