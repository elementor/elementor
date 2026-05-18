type Callback = () => void;

let handler: Callback | null = null;

export const registerOpenVariablesSettings = ( cb: Callback ) => {
	handler = cb;
};

export const openVariablesSettings = () => handler?.();
