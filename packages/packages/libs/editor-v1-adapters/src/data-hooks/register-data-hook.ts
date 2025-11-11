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

export declare class DataHook< TArgs extends Args = Args, TResult = unknown > {
	getCommand(): string;
	getId(): string;
	apply( args: TArgs, result?: TResult ): unknown;
	register(): void;
}

let hookId = 0;

export function registerDataHook< TArgs extends Args = Args >(
	type: 'dependency',
	command: string,
	callback: ( args: TArgs ) => boolean
): DataHook< TArgs >;

export function registerDataHook< TArgs extends Args = Args, TResult = unknown >(
	type: 'after',
	command: string,
	callback: ( args: TArgs, result: TResult ) => void | Promise< void >
): DataHook< TArgs, TResult >;

export function registerDataHook< TArgs extends Args = Args, TResult = unknown >(
	type: HookType,
	command: string,
	callback: ( args: TArgs, result?: TResult ) => unknown
): DataHook< TArgs, TResult > {
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

	const hook = new ( class extends HookClass< TArgs, TResult > {
		getCommand() {
			return command;
		}

		getId() {
			return `${ command }--data--${ currentHookId }`;
		}

		apply( ...args: [ TArgs, TResult ] ) {
			return callback( ...args );
		}
	} )();

	hook.register();

	return hook;
}
