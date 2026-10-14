import { stringPropTypeUtil } from '@elementor/editor-props';

export const SVG_ICON_LIBRARY = 'svg';

export type IconLibraryMediaValue = {
	id?: number;
	url?: string;
};

export type IconLibrarySelection = {
	value: string | IconLibraryMediaValue;
	library: string;
};

type IconManagerControlView = {
	model: {
		get: ( key: string ) => unknown;
	};
	getControlValue: () => IconLibrarySelection;
	setValue: ( icon: IconLibrarySelection ) => void;
	applySavedValue: () => void;
};

type IconManager = {
	loadIconLibraries: () => void;
	show: ( options: { view: IconManagerControlView } ) => void;
};

type ElementorWithIconManager = {
	iconManager?: IconManager;
};

type OpenIconLibraryOptions = {
	selected?: IconLibrarySelection;
	onSelect?: ( icon: IconLibrarySelection ) => void;
};

export function isSvgLibrarySelection(
	icon: IconLibrarySelection
): icon is IconLibrarySelection & { value: IconLibraryMediaValue } {
	return icon.library === SVG_ICON_LIBRARY && typeof icon.value === 'object' && icon.value !== null;
}

export function openIconLibrary( { selected, onSelect }: OpenIconLibraryOptions = {} ) {
	const iconManager = ( window.elementor as ElementorWithIconManager | undefined )?.iconManager;

	if ( ! iconManager ) {
		return;
	}

	iconManager.loadIconLibraries();
	iconManager.show( {
		view: createIconManagerControlView( selected, onSelect ),
	} );
}

export function enqueueIconFonts( library: string ) {
	window.elementor?.helpers?.enqueueIconFonts?.( library );
}

function createIconManagerControlView(
	selected?: IconLibrarySelection,
	onSelect?: ( icon: IconLibrarySelection ) => void
): IconManagerControlView {
	return {
		model: {
			get: () => false,
		},
		getControlValue: () => selected ?? { value: '', library: '' },
		setValue: ( icon ) => {
			onSelect?.( icon );
		},
		applySavedValue: () => undefined,
	};
}

export function createIconPropValue( icon: Extract< IconLibrarySelection[ 'value' ], string >, library: string ) {
	return {
		value: stringPropTypeUtil.create( icon ),
		library: stringPropTypeUtil.create( library ),
	};
}
