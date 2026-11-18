/**
 * AngieGenerateButton gates on shouldShowAngieEntryPoints(), which needs
 * window.elementorV2.editorAngie.openAngie. Keep this mock local to entry-point
 * tests instead of packages/tests/setup.ts.
 */
export function mockAngieEntryPointsEnabled(): void {
	window.elementorV2 = {
		...window.elementorV2,
		editorAngie: {
			openAngie: jest.fn(),
		},
	};
	delete window.elementorEditorAngie;
}
