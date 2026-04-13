/**
 * Returns true when the currently open Elementor document has an atomic v4 controls panel.
 * PHP sets elementor.config.document.panel.atomic = true for documents that use
 * the Has_Atomic_Document trait (e.g. Atomic_Header / Header V4).
 */
export const isAtomicDocumentOpen = (): boolean => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return !! ( window as any )?.elementor?.config?.document?.panel?.atomic;
};
