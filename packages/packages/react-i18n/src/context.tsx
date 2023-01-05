import { createContext, useContext, PropsWithChildren } from 'react';
import { I18n } from './types';

const I18nContext = createContext<I18n | null>( null );

type I18nContextProviderProps = PropsWithChildren<{
    i18n: I18n;
}>;

export function I18nContextProvider( { i18n, children }: I18nContextProviderProps ) {
	return (
		<I18nContext.Provider value={ i18n }>
			{ children }
		</I18nContext.Provider>
	);
}

export function useI18n() {
	const value = useContext( I18nContext );

	if ( ! value ) {
		throw new Error( 'useI18n must be used within a I18nContextProvider' );
	}

	return value;
}
