# get-dotenv Child CLI

This repository demonstrates how to leverage the rich feature set of the [`get-dotenv`](https://github.com/karmaniverous/get-dotenv) CLI within your own project.

This is a template repository based on my [TypeScript NPM Package Template](https://github.com/karmaniverous/npm-package-template-ts), so if you are starting from scratch, [cloning this template](https://github.com/new?template_name=npm-package-template-ts) is a great place to start!

## Why?

Good code is configuration-driven. A simple and effective way to manage configuration is to use environment variables managed in dotenv files that look like this:

```
FEE=fie
FOE=fum
```

When we need to manage different configurations for multiple environments, this can rapidly get out of hand... especially when some of our configurations are secrets that should never be pushed to a code repository!

[`get-dotenv`](https://github.com/karmaniverous/get-dotenv) solves this problem by allowing you to segregate your variables into multiple dotenv files can be loaded into `process.env` as required. It even supports the dynamic generation or overriding of environment variables based on your own logic!

`get-dotenv` also provides an extensible CLI that allows you to do the same thing from the command line. This enables all kinds of powerful automation and orchestration scenarios.

This repository demonstrates how to extend the `get-dotenv` CLI with new commands that wrap functions from your own project.

## Getting Started

To get started, clone this repository and run `npm install`.

The basic structure of the repository mirrors my [TypeScript NPM Package Template](https://github.com/karmaniverous/npm-package-template-ts). See that README for more info.

Find the following files:

```
└─ get-dotenv-child
   ├─ .env.local.template
   └─ environments
      ├─ .env.dev.local.template
      └─ .env.test.local.template
```

Copy each of these files and remove the `.template` extension from the copy. You should now have:

```
└─ get-dotenv-child
   ├─ .env.local
   ├─ .env.local.template
   └─ environments
      ├─ .env.dev.local
      ├─ .env.dev.local.template
      └─ .env.test.local
      └─ .env.test.local.template
```

The resulting `.local` files contain "secrets" for the purpose of this demo, and are gitignored.

P.S. Like those neat directory trees? Try [`dirtree`](https://github.com/karmaniverous/dirtree)!

## A Quick Demo

The [TypeScript NPM Package Template](https://github.com/karmaniverous/npm-package-template-ts) exposes a single function `foo` that logs a message to the console.

This repository extends the base `get-dotenv` CLI with a new command `foo` that calls the `foo` function from the template.

To see this in action, run the following commands:

```bash
# Builds the project.
npm run build

# Creates a local symlink so you can call the CLI without extra gymnastics.
npm link

# Display the CLI help.
getdotenvchild -h
```

You'll see that the base CLI offers a _lot_ of options for managing environment variables. At the bottom, you'll see this:

```
Commands:
  cmd                                 execute shell command string (default command)
  foo [options]                       Wraps the foo function into a CLI command.
  help [command]                      display help for command
```

Now run these commands:

```bash
getdotenvchild foo
# foo global public

getdotenvchild -e dev foo
# foo dev public

getdotenvchild -e test foo
# foo test public

getdotenvchild foo -t '$SECRET'
# foo test secret
```

The first three commands pulled the a default environment variable (`PUBLIC`) from different contexts and passed it to the `foo` function. The last command overrode the default input with a secret value (the `SECRET` variable).

You aren't just restricted to custom commands. You can also use the base CLI to execute any shell command. For example:

```bash
getdotenvchild -e dev cmd echo %DYNAMIC%
# dynamic dev public (a dynamically generated variable, more on that later)

# cmd is the default command, so you can also just...
getdotenvchild -e dev echo %DYNAMIC%
# dynamic dev public
```

Finally, an NPM script may need to do something on whatever environment is passed into it. You'll have to pass the environment _after_ the script invocation, so the syntax above won't work. Instead, you can use the `-c` flag to pass a command string:

```bash
getdotenvchild -c "echo %DYNAMIC%" -e dev
# dynamic dev public
```

You would then articulate your script in `package.json` like this:

```json
{
  "scripts": {
    "foo": "getdotenvchild -c \"echo %DYNAMIC%\""
  }
}
```

... and you'd execute it like this:

```bash
npm run foo -- -e dev   # on windows
npm run foo --- -e dev  # on linux
```

But if you are _really_ smart, you'll install [`@antfu/ni`](https://www.npmjs.com/package/@antfu/ni), which eliminates all kinds of cross-platform nonsense, and you can just do this:

```bash
nr foo -e dev
```

## Under The Hood

All the activity described above is driven by the following files:

```
└─ get-dotenv-child
   ├─ .env
   ├─ .env.dynamic.js
   ├─ .env.local
   ├─ environments
   │  ├─ .env.dev
   │  ├─ .env.dev.local
   │  ├─ .env.test
   │  └─ .env.test.local
   ├─ getdotenv.config.json
   └─ src
      ├─ cli
         └─ getdotenvchild
            ├─ fooCommand.ts
            └─ index.ts
```

### dotenv Files

All of the files beginning with `.env` are dotenv files that look like this:

```
FEE=fie
FOE=fum
```

`.env` comtains global public variables that apply to all environment and may be pushed to the git repository.

Those ending in `.local` contain secrets and should not be pushed to the git repository. This is supported by an entry in [`.gitignore`](./.gitignore).

Those with an environment name following `.env` (e.g. `.env.dev`, `env.dev.local`) contain environment-specific values, which augment or override any defined in the global files.

These files may have a different naming convention and be located in any directory; this is specified in the [Options](#options) section below.

### CLI Code

The structure of the CLI and its package configuration follows the same conventions as the underlying template; see [that documentation](https://github.com/karmaniverous/npm-package-template-ts?tab=readme-ov-file#cli-generation) for more info.

The difference here is that this project's CLI uses the `get-dotenv` CLI as its base and extends it with a new command, `foo`.

The plumbing requires some familiarity with the [`commander`](https://www.npmjs.com/package/commander) library but is otherwise _very_ simple. It is fully explained in the comments on two source files in the [`src/cli` directory](./src/cli/).

See [Positional & Passthrough Options](#positional--passthrough-options) below for one key gotcha.

### Configuration

There are really three sets of options at work here:

- The [`GetDotenvOptions`](https://github.com/karmaniverous/get-dotenv/blob/main/src/GetDotenvOptions.ts) object passed to `getDotenv` that tells the engine what to load and how. Unless you are calling `getDotenv` programmatically, you don't need to worry about this.

- The [`GetDotenvCliGenerateOptions](https://github.com/karmaniverous/get-dotenv/blob/af562295f4d6867afb46e7a86870ced03d2f9c46/src/generateGetDotenvCli.ts#L38-L55) object passed to your CLI that sets the default configuration for the `getDotenv` options object and also some other stuff. See below for more info.

- The options passed to the CLI at the command line, which can override many the options set above. We'll cover these below as well.

Default options for your CLI can be set in three places, in reverse order of precedence:

- A `getdotenv.config.json` file in the root of your CLI project. Think of these as the _global_ defaults for your CLI. They ship with your package and are the same for everyone.

- Arguments passed to the `generateGetDotenvCli` function in your CLI's [`index.ts`](./src/cli/getdotenvchild/index.ts) file. These _can_ override values from your global `getdotenv.config.json` file, but the main purpose is to define any `logger` object and `preHook` or `postHook` functions, which won't fit in a JSON file.

- When your CLI is installed in another project, the author can override your CLI defaults (except for the `logger`, `preHook`, and `postHook` functions) setting options in a local `getdotenv.config.json` file.

As described in [A Quick Demo](#a-quick-demo), your CLI can execute arbitrary shell commands, and can thus call itself. When you do this, any options set and variables loaded by the the parent instance are passed down to the child instance.

#### Options

| Option                  | Type                                                                                                                                                            | Description                                                                                                                                       | Set Where?                                                                                                  | Default Value |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------- |
| `alias`                 | `string`                                                                                                                                                        | Cli alias. Should align with the `bin` property in `package.json`.                                                                                | `getdotenv.config.json`<br>`generateGetDotenvCli`                                                           | `'getdotenv'` |
| `debug`                 | `boolean \| undefined`                                                                                                                                          | Logs CLI internals when true.                                                                                                                     | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`-d, --debug`<br>`-D, --debug-off`                     | `undefined`   |
| `defaultEnv`            | `string \| undefined`                                                                                                                                           | Default target environment (used if `env` is not provided).                                                                                       | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`--default-env <string>`                               | `undefined`   |
| `description`           | `string`                                                                                                                                                        | Cli description (appears in CLI help).                                                                                                            | `getdotenv.config.json`<br>`generateGetDotenvCli`                                                           | `'Base CLI.'` |
| `dotenvToken`           | `string`                                                                                                                                                        | Filename token indicating a dotenv file.                                                                                                          | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`--dotenv-token <string>`                              | `'.env'`      |
| `dynamicPath`           | `string \| undefined`                                                                                                                                           | Path to JS module default-exporting an object keyed to dynamic variable functions.                                                                | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`--dynamic-path <string>`                              | `undefined`   |
| `env`                   | `string \| undefined`                                                                                                                                           | Target environment (dotenv expanded).                                                                                                             | `-e, --env <string>`                                                                                        | `undefined`   |
| `excludeAll`            | `boolean`                                                                                                                                                       | Exclude all dotenv variables from loading.                                                                                                        | `-a, --exclude-all`<br>`-A, --exclude-all-off`                                                              | `false`       |
| `excludeDynamic`        | `boolean`                                                                                                                                                       | Exclude dynamic variables from loading.                                                                                                           | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`-z, --exclude-dynamic`<br>`-Z, --exclude-dynamic-off` | `false`       |
| `excludeEnv`            | `boolean`                                                                                                                                                       | Exclude environment-specific variables from loading.                                                                                              | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`-n, --exclude-env`<br>`-N, --exclude-env-off`         | `false`       |
| `excludeGlobal`         | `boolean`                                                                                                                                                       | Exclude global variables from loading.                                                                                                            | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`-g, --exclude-global`<br>`-G, --exclude-global-off`   | `false`       |
| `excludePrivate`        | `boolean`                                                                                                                                                       | Exclude private variables from loading.                                                                                                           | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`-r, --exclude-private`<br>`-R, --exclude-private-off` | `false`       |
| `excludePublic`         | `boolean`                                                                                                                                                       | Exclude public variables from loading.                                                                                                            | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`-u, --exclude-public`<br>`-U, --exclude-public-off`   | `false`       |
| `loadProcess`           | `boolean`                                                                                                                                                       | Load dotenv variables to `process.env`.                                                                                                           | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`-p, --load-process`<br>`-P, --load-process-off`       | `false`       |
| `log`                   | `boolean`                                                                                                                                                       | Log loaded dotenv variables to `logger`.                                                                                                          | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`-l, --log`<br>`-L, --log-off`                         | `false`       |
| `logger`                | `typeof console`                                                                                                                                                | A logger object that implements the `console` interface.                                                                                          | `generateGetDotenvCli`                                                                                      | `console`     |
| `outputPath`            | `string \| undefined`                                                                                                                                           | If populated, writes consolidated dotenv file to this path (dotenv expanded).                                                                     | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`-o, --output-path <string>`                           | `undefined`   |
| `paths`                 | `string`                                                                                                                                                        | A delimited string of paths to dotenv files.                                                                                                      | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`--paths <string>`                                     | `'./'`        |
| `pathsDelimiter`        | `string`                                                                                                                                                        | A delimiter string with which to split `paths`. Only used if `pathsDelimiterPattern` is not provided.                                             | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`--paths-delimiter <string>`                           | `' '`         |
| `pathsDelimiterPattern` | `string \| undefined`                                                                                                                                           | A regular expression pattern with which to split `paths`. Supersedes `pathsDelimiter`.                                                            | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`--paths-delimiter-pattern <string>`                   | `undefined`   |
| `preHook`               | [`GetDotenvCliPreHookCallback`](https://github.com/karmaniverous/get-dotenv/blob/af562295f4d6867afb46e7a86870ced03d2f9c46/src/generateGetDotenvCli.ts#L19-L26)  | A function that mutates inbound options & executes side effects within the `getDotenv` context before executing CLI commands.                     | `generateGetDotenvCli`                                                                                      | `undefined`   |
| `privateToken`          | `string`                                                                                                                                                        | Filename token indicating private variables.                                                                                                      | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`--private-token <string>`                             | `'local'`     |
| `postHook`              | [`GetDotenvCliPostHookCallback`](https://github.com/karmaniverous/get-dotenv/blob/af562295f4d6867afb46e7a86870ced03d2f9c46/src/generateGetDotenvCli.ts#L27-L32) | A function that executes side effects within the `getDotenv` context after executing CLI commands.                                                | `generateGetDotenvCli`                                                                                      | `undefined`   |
| `vars`                  | `string \| undefined`                                                                                                                                           | A delimited string of key-value pairs declaratively specifying variables & values to be loaded in addition to any dotenv files (dotenv expanded). | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`-v, --vars <string>`                                  | `undefined`   |
| `varsAssignor`          | `string`                                                                                                                                                        | A string with which to split keys from values in `vars`. Only used if `varsDelimiterPattern` is not provided.                                     | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`--vars-assignor <string>`                             | `'='`         |
| `varsAssignorPattern`   | `string \| undefined`                                                                                                                                           | A regular expression pattern with which to split variable names from values in `vars`. Supersedes `varsAssignor`.                                 | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`--vars-assignor-pattern <string>`                     | `undefined`   |
| `varsDelimiter`         | `string`                                                                                                                                                        | A string with which to split `vars` into key-value pairs. Only used if `varsDelimiterPattern` is not provided.                                    | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`--vars-delimiter <string>`                            | `' '`         |
| `varsDelimiterPattern`  | `string \| undefined`                                                                                                                                           | A regular expression pattern with which to split `vars` into key-value pairs. Supersedes `varsDelimiter`.                                         | `getdotenv.config.json`<br>`generateGetDotenvCli`<br>`--vars-delimiter-pattern <string>`                    | `undefined`   |

## Gotchas

### Running Your CLI

It won't have escaped your notice that this is a TypeScript project. And generally speaking—[ts-node](https://www.npmjs.com/package/ts-node) aside—you can't run TypeScript directly. You have to compile it first.

So that's the gotcha. If you want to run your CLI, here are your choices (substituting your own project nomenclature as needed):

1. Run it locally. You'll need to know the path to the compiled file.

```bash
# compile the project
npm run build

# view the cli help
node dist/getdotenvchild.cli.mjs -h
```

2. Link it locally. You can run it from anywhere on your system, but you need a local clone.

```bash
# compile the project
npm run build

# link the project
npm link

# view the cli help
getdotenvchild -h

# unlink when done
npm uninstall -g @karmaniverous/get-dotenv-child
```

3. Install it locally. You can run it from inside the project where you installed it.

```bash
# compile the project
npm run build

# publish the project
npm run release

# install the package in some other project
npm install @karmaniverous/get-dotenv-child

# view the cli help
npx getdotenvchild -h
```

4. Install it globally. You can run it from anywhere on your system.

```bash
# compile the project
npm run build

# publish the project
npm run release

# install the package globally
npm install -g @karmaniverous/get-dotenv-child

# view the cli help
getdotenvchild -h
```

### Expanding CLI Options & Arguments

If you examine the [`fooCommand`](./src/cli/getdotenvchild/fooCommand.ts) file, you'll see that I employed [`dotenvExpandFromProcessEnv`](https://github.com/karmaniverous/get-dotenv/blob/955d9816352caa5b1853d7234664e2c1a9224de0/src/dotenvExpand.ts#L100-L110) to expand the `target` option against `process.env`.

**Why didn't I just use `dotenvExpandFromProcessEnv` as the input parser for the `target` option?**

_Great_ question! 🤣 Here's what that would look like:

```typescript
  // The default value '$PUBLIC' is a placeholder for a value loaded via dotenv.
  .option(
    '-t, --target <string>',
    'the target to foo',
    dotenvExpandFromProcessEnv,
    '$PUBLIC',
  )
```

It turns out that `commander` default option values are _not_ subjected to the provided parsing function. So the configured default value (`'$PUBLIC'`) would get passed to your function logic without ever getting parsed.

**Ok, so why not just parse the defaut value right there in the option configuration?**

Another great question! Here's what _that_ would look like:

```typescript
  // The default value '$PUBLIC' is a placeholder for a value loaded via dotenv.
  .option(
    '-t, --target <string>',
    'the target to foo',
    dotenvExpandFromProcessEnv('$PUBLIC'),
  )
```

That won't work either, because `commander` will wind up calling `dotenvExpandFromProcessEnv` _before_ it runs `getDotenv`, therefore before `process.env` is populated with your dotenv variables.

So if you intend to expand your options, it makes sense to do so in your action step, which runs _after_ `getDotenv` has populated `process.env`. If you like, you can expand the entire `options` object at once using [`dotenvExpandAll`](https://github.com/karmaniverous/get-dotenv/blob/955d9816352caa5b1853d7234664e2c1a9224de0/src/dotenvExpand.ts#L82-L98)

### Positional & Passthrough Options

The `get-dotenv` CLI is based on the [`commander`](https://www.npmjs.com/package/commander) library, which supports a rich combination of commands, options, arguments, and subcommands.

For example:

```shell
$> getdotenv -l foo -b bar baz
```

In the above example, `getdotenv` is the root command, and `-l` is a flag (a boolean option) against that command. `foo` is a subcommand; `-b bar` is a string option against the `foo` subcommand; and `baz` is an argument to the `foo` subcommand.

By default, the following command line would produce exactly the same execution:

```shell
$> getdotenv foo -l -b bar baz
```

This works so long as the `foo` subcommand does not _also_ have a `-l` flag. When you're in charge of your entire CLI (and when your CLI is simple), this isn't hard to arrange.

However, when you're building a child CLI, you inherit whatever options & arguments the parent CLI has. This can make it difficult to predict the command line that will be passed to your child CLI. So `commander` provides the `enablePositionalOptions` and `passThroughOptions` features, which constrain the CLI so that options & arguments can only be used adjacent to their parent command/subcommand.

The `get-dotenv` parent CLI has a _lot_ of options, so it's a good idea to enable these features in any command you append to it. You can see an example of this in [fooCommand](./src/cli/getdotenvchild/fooCommand.ts)
