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
	elementor?: {
		documents?: {
			getCurrent: () => {
				history: {
					getCurrentId: () => number | null;
				};
			};
		};
	};
};

type HooksMap = Record< HookType, typeof DataHook | undefined >;

type HookType = 'after' | 'dependency';

export type Args = Record< string, unknown >;

export type HookOptions = {
	commandsCurrentTrace?: string[];
	setUndoData?: ( data: unknown ) => void;
};

export type AfterHookCallback< TArgs extends Args = Args, TResult = unknown > = (
	args: TArgs,
	result: TResult,
	options?: HookOptions
) => void | Promise< void >;

export type DependencyHookCallback< TArgs extends Args = Args > = ( args: TArgs, options?: HookOptions ) => boolean;

export type UndoRedoCallback< TUndoData = unknown > = ( data: TUndoData ) => void;

export type UndoRedoOptions< TUndoData = unknown > = {
	onUndo?: UndoRedoCallback< TUndoData >;
	onRedo?: UndoRedoCallback< TUndoData >;
};

export declare class DataHook< TArgs extends Args = Args, TResult = unknown > {
	getCommand(): string;
	getId(): string;
	apply( args: TArgs, result?: TResult ): unknown;
	register(): void;
}

type HistoryItem = { get: ( key: string ) => unknown };

const undoRedoMap = new Map<
	number,
	{
		onUndo?: UndoRedoCallback;
		onRedo?: UndoRedoCallback;
		doArgs?: Args;
	}
>();

let hookId = 0;
let undoRedoListenersRegistered = false;

function getHistoryId(): number | null {
	const eWindow = window as unknown as WindowWithDataHooks;

	return eWindow.elementor?.documents?.getCurrent()?.history?.getCurrentId() ?? null;
}

function registerUndoRedoListeners() {
	if ( undoRedoListenersRegistered ) {
		return;
	}
	undoRedoListenersRegistered = true;

	const handleUndoOrRedo = ( _args: Args, result: unknown, isRedo: boolean ) => {
		const item = result as HistoryItem | undefined;
		const historyId = item?.get?.( 'id' ) as number | undefined;

		if ( ! historyId ) {
			return;
		}

		const callbacks = undoRedoMap.get( historyId );

		if ( callbacks ) {
			if ( isRedo ) {
				callbacks.onRedo?.( callbacks.doArgs );
			} else {
				callbacks.onUndo?.( callbacks.doArgs );
			}
		}
	};

	registerDataHook( 'after', 'document/history/undo', ( args: Args, result: unknown ) => {
		handleUndoOrRedo( args, result, false );
	} );

	registerDataHook( 'after', 'document/history/redo', ( args: Args, result: unknown ) => {
		handleUndoOrRedo( args, result, true );
	} );

	registerDataHook( 'after', 'document/history/undo-all', ( args: Args, result: unknown ) => {
		handleUndoOrRedo( args, result, false );
	} );
}

export function registerDataHook< TArgs extends Args = Args >(
	type: 'dependency',
	command: string,
	callback: DependencyHookCallback< TArgs >,
	undoRedoOptions?: UndoRedoOptions
): DataHook< TArgs >;

export function registerDataHook< TArgs extends Args = Args, TResult = unknown >(
	type: 'after',
	command: string,
	callback: AfterHookCallback< TArgs, TResult >,
	undoRedoOptions?: UndoRedoOptions
): DataHook< TArgs, TResult >;

export function registerDataHook< TArgs extends Args = Args, TResult = unknown >(
	type: HookType,
	command: string,
	callback: AfterHookCallback< TArgs, TResult > | DependencyHookCallback< TArgs >,
	undoRedoOptions?: UndoRedoOptions
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

			if ( undoRedoOptions?.onUndo || undoRedoOptions?.onRedo ) {
				registerUndoRedoListeners();

				const historyId = getHistoryId();
				if ( historyId !== null ) {
					undoRedoMap.set( historyId, {
						onUndo: undoRedoOptions.onUndo,
						onRedo: undoRedoOptions.onRedo,
						doArgs: args,
					} );
				}
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
