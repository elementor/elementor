import { useMemo } from 'react';

import { stylesRepository } from '../styles-repository';
import { type StylesProvider } from '../types';
import { useUserStylesCapability } from './use-user-styles-capability';

type CreateAction = Required< StylesProvider[ 'actions' ] >[ 'create' ];
type CreateTuple = [ StylesProvider, CreateAction ];

export function useGetStylesRepositoryCreateAction() {
	const { userCan } = useUserStylesCapability();

	return useMemo( () => {
		const createActions = stylesRepository
			.getProviders()
			.map< CreateTuple | null >( ( provider ) => {
				if ( ! provider.actions.create || ! userCan( provider.getKey() ).create ) {
					return null;
				}

				return [ provider, provider.actions.create ];
			} )
			.filter( Boolean );

		if ( createActions.length === 1 ) {
			return createActions[ 0 ];
		} else if ( createActions.length === 0 ) {
			return null;
		}
		throw new Error( 'Multiple providers with create action found in styles repository.' );
		// eslint-disable-next-line react-compiler/react-compiler
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
}
