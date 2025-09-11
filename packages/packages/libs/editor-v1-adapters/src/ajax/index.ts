import { RequestParams, type ExtendedWindow } from "./types";

export const ajax = {
    async load( data: RequestParams ) {
        const extendedWindow = window as unknown as ExtendedWindow;

        return new Promise( ( success, error ) => {
            extendedWindow.elementorCommon?.ajax?.load( {
                ...data,
                success,
                error,
            } );
        } );
    },
    invalidateCache( data: RequestParams ) {
        const extendedWindow = window as unknown as ExtendedWindow;
    
        extendedWindow.elementorCommon?.ajax?.invalidateCache( data );
    }
};