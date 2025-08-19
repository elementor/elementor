import { type Args, registerDataHook } from './register-data-hook';

type BlockCommandArgs = {
	command: string;
	condition: ( args: Args ) => boolean;
};

export function blockCommand( { command, condition }: BlockCommandArgs ) {
	return registerDataHook( 'dependency', command, ( args ) => {
		const shouldBlock = condition( args );

		// Should return `false` to prevent the command from running.
		return ! shouldBlock;
	} );
}
