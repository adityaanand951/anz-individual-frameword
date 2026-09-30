@web @visual
Feature: ACME Demo dashboard visual appearance

  Scenario: The dashboard matches the approved baseline
    Given I open the ACME login page
    When I sign in with username "user@example.com" and password "password"
    Then the dashboard should match the visual baseline
