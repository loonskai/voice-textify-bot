declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      SUBSCRIPTION_KEY: string;
    }
  }
}

export {};
