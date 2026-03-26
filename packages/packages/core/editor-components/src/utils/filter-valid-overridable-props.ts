import { type OverridableProp, type OverridableProps } from '../types';
import { walkDownOverridesChain } from './walk-down-overrides-chain';

export function filterValidOverridableProps(
	overridableProps: OverridableProps,
	// instanceElementId is used to find the component inner elements,
	// and should be passed when editing component instance (not in component edit mode)
	instanceElementId?: string
): OverridableProps {
	const validProps: Record< string, OverridableProp > = {};

	for ( const [ key, prop ] of Object.entries( overridableProps.props ) ) {
		if ( isExposedPropValid( prop, instanceElementId ) ) {
			validProps[ key ] = prop;
		}
	}

	const validPropKeys = new Set( Object.keys( validProps ) );
	const filteredGroups = {
		items: Object.fromEntries(
			Object.entries( overridableProps.groups.items ).map( ( [ groupId, group ] ) => [
				groupId,
				{ ...group, props: group.props.filter( ( propKey ) => validPropKeys.has( propKey ) ) },
			] )
		),
		order: overridableProps.groups.order,
	};

	return { props: validProps, groups: filteredGroups };
}

export function isExposedPropValid( prop: OverridableProp, instanceElementId?: string ): boolean {
	const { isChainBroken } = walkDownOverridesChain( {
		upperLevelOverridableProp: prop,
		upperInstanceId: instanceElementId,
	} );

	return ! isChainBroken;
}
