# Puppeteer Introduction

Created by: Timothy Quirk

In this repository you will find a node.js application built on [Puppeteer](https://github.com/puppeteer/puppeteer).

## Instructions for use

1. After cloning this repository from GitHub, switch into your newly cloned folder.

2. Install the necessary dependencies with `npm install`.

3. You will need to create a .env file and add the variables `GITHUB_LOGIN` and `GITHUB_PASS` so that you will be securely use credentials to login to a GitHub account. Verify that you have .gitignore file that lists your .env file.

4. You may run the a headless version of the application with `npm run headless`, otherwise you may start the application with an `npm start`.

## Additional features/enhancements that could be added

- Jest unit tests
- Modularize code by adding file structure and giving each function its own .js file
- Save returned data to a specific file for validation and/or furture use
- Add more robust error handling in the event searched page structures were to change at all

## Technical Specs

This project utilizes the following technologies:

1. Node.js
2. Puppeteer
3. Dotenv
