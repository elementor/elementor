import type { V1ElementModelProps } from '@elementor/editor-elements';

export function getClipboardElements( storageKey: string = 'clipboard' ): V1ElementModelProps[] | undefined {
	try {
		const storedData = JSON.parse( localStorage.getItem( 'elementor' ) ?? '{}' );

		return storedData[ storageKey ]?.elements as V1ElementModelProps[] | undefined;
	} catch {
		return undefined;
	}
}
