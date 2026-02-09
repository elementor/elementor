import { type ObjectPropType, type PropsSchema } from '../types';

export const createTopLevelObjectType = ( { schema }: { schema: PropsSchema } ) => {
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
