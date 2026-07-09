// `editor-editing-panel` already depends on `editor-variables`, so this can't be a React context owned by
// `editor-editing-panel` without creating a circular package dependency. `editor-editing-panel`'s `StyleProvider`
// keeps this in sync with the currently edited style; `editor-variables` reads it when tracking `connect_variable`.
let currentAppliedClass: string | null = null;

export const setAppliedClassContext = ( appliedClass: string | null ): void => {
	currentAppliedClass = appliedClass;
};

export const getAppliedClassContext = (): string | null => currentAppliedClass;
