import { type AdornmentComponent } from '@elementor/editor-controls';

type FieldType = 'settings' | 'styles';

type FieldIndicator = {
	id: string;
	indicator: AdornmentComponent;

	// ordered from lowest to highest
	priority: number;
};

const indicatorsRegistry: Record< FieldType, Map< string, FieldIndicator > > = {
	settings: new Map(),
	styles: new Map(),
};

const DEFAULT_PRIORITY = 10;

export const FIELD_TYPE = {
	SETTINGS: 'settings',
	STYLES: 'styles',
} satisfies Record< string, FieldType >;

export const registerFieldIndicator = ( {
	fieldType,
	id,
	indicator,
	priority = DEFAULT_PRIORITY,
}: FieldIndicator & { fieldType: FieldType } ) => {
	indicatorsRegistry[ fieldType ].set( id, { id, indicator, priority } );
};

export const getFieldIndicators = ( fieldType: FieldType ): { id: string; Adornment: AdornmentComponent }[] =>
	Array.from( indicatorsRegistry[ fieldType ].values() )
		.sort( ( a, b ) => a.priority - b.priority )
		.map( ( { id, indicator: Adornment } ) => ( { id, Adornment } ) );
