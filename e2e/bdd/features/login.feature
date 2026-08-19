Feature: Login
  As a Kainos employee
  I want to sign in with my email and password
  So that I can access the job roles list

  Scenario: User completes login flow with valid credentials
    Given the user is on the home page
    When the user clicks on the login button
    Then the login page is displayed
    When the user enters the email "test1@example.com"
    And enters the password "Password123!"
    Then clicks the login button
    Then the user is logged in and taken to the job-roles page