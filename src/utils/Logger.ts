import chalk from "npm:chalk";

export function Log(message: string, origin: string = "Logger") {
  console.log(
    chalk.cyanBright(`[${origin}] `) +
    chalk.white(`${message}`)
  );
}

export function Warn(message: string, origin: string = "Logger") {
  console.warn(
    chalk.yellow(`[${origin}] `) +
    chalk.yellowBright(`${message}`)
  )
}

export function Error(message: string, origin: string = "Logger") {
  console.error(
    chalk.red(`[${origin}] `) +
    chalk.redBright(`${message}`)
  )
}