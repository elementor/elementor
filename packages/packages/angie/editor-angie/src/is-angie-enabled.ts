export const isAngieEnabled = (): boolean => {
	return window.elementorEditorAngie?.isAngieEnabled === true;
};

export const useIsAngieEnabled = (): boolean => {
	return isAngieEnabled();
};
