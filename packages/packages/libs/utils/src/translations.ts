type TranslateFunction = ( key: string, ...args: string[] ) => string;

interface CreateTranslateOptions {
	configKey: string;
	defaultStrings?: Record< string, string >;
}

export function createTranslate( { configKey, defaultStrings = {} }: CreateTranslateOptions ): TranslateFunction {
	return ( key: string, ...args: string[] ): string => {
		const appConfig = window.elementorAppConfig as
			| Record< string, { translations?: Record< string, string > } >
			| undefined;
		const remoteStrings = appConfig?.[ configKey ]?.translations;
		const strings: Record< string, string > = {
			...defaultStrings,
			...remoteStrings,
		};

		let template = strings[ key ];

		if ( ! template ) {
			return key;
		}

		for ( let i = 0; i < args.length; i++ ) {
			template = template.replace( `%${ i + 1 }$s`, args[ i ] );
			template = template.replace( '%s', args[ i ] );
		}

		return template;
	};
}
