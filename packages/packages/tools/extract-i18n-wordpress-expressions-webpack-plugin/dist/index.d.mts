import { Chunk, Compiler, Compilation } from 'webpack';

type EntrySettings = {
    id: string;
    chunk: Chunk;
    path: string;
    pattern: string;
};

type Options = {
    pattern: (entryPath: string, entryId: string) => string;
};
declare class ExtractI18nWordpressExpressionsWebpackPlugin {
    options: Options;
    constructor(options: Options);
    apply(compiler: Compiler): void;
    getEntries(compilation: Compilation): EntrySettings[];
}

export { ExtractI18nWordpressExpressionsWebpackPlugin };
