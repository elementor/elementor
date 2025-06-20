let globalEnv: Record< string, object > | null = null;

export function initEnv( env: Record< string, object > ) {
	globalEnv = env;
}

export function __resetEnv() {
	globalEnv = null;
}

export function parseEnv< TEnv extends object = object >(
	key: string,
	parseFn: ( envData: object ) => TEnv = ( rawSettings: object ) => rawSettings as TEnv
) {
	let parsedEnv: TEnv = {} as TEnv;
	let isParsed = false;

	// Proxy the exposed object so users will be able to access the properties
	// as if it was a plain object, while still having automatic parsing.
	const proxiedEnv = new Proxy( parsedEnv, {
		get( target, property ) {
			if ( ! isParsed ) {
				parse();
			}

			return parsedEnv[ property as keyof TEnv ];
		},
		ownKeys() {
			if ( ! isParsed ) {
				parse();
			}

			return Reflect.ownKeys( parsedEnv );
		},
		getOwnPropertyDescriptor() {
			return {
				configurable: true,
				enumerable: true,
			};
		},
	} );

	const parse = () => {
		try {
			const env = globalEnv?.[ key ];

			if ( ! env ) {
				throw new InvalidEnvError( `Settings object not found` );
			}

			if ( typeof env !== 'object' ) {
				throw new InvalidEnvError( `Expected settings to be \`object\`, but got \`${ typeof env }\`` );
			}

			parsedEnv = parseFn( env );
		} catch ( e ) {
			// If something in the validation goes wrong, we return an empty object instead of throwing,
			// so it'll fail in the component level rather than the module level.
			if ( e instanceof InvalidEnvError ) {
				// eslint-disable-next-line no-console
				console.warn( `${ key } - ${ e.message }` );

				parsedEnv = {} as TEnv;
			} else {
				throw e;
			}
		} finally {
			isParsed = true;
		}
	};

	return {
		validateEnv: parse,
		env: proxiedEnv,
	};
}

export class InvalidEnvError extends Error {}
