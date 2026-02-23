export type WindowWithDataHooks = Window & {
	$e: {
		modules?: {
			hookData?: {
				[ K in keyof HooksMap as Capitalize< K > ]: HooksMap[ K ];
			};
		};
		commands?: {
			currentTrace?: string[];
		};
	};
};

type HooksMap = Record< HookType, typeof DataHook | undefined >;

type HookType = 'after' | 'dependency';

export type Args = Record< string, unknown >;

export type HookOptions = {
	commandsCurrentTrace?: string[];
};

export type AfterHookCallback< TArgs extends Args = Args, TResult = unknown > = (
	args: TArgs,
	result: TResult,
	options?: HookOptions
) => void | Promise< void >;

export type DependencyHookCallback< TArgs extends Args = Args > = ( args: TArgs, options?: HookOptions ) => boolean;

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
	callback: DependencyHookCallback< TArgs >
): DataHook< TArgs >;

export function registerDataHook< TArgs extends Args = Args, TResult = unknown >(
	type: 'after',
	command: string,
	callback: AfterHookCallback< TArgs, TResult >
): DataHook< TArgs, TResult >;

export function registerDataHook< TArgs extends Args = Args, TResult = unknown >(
	type: HookType,
	command: string,
	callback: AfterHookCallback< TArgs, TResult > | DependencyHookCallback< TArgs >
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

		apply( args: TArgs, result?: TResult ) {
			const hookOptions: HookOptions = {};

			const currentWindow = window as unknown as WindowWithDataHooks;
			const commandsCurrentTrace = currentWindow.$e?.commands?.currentTrace;
			if ( commandsCurrentTrace ) {
				hookOptions.commandsCurrentTrace = commandsCurrentTrace;
			}

			if ( type === 'dependency' ) {
				return ( callback as DependencyHookCallback< TArgs > )( args, hookOptions );
			}

			return ( callback as AfterHookCallback< TArgs, TResult > )( args, result as TResult, hookOptions );
		}
	} )();

	hook.register();

	return hook;
}
