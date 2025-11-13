# UpdatedPersonalWebsite

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running ESLint

Historically, Angular used TSLint, but this has now been deprecated. This project now uses ESLint with the Angular ESLint plugin. 

### Setup

First, install Angular ESLint with the following command: 
```bash
ng add @angular-eslint/schematics
```
This will: 
* Install `eslint` and `@angular-eslint/*` packages. 
* Replace old TSLint configurations (if any exist) with ESLint equivalent configurations.
* Update the `angular.json` to work with the `ng lint` command. 

If not added by default, make sure to add in the `package.json` file, 
```json
"scripts": {
  "lint": "ng lint"
}
```

### Usage

After setup, the linter can be ran by simply using the command: 
```bash
npm run lint
```
### Configuration

The linter may be further customized in the `eslint.config.js` file. 

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Running GitHub Actions Locally with Nektos Act

You can simulate and run your GitHub Actions workflows locally using the open-source tool [nektos/act](https://github.com/nektos/act).
.
This is particularly useful for testing your workflow files (`.github/workflows/*.yml`) before pushing changes to GitHub.

### Installation

To install `act` on Linux using the official install script, run:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```


This will install the `act` binary under a local directory such as .`/bin/act`.

You can verify the installation by running:

```bash
./bin/act --version
```

### Usage

From the root directory of your project (where your `.github/workflows` folder resides), you can simulate GitHub Actions events.

For example, to run a workflow triggered by a `pull_request` event, use:

```bash
./bin/act pull_request
```

By default, `act` looks for a matching workflow file that listens for the specified event. It will then execute the defined jobs locally using Docker containers.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

For more information regarding `nektos/act`: 
* GitHub Project: https://github.com/nektos/act

* Usage Documentation: https://nektosact.com

* Troubleshooting tip: Ensure Docker is running on your system before using `act`, as it executes workflows inside containerized environments.
