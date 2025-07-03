import { type ObjectPropType, type PropsSchema } from '@elementor/editor-props';

export const createTopLevelOjectType = ( { schema }: { schema: PropsSchema } ) => {
	const schemaPropType: ObjectPropType = {
		key: '',
		kind: 'object',
		meta: {},
		settings: {},
		default: null,
		shape: schema,
	};

	return schemaPropType;
};
