import {
	type ElementType,
	type V1Element,
	type V1ElementModelProps,
	type V1ElementSettingsProps,
} from '@elementor/editor-elements';

type MockElementProps = {
	model?: Partial< V1ElementModelProps >;
	settings?: Partial< V1ElementSettingsProps >;
	children?: V1Element[];
	view?: V1Element[ 'view' ];
	parent?: V1Element;
};
export function createMockElement( {
	model: partialModel = {},
	settings: partialSettings = {},
	view,
	parent,
}: MockElementProps ): V1Element {
	const model = {
		elType: 'widget',
		id: '1',
		...partialModel,
	};

	return {
		id: model.id,
		model: {
			get: ( key ) => {
				return model[ key ];
			},
			set: ( key, value ) => {
				model[ key ] = value;
			},
			toJSON: () => model,
		},
		settings: {
			get: ( key ) => {
				return partialSettings[ key ];
			},
			set: ( key, value ) => {
				partialSettings[ key ] = value;
			},
			toJSON: () => partialSettings,
		},
		view,
		parent,
	};
}

export function createMockElementType( {
	key = '',
	title = '',
	controls = [],
	propsSchema = {},
	dependenciesPerTargetMapping = {},
}: Partial< ElementType > = {} ) {
	return {
		key,
		title,
		controls,
		propsSchema,
		dependenciesPerTargetMapping,
	} as ElementType;
}
