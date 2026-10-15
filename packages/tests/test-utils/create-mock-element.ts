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
	children = [],
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
			get: ( key: string ) => {
				return model[ key as keyof typeof model ] as never;
			},
			set: jest.fn().mockImplementation( ( key: keyof typeof model, value ) => {
				model[ key as keyof typeof model ] = value as never;
			} ),
			toJSON: () => model,
		},
		settings: {
			get: ( key: string ) => {
				return partialSettings[ key ];
			},
			set: ( key: string, value: unknown ) => {
				partialSettings[ key as keyof typeof partialSettings ] = value as never;
			},
			toJSON: () => partialSettings,
		},
		view,
		parent,
		children,
	};
}

export function createMockElementType( {
	key = '',
	title = '',
	controls = [],
	propsSchema = {},
	dependenciesPerTargetMapping = {},
	styleStates = [],
	pseudoStates = [],
}: Partial< ElementType > = {} ) {
	return {
		key,
		title,
		controls,
		propsSchema,
		dependenciesPerTargetMapping,
		styleStates,
		pseudoStates,
	} as ElementType;
}
