@web @api
Feature: ACME Demo availability

  Scenario: The demo endpoint is reachable
    Given I check the ACME Demo endpoint
    Then the ACME Demo endpoint should be reachable
