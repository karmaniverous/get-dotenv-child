// Use this library to enable automatic typings based on the options you define!
import { Command } from '@commander-js/extra-typings';
// This parser function expands values from your dotenv context.
import { dotenvExpandFromProcessEnv } from '@karmaniverous/get-dotenv';

// This is the library function you want to wrap in a CLI command.
import { foo } from '../../foo';

// This is standard Commander.js syntax.
export const fooCommand = new Command()
  .name('foo')
  .description('Wraps the foo function into a CLI command.')
  .enablePositionalOptions()
  .passThroughOptions()
  // The default value '$PUBLIC' is a placeholder for a value loaded via dotenv.
  .option('-t, --target <string>', 'the target to foo', '$PUBLIC')
  .action(({ target }) => {
    /**
     * This is your actual command logic.
     *
     * In this case we've used dotenvExpandFromProcessEnv to expand the value
     * of target from your dotenv context. Only necessary if it makes sense.
     */
    console.log(foo(dotenvExpandFromProcessEnv(target)));
  });
