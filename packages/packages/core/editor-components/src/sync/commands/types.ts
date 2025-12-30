import { type V1Element } from '@elementor/editor-elements';

import { type ComponentInstanceProp } from '../../prop-types/component-instance-prop-type';

export type CreateArgs = {
	container?: V1Element;
	model?: {
		elType?: string;
		widgetType?: string;
		settings?: {
			component_instance?: ComponentInstanceProp;
		};
	};
};

export type MoveArgs = {
	containers?: V1Element[];
	container?: V1Element;
	target?: V1Element;
};

export type PasteArgs = {
	containers?: V1Element[];
	container?: V1Element;
	storageType?: string;
};
