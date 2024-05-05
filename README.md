# get-dotenv Child CLI

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
