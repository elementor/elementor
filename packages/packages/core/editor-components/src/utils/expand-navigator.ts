import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

export async function expandNavigator() {
	await runCommand( 'navigator/expand-all' );
}
