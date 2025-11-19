# Plugin Mirror

A free, self-hostable Minecraft plugin mirror written in TypeScript using Deno.

### You should use this if:

- You regularly need to install/manage plugins
  
- You need to share servers
  
- You want to automate dependency resolution
  
- You prefer a CLI plugin mirror instead of manually installing plugins
  
- You want to minimize plugin issues and ensure the safety of your plugins
  

### You should not use this if:

- You are running a single server and do not need dependency management
  
- You prefer manual control
  
- You don't need to change plugins often
  

# Installation

While there is no clean installation guide yet, you can use the below command in the project's root.

```shell
$ deno install -n pmirror --allow-read --allow-write --allow-env --allow-net --allow-run --allow-sys ./src/cli/CLI.ts -f --global
```

# Usage

## Running the API

```shell
$ pmirror api
```

## Running the CLI

All of the options are optional, and have defaults.

| Option | Default |
| --- | --- |
| -p, --path | `./plugins` |
| -d. --dependencies | `./dependencies.txt` |
| -ip, --ip | `127.0.0.1` |
| -port, --port | `35826` |

```shell
$ pmirror
```

## Populating the database

```shell
$ pmirror baseplugins
```
