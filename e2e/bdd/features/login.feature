Feature: Login
  As a Kainos employee
  I want to sign in with my email and password
  So that I can access the job roles list

  Scenario Outline: User completes login flow with valid credentials
    Given the user is on the home page
    When the user clicks on the login button
    Then the login page is displayed
    When the user enters the email "test1@example.com"
    And enters the password "Password123!"
    When clicks the login button
    Then the user is logged in and taken to the job-roles page

  Scenario Outline: User fails login flow with invalid credentials
    Given the user is on the home page
    When the user clicks on the login button
    Then the login page is displayed 
    When the user enters the email "<email>"
    And enters the password "<password>"
    When clicks the login button
    Then the user is presented with an invalid credentials message
    Examples:
    |email |password|
    |fake@example.com | Password123!|
    |test1@example.com | Password |
    |fake@example.com | Password |
 