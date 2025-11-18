import { type ExtendedWindow, type V1ElementConfig } from '../sync/types.js';
type WidgetsCache< T > = Record< string, T >;

export function getWidgetsCache< T extends V1ElementConfig >(): WidgetsCache< T > | null {
	const extendedWindow = window as unknown as ExtendedWindow;

	return ( extendedWindow?.elementor?.widgetsCache as WidgetsCache< T > ) || null;
}
