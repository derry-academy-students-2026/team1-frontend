Feature: View job role specification
  As an applicant
  I want to find job specification information about each role
  So that I know what is expected for each role

  Scenario: Applicant views the specification for a job role
    Given the user is logged in and on the job roles page
    When the user clicks on the job role name "Software Engineer"
    Then the job role specification page is displayed
    And the page shows the role title "Software Engineer"
    And the page shows the specification content for that role

  Scenario: Applicant returns from the specification page to the list
    Given the user is on the specification page for "Software Engineer"
    When the user clicks the back link
    Then the user is taken back to the job roles page
