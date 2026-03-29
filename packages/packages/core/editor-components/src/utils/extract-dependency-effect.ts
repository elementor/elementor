import {
	type DependencyEffect as BaseDependencyEffect,
	extractDependencyEffect as baseExtractDependencyEffect,
	getElementSettingsWithDefaults,
} from '@elementor/editor-editing-panel';
import {
	type DependencyTerm,
	isDependency,
	isDependencyMet,
	type Props,
	type PropsSchema,
	type TransformablePropValue,
} from '@elementor/editor-props';

export type DependencyEffect = BaseDependencyEffect & {
	forcedNewValue: TransformablePropValue< string > | null;
};

export function extractDependencyEffect( bind: string, propsSchema: PropsSchema, settings: Props ): DependencyEffect {
	const base = baseExtractDependencyEffect( bind, propsSchema, settings );

	const settingsWithDefaults = getElementSettingsWithDefaults( propsSchema, settings );
	const propType = propsSchema[ bind ];
	const depCheck = isDependencyMet( propType?.dependencies, settingsWithDefaults );
	const failingTerm = ! depCheck.isMet ? depCheck.failingDependencies[ 0 ] : undefined;

	const forcedNewValue =
		!! failingTerm && ! isDependency( failingTerm ) && failingTerm?.newValue
			? ( failingTerm.newValue as TransformablePropValue< string > )
			: null;

	return { ...base, forcedNewValue };
}

type Value = TransformablePropValue< string > | null;

export type DependentOverrideUpdate = {
	propKey: string;
	newValue: Value;
};

/**
 * Given the resolved settings before and after a change, compute which dependent props
 * need their override values updated due to the dependency system's newValue effect.
 *
 * This mirrors the logic in getUpdatedValues (from prop-dependency-utils) but returns
 * individual prop updates instead of writing to element settings.
 * @param root0
 * @param root0.changedPropKey
 * @param root0.previousSettings
 * @param root0.newSettings
 * @param root0.propsSchema
 * @param root0.dependenciesPerTargetMapping
 */
export function computeDependentOverrideUpdates( {
	changedPropKey,
	previousSettings,
	newSettings,
	propsSchema,
	dependenciesPerTargetMapping,
}: {
	changedPropKey: string;
	previousSettings: Props;
	newSettings: Props;
	propsSchema: PropsSchema;
	dependenciesPerTargetMapping: Record< string, string[] >;
} ): DependentOverrideUpdate[] {
	// The mapping keys are dependency paths (e.g. "link.destination"), not top-level prop keys.
	// When a top-level prop like "link" changes, all sub-paths like "link.destination" are affected.
	const allDependents = collectDependentsForProp( changedPropKey, dependenciesPerTargetMapping );

	if ( ! allDependents.length ) {
		return [];
	}

	const previousWithDefaults = getElementSettingsWithDefaults( propsSchema, previousSettings );
	const newWithDefaults = getElementSettingsWithDefaults( propsSchema, newSettings );

	const updates: DependentOverrideUpdate[] = [];

	for ( const dependent of allDependents ) {
		// Dependents can also be paths like "link.isTargetBlank" — we only handle
		// top-level props that can be overridden independently.
		const topLevelKey = dependent.split( '.' )[ 0 ];
		const propType = propsSchema[ topLevelKey ];

		if ( ! propType?.dependencies ) {
			continue;
		}

		const wasMet = isDependencyMet( propType.dependencies, previousWithDefaults ).isMet;
		const checkNow = isDependencyMet( propType.dependencies, newWithDefaults );

		if ( ! checkNow.isMet && wasMet ) {
			const termWithNewValue = checkNow.failingDependencies.find(
				( term ): term is DependencyTerm => ! isDependency( term ) && 'newValue' in term && !! term.newValue
			);

			if ( termWithNewValue?.newValue ) {
				updates.push( {
					propKey: topLevelKey,
					newValue: termWithNewValue.newValue as Value,
				} );
			}
		} else if ( checkNow.isMet && ! wasMet ) {
			// Dependency is now met (was previously unmet) — the dependent should
			// revert to its origin value. We signal this with null.
			updates.push( {
				propKey: topLevelKey,
				newValue: null,
			} );
		}
	}

	// Deduplicate by propKey (multiple sub-paths may point to the same top-level prop)
	const seen = new Set< string >();
	return updates.filter( ( update ) => {
		if ( seen.has( update.propKey ) ) {
			return false;
		}
		seen.add( update.propKey );
		return true;
	} );
}

/**
 * Collect all unique dependents for a changed prop key. The mapping keys are dependency
 * paths (e.g. "link.destination"), so changing "link" should match "link", "link.destination",
 * "link.isTargetBlank", etc.
 * @param changedPropKey
 * @param mapping
 */
function collectDependentsForProp( changedPropKey: string, mapping: Record< string, string[] > ): string[] {
	const prefix = changedPropKey + '.';
	const dependents = new Set< string >();

	for ( const [ sourcePath, deps ] of Object.entries( mapping ) ) {
		if ( sourcePath === changedPropKey || sourcePath.startsWith( prefix ) ) {
			for ( const dep of deps ) {
				dependents.add( dep );
			}
		}
	}

	return [ ...dependents ];
}
