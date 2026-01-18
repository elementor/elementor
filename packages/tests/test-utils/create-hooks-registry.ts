type MockHook = {
	getCommand: () => string;
	getId?: () => string;
	apply: ( args: unknown, result?: unknown ) => unknown;
};

type HooksRegistry = ReturnType< typeof createHooksRegistry >;

export type WindowWithHooks = Window & {
	$e: {
		modules?: {
			hookData?: {
				After: ReturnType< HooksRegistry[ 'createClass' ] >;
				Dependency: ReturnType< HooksRegistry[ 'createClass' ] >;
			};
		};
	};
};

export function createHooksRegistry() {
	let hooks: MockHook[] = [];

	return {
		getAll: () => hooks,

		getByCommand: ( command: string ) => hooks.find( ( hook ) => hook.getCommand() === command ),

		reset: () => {
			hooks = [];
		},

		createClass: () => {
			return class {
				register() {
					hooks.push( this as never );
				}
			};
		},
	};
}

export function setupHooksRegistry( hooksRegistry: HooksRegistry ) {
	const eWindow = window as unknown as WindowWithHooks;

	hooksRegistry.reset();

	eWindow.$e = {
		modules: {
			hookData: {
				After: hooksRegistry.createClass(),
				Dependency: hooksRegistry.createClass(),
			},
		},
	};

	return eWindow;
}
