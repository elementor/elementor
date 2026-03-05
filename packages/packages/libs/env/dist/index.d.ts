declare function initEnv(env: Record<string, object>): void;
declare function __resetEnv(): void;
declare function parseEnv<TEnv extends object = object>(key: string, parseFn?: (envData: object) => TEnv): {
    validateEnv: () => void;
    env: TEnv;
};
declare class InvalidEnvError extends Error {
}

export { InvalidEnvError, __resetEnv, initEnv, parseEnv };
