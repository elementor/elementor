const createCallbackSlot = () => {
	let handler: ( () => void ) | null = null;
	return {
		register: ( cb: () => void ) => { handler = cb; },
		invoke: () => handler?.(),
	};
};

const toggle = createCallbackSlot();
const open = createCallbackSlot();

export const registerClassManagerToggle = toggle.register;
export const registerClassManagerOpen = open.register;
export const toggleClassManager = toggle.invoke;
export const openClassManager = open.invoke;
