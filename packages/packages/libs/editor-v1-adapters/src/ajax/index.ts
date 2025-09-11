import { type AjaxRequest, type ExtendedWindow } from "./types";

export const ajax = {
    async load( data: AjaxRequest ) {
        const extendedWindow = window as unknown as ExtendedWindow;

        return new Promise( ( success, error ) => {
            extendedWindow.elementorCommon?.ajax?.load( {
                ...data,
                success,
                error,
            } );
        } );
    },
    invalidateCache( data: Partial< AjaxRequest > & Pick< AjaxRequest, 'unique_id' | 'data' > ) {
        const extendedWindow = window as unknown as ExtendedWindow;
    
        extendedWindow.elementorCommon?.ajax?.invalidateCache( {
            ...data
        } );
    }
};