import { useEffect, useState } from 'react';
import { commandEndEvent, CommandEvent, listenTo, v1ReadyEvent } from '@elementor/v1-adapters';

export type ColorScheme = 'auto' | 'dark' | 'light';

export type ExtendedWindow = Window & {
	elementor: {
		getPreferences: ( key: 'ui_theme' ) => ColorScheme,
	}
}

export function useColorScheme() {
	const [ colorScheme, setColorScheme ] = useState<ColorScheme>( () => getV1ColorScheme() );

	useEffect( () => {
		return listenTo(
			v1ReadyEvent(),
			() => setColorScheme( getV1ColorScheme() )
		);
	}, [] );

	useEffect( () => {
		return listenTo(
			commandEndEvent( 'document/elements/settings' ),
			( e ) => {
				const event = e as CommandEvent<{
					settings: {
						ui_theme?: ColorScheme,
					},
				}>;

				// The User-Preferences settings object has a key named `ui_theme` that controls the color scheme.
				const isColorScheme = event.args?.settings && 'ui_theme' in event.args.settings;

				if ( isColorScheme ) {
					setColorScheme( getV1ColorScheme() );
				}
			}
		);
	}, [] );

	return colorScheme;
}

function getV1ColorScheme() {
	return ( window as unknown as ExtendedWindow ).elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
}
