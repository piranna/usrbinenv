#!/bin/node

var ignoreEnvironment = false
var endLinesWithNull = false
var env = process.env

const NODEJS_BIN = 'node'


function unset(key)
{
  if(env[key] == undefined)
  {
    console.error('Unknown environment key:',key)
    process.exit(2)
  }

  env[key] = undefined
}


var argv = process.argv.slice(2)

// Options
for(; argv.length; argv.shift())
{
  var arg = argv[0]

  if(arg[0] != '-') break;

  switch(arg[0])
  {
    case '-':
    case '-i':
    case '--ignore-environment':
      ignoreEnvironment = true;
    break;

    case '-0':
    case '--null':
      endLinesWithNull = true;
    break;

    case '-u':
    case '--unset':
    {
      argv.shift()
      unset(argv[0])
    }
    break;

    default:
      if(arg.substr(0,8) == '--unset=')
      {
        unset(arg.substr(8))
        break
      }

      console.error('Unknown argument:',arg)
      process.exit(1)
  }
}


// Environment variabless
if(ignoreEnvironment)
  process.env = env = {}

for(; argv.length; argv.shift())
{
  var arg = argv[0].split('=')

  if(arg.length < 2) break;

  var key   = arg.shift()
  var value = arg.join('=')

  env[key] = value;
}

// Exec command or show environment variables
var command = argv.shift()

if(command)
{
  command = command.replace(/\s+$/, '')

  if(command === NODEJS_BIN)
  {
    // We are trying to execute a Node.js script, re-use the current instance.
    // This require that the Node.js script don't use any execution trick like
    // checking "!module.parent" or "require.main === module". If you want your
    // package to work both as a library and an executable, define it in two
    // diferent scripts and use package.json "main" and "bin" entries.
    process.argv = [NODEJS_BIN].concat(argv)

    return require(argv[0])
  }

  require('kexec')(command, argv)
}
else
{
  var endLine = endLinesWithNull ? '\0' : '\n'

  for(var key in env)
    process.stdout.write(key+'='+env[key] + endLine);
}
