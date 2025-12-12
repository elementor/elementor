import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

export function switchToComponent( componentId: number | string, componentInstanceId?: string | null ) {
	runCommand( 'editor/documents/switch', {
		id: componentId,
		selector: componentInstanceId ? `[data-id="${ componentInstanceId }"]` : undefined,
		mode: 'autosave',
		setAsInitial: false,
		shouldScroll: false,
	} );
}
