type Callback = () => void;

let handler: Callback | null = null;

export const registerGoToClassManager = ( cb: Callback ) => {
	handler = cb;
};

export const goToClassManager = () => handler?.();
