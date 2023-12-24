import {DocumentConfig} from "../types";

declare const ElementorConfig: {
	initial_document: DocumentConfig,
	platform: {
		name: string,
		version: string,
	}
};

export const useConfig = ( ...args: string[] ) => {
	return args.map( ( arg: string ) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return ElementorConfig[ arg ];
	} );
};
