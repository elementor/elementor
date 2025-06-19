import { BannerPlugin, Compiler } from 'webpack';

type Options = {
    initializer: (args: InitializerArgs) => string;
};
type InitializerArgs = Parameters<BannerPlugin['banner']>[0] & {
    entryName: string;
};
declare class EntryInitializationWebpackPlugin {
    private options;
    constructor(options: Options);
    apply(compiler: Compiler): void;
}

export { EntryInitializationWebpackPlugin };
