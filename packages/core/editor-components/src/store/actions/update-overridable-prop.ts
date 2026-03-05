import { type ComponentOverridablePropValue } from '../../prop-types/component-overridable-prop-type';
import { type OriginPropFields, type OverridableProps } from '../../types';
import { resolveOverridePropValue } from '../../utils/resolve-override-prop-value';
import { componentsActions } from '../dispatchers';
import { componentsSelectors } from '../selectors';

export function updateOverridableProp(
	componentId: number,
	propValue: ComponentOverridablePropValue,
	originPropFields?: OriginPropFields
) {
	const overridableProps = componentsSelectors.getOverridableProps(componentId);

	if (!overridableProps) {
		return;
	}

	const existingOverridableProp = overridableProps.props[propValue.override_key];

	if (!existingOverridableProp) {
		return;
	}

	const originValue = resolveOverridePropValue(propValue.origin_value);

	const newOverridableProp = originPropFields
		? {
				originValue,
				originPropFields,
			}
		: {
				originValue,
			};

	const newOverridableProps = {
		...overridableProps,
		props: {
			...overridableProps.props,
			[existingOverridableProp.overrideKey]: {
				...existingOverridableProp,
				...newOverridableProp,
			},
		},
	} satisfies OverridableProps;

	componentsActions.setOverridableProps(componentId, newOverridableProps);
}
