import { ExternalsPlugin, Compiler } from 'webpack';

type Global = string | string[];
type RequestToGlobalMap = Array<{
    request: string | RegExp;
    global: Global;
}>;

type Options = {
    type: string;
    global?: (entryName: string) => Global;
    map: RequestToGlobalMap;
};
declare class ExternalizeWordPressAssetsWebpackPlugin {
    options: Options;
    externalPlugin: ExternalsPlugin;
    constructor(options: Pick<Options, 'map' | 'global'>);
    apply(compiler: Compiler): void;
    externalsPluginCallback(request: string | undefined, callback: (err?: undefined, result?: Global) => void): void;
    exposeEntry(compiler: Compiler): void;
}

export { ExternalizeWordPressAssetsWebpackPlugin };
