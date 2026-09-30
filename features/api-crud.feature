@api
Feature: API CRUD operations

  Scenario: Create, read, update, and delete a post
    Given I have an API client for the JSONPlaceholder service
    When I create a post with title "API CRUD Test" and body "This is a test post"
    Then the create response status should be 201
    And the created post title should be "API CRUD Test"
    When I fetch the existing post with id 1
    Then the fetch response status should be 200
    And the fetched post id should be 1
    When I update the existing post with id 1 using title "Updated API CRUD Test" and body "Updated body"
    Then the update response status should be 200
    And the updated post title should be "Updated API CRUD Test"
    When I delete the existing post with id 1
    Then the delete response status should be 200
