import type { Props } from '@elementor/editor-props';
import type { CustomCss, StyleDefinition, StyleDefinitionID, StyleDefinitionVariant } from '@elementor/editor-styles';

type MakeOptional< T, K extends keyof T > = Omit< T, K > & Partial< T >;

export type Meta = Record< string, unknown >;

export type UpdateActionPayload = MakeOptional< StyleDefinition, 'label' | 'variants' | 'type' >;

export type UserCapabilities = {
	create: string;
	delete: string;
	update: string;
	updateProps: string;
};

export type UpdatePropsActionPayload = {
	id: StyleDefinitionID;
	meta: StyleDefinitionVariant[ 'meta' ];
	props: Props;
};

export type UpdateCustomCssActionPayload = {
	id: StyleDefinitionID;
	meta: StyleDefinitionVariant[ 'meta' ];
	custom_css: CustomCss;
};

export type StylesProvider = {
	getKey: () => string;
	priority: number;
	limit: number;
	subscribe: ( callback: () => void ) => () => void;
	labels: {
		singular: string | null;
		plural: string | null;
	};
	actions: {
		all: ( meta?: Meta ) => StyleDefinition[];
		get: ( id: StyleDefinitionID, meta?: Meta ) => StyleDefinition | null;
		resolveCssName: ( id: StyleDefinitionID ) => string;
		create?: ( label: StyleDefinition[ 'label' ] ) => StyleDefinitionID;
		delete?: ( id: StyleDefinitionID ) => void;
		update?: ( data: UpdateActionPayload ) => void;
		updateProps?: ( args: UpdatePropsActionPayload, meta?: Meta ) => void;
		updateCustomCss?: ( args: UpdateCustomCssActionPayload, meta?: Meta ) => void;
	};
	capabilities?: UserCapabilities;
};
