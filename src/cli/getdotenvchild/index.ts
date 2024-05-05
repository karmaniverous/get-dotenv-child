#!/usr/bin/env node

// This is the base get-dotenv CLI.
import { generateGetDotenvCli } from '@karmaniverous/get-dotenv';

// This is your custom CLI command that wraps the foo function.
import { fooCommand } from './fooCommand';

/**
 * Generate the base CLI and add the foo command to it. generateDotenvCli()
 * will pull any default settings from getdotenv.config.json if available. You
 * can also pass options directly to generateGetDotenvCli to override these
 * defaults.
 */
const cli = generateGetDotenvCli().addCommand(fooCommand);

await cli.parseAsync();
