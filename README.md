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

The plumbing requires some familiarity with the [`commander`](https://www.npmjs.com/package/commander) library but is otherwise _very_ simple. It is fully explained in the comments on two source files in the [`cli`](./src/cli/) directory.

See [Positional & Passthrough Options](#positional--passthrough-options) below for one key gotcha.

### Options

## Positional & Passthrough Options

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
