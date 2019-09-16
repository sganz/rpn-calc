# rpn-calc

![hp11c_rpn-calc-sm](https://user-images.githubusercontent.com/5179047/64802172-ed73f900-d53e-11e9-8834-b638c75158d3.jpg)

This is a NodeJS project to build out a bunch of random 'stuff' around the common
RPN (Reverse Polish Notation) Calculator. The idea was to start with basic
calculator functionality as a class and go from that point adding new things as I go.

[GitHub rpn-calc Repository](https://github.com/sganz/rpn-calc)

The project is not designed to be a clone of a HP calculator but a learning tool for picking up
Javascript/Node and surrounding technologies. If you want to try an online version of the HP RPN calculators
here is one -

[HP15C Online Calculator Site](http://hp15c.com)

And the related github project

[GitHub Project for the HP15C Project](https://github.com/ghewgill/hp15c)

Project Docs are generated in the `./docs/index.html` directory

Here is my task list that I would like to do

- Learn more Node/JS
- Build out a rpn calculator service
- build a project structure that makes sense _(NEW 09/16/2019)_
- Add a bunch of HP Calculator functionality like the HP11C as I have one
- TDD/Unit Testing with Jest
- Document code with JSDoc and fancy output with DocStrap like structure to be able to have docs!
- i18n integration for language, possibly numbers
- Winston Logging and log rolling with winston extension
- Sequelize to do user tracking or some such use of a database
- ExpressJS to expose it as a service
- Phase 2 would be build a front end with multiple tools like Vue and React

---

## Pre-requisites

Load up your Node and related development environment. This is all over the interwebs so not going to do that here. This is being developed on a Linux Mint distribution (Ubuntu) but should carry to other environments.

Add any needed packages that may be used specifically for development or the application directly

### Dev Dependencies

Some of these may be installed globally (npm -g option, see specific package for install information)

- eslint
- jest
- jsdoc
- ink-docstrap

### App Dependencies

- i18n-2
- winston
- winston-daily-rotate-file
- express

If something is missing here LQQK in the `package.json` file

> TIP : use the `npm install --save <package_name>` to auto-magically add it into your package.json

---

Here are the current list of scripts that can run and what they do -

- `docs` - Run JSDocs, with enable private tags
- `docstrap` - Run JSDocs with the DocStrap plug in
- `tests` - Run Jest, with coverage report
- more coming soon!

To run these do something like -

> \$ npm run docs
>
> \$ npm run tests

---

The core of the project was stolen from the numerous courseware/bootcamp projects
floating around the web, and mainly just the idea for the basic calculator class.

This project will not be anything expected to be functionally useful other than
learning how to do things.

Feel free to offer suggestions, coding tips, and contribute if you find yourself
having time to waste or want something to do until the next season of Rick and Morty
comes out.

Happy Coding!

[![WTFPL](https://img.shields.io/badge/License-WTFPL-orange.svg)](http://www.wtfpl.net)
