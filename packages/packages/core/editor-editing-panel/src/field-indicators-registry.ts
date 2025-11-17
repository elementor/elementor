import { type ControlAdornmentsItem } from '@elementor/editor-controls';

type FieldType = 'settings' | 'styles';

type FieldIndicator = {
	fieldType: 'settings' | 'styles';
	indicator: ControlAdornmentsItem;
	priority: number;
};

const indicatorsRegistry: Record< FieldType, Map< string, FieldIndicator > > = {
	settings: new Map(),
	styles: new Map(),
};

const DEFAULT_PRIORITY = 10;

export const registerFieldIndicator = ( { fieldType, indicator, priority = DEFAULT_PRIORITY }: FieldIndicator ) => {
	indicatorsRegistry[ fieldType ].set( indicator.id, { fieldType, indicator, priority } );
};

export const getFieldIndicators = ( fieldType: FieldType ): ControlAdornmentsItem[] =>
	Array.from( indicatorsRegistry[ fieldType ].values() )
		.filter( ( indicator ) => indicator.fieldType === fieldType )
		.sort( ( a, b ) => a.priority - b.priority )
		.map( ( { indicator } ) => indicator );
