import * as React from 'react';
import { type ComponentType, createContext, type PropsWithChildren, useContext } from 'react';
import { type PropValue } from '@elementor/editor-props';

import { useBoundProp } from './bound-prop-context';

type ControlReplacement = {
	component: ComponentType;
	condition: ( { value }: ConditionArgs ) => boolean;
};

type ConditionArgs = {
	value: PropValue;
};

type Props = PropsWithChildren< { replacements: ControlReplacement[] } >;

const ControlReplacementContext = createContext< ControlReplacement[] >( [] );

export const ControlReplacementsProvider = ( { replacements, children }: Props ) => {
	return <ControlReplacementContext.Provider value={ replacements }>{ children }</ControlReplacementContext.Provider>;
};

export const useControlReplacement = ( OriginalComponent: ComponentType ) => {
	const { value } = useBoundProp();
	const replacements = useContext( ControlReplacementContext );

	try {
		const replacement = replacements.find( ( r ) => r.condition( { value } ) );

		return replacement?.component ?? OriginalComponent;
	} catch {
		return OriginalComponent;
	}
};

export const createControlReplacementsRegistry = () => {
	const controlReplacements: ControlReplacement[] = [];

	function registerControlReplacement( replacement: ControlReplacement ) {
		controlReplacements.push( replacement );
	}

	function getControlReplacements() {
		return controlReplacements;
	}

	return { registerControlReplacement, getControlReplacements };
};

export const SlotChildren = ( {
	children,
	whitelist = [],
	sorted = false,
}: {
	children: React.ReactNode;
	whitelist?: React.FC[];
	sorted?: boolean;
} ) => {
	if ( ! whitelist.length ) {
		return children;
	}

	const filtered = React.Children.toArray( children ).filter(
		( child ) => React.isValidElement( child ) && whitelist.includes( child.type as React.FC )
	) as React.ReactElement[];

	if ( sorted ) {
		filtered.sort( ( a, b ) => {
			const aIndex = whitelist.indexOf( a.type as React.FC );
			const bIndex = whitelist.indexOf( b.type as React.FC );

			if ( aIndex === -1 || bIndex === -1 ) {
				return 0;
			}

			return aIndex - bIndex;
		} );
	}

	return (
		<>
			{ filtered.map( ( child, index ) => (
				<React.Fragment key={ index }>{ child }</React.Fragment>
			) ) }
		</>
	);
};
