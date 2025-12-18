type Settings = Record< string, unknown >;

type ChildRenderCallback = () => void;

interface ListenToChildrenAPI {
	render: ( callback: ChildRenderCallback ) => void;
}

type ListenToChildrenFunction = ( elementTypes: string[] ) => ListenToChildrenAPI;

type SharedHandlerParams< TSettings extends Settings = Settings > = {
	element: Element;
	signal: AbortSignal;
	settings: TSettings;
};

export type Handler = < TSettings extends Settings = Settings >(
	params: SharedHandlerParams< TSettings >
) => ( () => void ) | undefined;

export type SelectorHandler = < TSettings extends Settings = Settings >(
	params: SharedHandlerParams< TSettings >
) => ( () => void ) | undefined;

export const elementTypeHandlers: Map< string, Map< string, Handler > > = new Map();
export const elementSelectorHandlers: Map< string, Map< string, SelectorHandler > > = new Map();

export const register = ( { elementType, id, callback }: { elementType: string; id: string; callback: Handler } ) => {
	if ( ! elementTypeHandlers.has( elementType ) ) {
		elementTypeHandlers.set( elementType, new Map() );
	}

	if ( ! elementTypeHandlers.get( elementType )?.has( id ) ) {
		elementTypeHandlers.get( elementType )?.set( id, callback );
	}
};

export const unregister = ( { elementType, id }: { elementType: string; id?: string } ) => {
	if ( ! elementTypeHandlers.has( elementType ) ) {
		return;
	}

	if ( id ) {
		elementTypeHandlers.get( elementType )?.delete( id );

		if ( elementTypeHandlers.get( elementType )?.size === 0 ) {
			elementTypeHandlers.delete( elementType );
		}
	} else {
		elementTypeHandlers.delete( elementType );
	}
};

export const registerBySelector = ( {
	id,
	selector,
	callback,
}: {
	selector: string;
	id: string;
	callback: SelectorHandler;
} ) => {
	if ( ! elementSelectorHandlers.has( selector ) ) {
		elementSelectorHandlers.set( selector, new Map() );
	}

	if ( ! elementSelectorHandlers.get( selector )?.has( id ) ) {
		elementSelectorHandlers.get( selector )?.set( id, callback );
	}
};

export const unregisterBySelector = ( { selector, id }: { selector: string; id?: string } ) => {
	if ( ! elementSelectorHandlers.has( selector ) ) {
		return;
	}

	if ( id ) {
		elementTypeHandlers.get( selector )?.delete( id );

		if ( elementTypeHandlers.get( selector )?.size === 0 ) {
			elementTypeHandlers.delete( selector );
		}
	} else {
		elementTypeHandlers.delete( selector );
	}
};
