import { Compiler, Compilation, Chunk } from 'webpack';

type RequestToHandleMap = Array<{
    request: string | RegExp;
    handle: string;
}>;

type Options = {
    handle: (entryName: string) => string;
    map: RequestToHandleMap;
};
declare class GenerateWordPressAssetFileWebpackPlugin {
    options: Options;
    constructor(options: Options);
    apply(compiler: Compiler): void;
    addAssetFileToEntrypoint(compilation: Compilation, entryName: string, chunk: Chunk): void;
    getDepsHandlesFromChunk(compilation: Compilation, chunk: Chunk): string[];
    getFileFromChunk(chunk: Chunk): string | undefined;
}

export { GenerateWordPressAssetFileWebpackPlugin };
