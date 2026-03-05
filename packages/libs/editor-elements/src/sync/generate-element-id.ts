import { type ExtendedWindow } from './types';

export const generateElementId = () => {
	const extendedWindow = window as unknown as ExtendedWindow;

	return (
		extendedWindow.elementorCommon?.helpers?.getUniqueId?.() ??
		`el-${ Date.now() }-${ Math.random().toString( 36 ).substring( 2, 9 ) }`
	);
};
