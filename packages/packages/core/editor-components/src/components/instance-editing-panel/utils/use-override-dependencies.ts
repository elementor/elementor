import { useMemo } from 'react';
import {
	type DependencyEffect,
	extractDependencyEffect,
	extractOrderedDependencies,
	getElementSettingsWithDefaults,
	getUpdatedValues,
} from '@elementor/editor-editing-panel';
import { type ElementType } from '@elementor/editor-elements';
import { type AnyTransformable } from '@elementor/editor-props';

import { type ComponentInstanceOverride } from '../../../prop-types/component-instance-overrides-prop-type';
import { resolveOverridePropValue } from '../../../utils/resolve-override-prop-value';
import { type ElementSettings } from './resolve-element-settings';

type OverrideDependenciesResult = DependencyEffect & {
	overrideValue: AnyTransformable | null;
};

export function useOverrideControlDependencies( {
	existingOverride,
	resolvedElementSettings,
	elementId,
	elementType,
	propKey,
}: {
	existingOverride: ComponentInstanceOverride | null;
	resolvedElementSettings: ElementSettings;
	elementType: ElementType;
	elementId: string;
	propKey: string;
} ): OverrideDependenciesResult {
	return useMemo( () => {
		const { isDisabled, isHidden } = extractDependencyEffect(
			propKey,
			elementType.propsSchema,
			resolvedElementSettings
		);

		const existingOverrideValue = existingOverride ? resolveOverridePropValue( existingOverride ) : null;
		const settingsForDepsNewValuesCalculation = { ...resolvedElementSettings, [ propKey ]: existingOverrideValue };

		const resolvedSettingsWithDefaults = getElementSettingsWithDefaults(
			elementType.propsSchema,
			settingsForDepsNewValuesCalculation
		);

		const dependents = extractOrderedDependencies( elementType.dependenciesPerTargetMapping ?? {} );

		const settingsWithDepsNewValues = getUpdatedValues(
			settingsForDepsNewValuesCalculation,
			dependents,
			elementType.propsSchema,
			resolvedSettingsWithDefaults,
			elementId
		);

		const overrideValue = settingsWithDepsNewValues[ propKey ];

		return {
			overrideValue,
			isDisabled,
			isHidden,
		};
	}, [
		existingOverride,
		resolvedElementSettings,
		propKey,
		elementType.propsSchema,
		elementType.dependenciesPerTargetMapping,
		elementId,
	] );
}
