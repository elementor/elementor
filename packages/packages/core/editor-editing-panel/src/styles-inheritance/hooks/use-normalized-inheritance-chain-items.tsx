import { isValidElement, type ReactNode, useEffect, useState } from 'react';
import { type PropsResolver } from '@elementor/editor-canvas';
import { type PropKey } from '@elementor/editor-props';
import { type StyleDefinitionVariant } from '@elementor/editor-styles';
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY } from '@elementor/editor-styles-repository';
import { __ } from '@wordpress/i18n';

import { type SnapshotPropValue } from '../types';

const MAXIMUM_ITEMS = 2;

type NormalizedItem = {
	id: string | number;
	provider: string;
	breakpoint?: StyleDefinitionVariant[ 'meta' ][ 'breakpoint' ];
	displayLabel: string;
	value: ReactNode | string;
};

export const useNormalizedInheritanceChainItems = (
	inheritanceChain: SnapshotPropValue[],
	bind: PropKey,
	resolve: PropsResolver
) => {
	const [ items, setItems ] = useState< NormalizedItem[] >( [] );

	useEffect( () => {
		( async () => {
			const normalizedItems = await Promise.all(
				inheritanceChain
					.filter( ( { style } ) => style )
					.map( ( item, index ) => normalizeInheritanceItem( item, index, bind, resolve ) )
			);

			const validItems = normalizedItems
				.map( ( item ) => ( {
					...item,
					displayLabel:
						ELEMENTS_BASE_STYLES_PROVIDER_KEY !== item.provider
							? item.displayLabel
							: __( 'Base', 'elementor' ),
				} ) )
				.filter( ( item ) => ! item.value || item.displayLabel !== '' )
				.slice( 0, MAXIMUM_ITEMS );

			setItems( validItems );
		} )();
	}, [ inheritanceChain, bind, resolve ] );

	return items;
};

const DEFAULT_BREAKPOINT = 'desktop';

export const normalizeInheritanceItem = async (
	item: SnapshotPropValue,
	index: number,
	bind: PropKey,
	resolve: PropsResolver
): Promise< NormalizedItem > => {
	const {
		variant: {
			meta: { state, breakpoint },
		},
		style: { label, id },
	} = item;

	const displayLabel = `${ label }${ state ? ':' + state : '' }`;

	return {
		id: id ? id + ( state ?? '' ) : index,
		provider: item.provider || '',
		breakpoint: breakpoint ?? DEFAULT_BREAKPOINT,
		displayLabel,
		value: await getTransformedValue( item, bind, resolve ),
	};
};

const getTransformedValue = async (
	item: SnapshotPropValue,
	bind: PropKey,
	resolve: PropsResolver
): Promise< ReactNode | string > => {
	try {
		const result = await resolve( {
			props: {
				[ bind ]: item.value,
			},
		} );

		const value = result?.[ bind ] ?? result;

		if ( isValidElement( value ) ) {
			return value;
		}

		if ( typeof value === 'object' ) {
			return JSON.stringify( value );
		}

		return String( value );
	} catch {
		return '';
	}
};
