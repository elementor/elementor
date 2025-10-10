export type WindowWithDataHooks = Window & {
	$e: {
		modules?: {
			hookData?: {
				[ K in keyof HooksMap as Capitalize< K > ]: HooksMap[ K ];
			};
		};
	};
};

type HooksMap = Record< HookType, typeof DataHook | undefined >;

type HookType = 'after' | 'dependency';

export type Args = Record< string, unknown >;

export declare class DataHook {
	getCommand(): string;
	getId(): string;
	apply( args: Args ): unknown;
	register(): void;
}

let hookId = 0;

export function registerDataHook( type: 'dependency', command: string, callback: ( args: Args ) => boolean ): DataHook;

export function registerDataHook(
	type: 'after',
	command: string,
	callback: ( args: Args ) => void | Promise< void >
): DataHook;

export function registerDataHook( type: HookType, command: string, callback: ( args: Args ) => unknown ): DataHook {
	const eWindow = window as unknown as WindowWithDataHooks;
	const hooksClasses = eWindow.$e?.modules?.hookData;

	const hooksMap = {
		after: hooksClasses?.After,
		dependency: hooksClasses?.Dependency,
	} satisfies HooksMap;

	const HookClass = hooksMap[ type ];

	if ( ! HookClass ) {
		throw new Error( `Data hook '${ type }' is not available` );
	}

	const currentHookId = ++hookId;

	const hook = new ( class extends HookClass {
		getCommand() {
			return command;
		}

		getId() {
			return `${ command }--data--${ currentHookId }`;
		}

		apply( args: Args ) {
			return callback( args );
		}
	} )();

	hook.register();

	return hook;
}
