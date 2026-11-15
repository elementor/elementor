export function shouldShowAngieEntryPoints(): boolean {
	const showEntryPoints = window.elementorEditorAngie?.showEntryPoints ?? true;

	if ( ! showEntryPoints ) {
		return false;
	}

	return Boolean( window.elementorV2?.editorAngie?.openAngie );
}

export const isAngieEntryPointsEnabled = shouldShowAngieEntryPoints;