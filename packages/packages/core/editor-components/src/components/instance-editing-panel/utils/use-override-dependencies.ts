import { useMemo } from 'react';
import {
	type DependencyEffect,
	extractDependencyEffect,
	extractOrderedDependencies,
	getElementSettingsWithDefaults,
	getUpdatedValues,
} from '@elementor/editor-editing-panel';
import { type ElementType } from '@elementor/editor-elements';
import { type PropValue } from '@elementor/editor-props';

import { type ElementSettings } from './resolve-element-settings';

type OverrideDependenciesResult = DependencyEffect & {
	propValue: PropValue;
};

export function useOverrideDependencies( {
	elementType,
	elementSettings,
	elementId,
	propKey,
}: {
	elementType: ElementType;
	elementSettings: ElementSettings;
	elementId: string;
	propKey: string;
} ): OverrideDependenciesResult {
	return useMemo( () => {
		const resolvedSettingsWithDefaults = getElementSettingsWithDefaults( elementType.propsSchema, elementSettings );

		const dependents = extractOrderedDependencies( elementType.dependenciesPerTargetMapping ?? {} );

		const settingsWithDepsNewValues = getUpdatedValues(
			elementSettings,
			dependents,
			elementType.propsSchema,
			resolvedSettingsWithDefaults,
			elementId
		);

		const propValue = settingsWithDepsNewValues[ propKey ];

		const { isDisabled, isHidden } = extractDependencyEffect(
			propKey,
			elementType.propsSchema,
			settingsWithDepsNewValues
		);

		return {
			propValue,
			isDisabled,
			isHidden,
		};
	}, [ elementType.propsSchema, elementType.dependenciesPerTargetMapping, elementSettings, elementId, propKey ] );
}
