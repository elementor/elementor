import { ThemeProvider as ThemeProviderBase } from '@elementor/ui';
import { useEffect, useState } from 'react';
import { commandEndEvent, CommandEvent, listenTo, v1ReadyEvent } from '@elementor/v1-adapters';

export default function ThemeProvider( { children }: { children: React.ReactNode } ) {
	const colorScheme = useColorScheme();

	return (
		<ThemeProviderBase colorScheme={ colorScheme }>
			{ children }
		</ThemeProviderBase>
	);
}

export type ColorScheme = 'auto' | 'dark' | 'light';

export type ExtendedWindow = Window & {
	elementor: {
		settings: {
			editorPreferences: {
				model: {
					get: ( key: 'ui_theme' ) => ColorScheme,
				}
			}
		}
	}
}

export function useColorScheme() {
	const [ colorScheme, setColorScheme ] = useState<ColorScheme>( () => getV1ColorScheme() );

	useEffect( () => {
		const unsubscribeFromV1Ready = listenTo(
			v1ReadyEvent(),
			() => setColorScheme( getV1ColorScheme() )
		);

		const unsubscribeFromCommand = listenTo(
			commandEndEvent( 'document/elements/settings' ),
			( e ) => {
				const event = e as CommandEvent<{
					container: {
						id: string,
					},
					settings: {
						ui_theme?: ColorScheme,
					},
				}>;

				const isUserPreferences = event.args?.container?.id === 'editorPreferences_settings';
				const isColorScheme = event.args?.settings && 'ui_theme' in event.args.settings;

				if ( isUserPreferences && isColorScheme ) {
					setColorScheme( getV1ColorScheme() );
				}
			}
		);

		return () => {
			unsubscribeFromV1Ready();
			unsubscribeFromCommand();
		};
	}, [] );

	return colorScheme;
}

function getV1ColorScheme() {
	return ( window as unknown as ExtendedWindow )
		.elementor
		?.settings
		?.editorPreferences
		?.model
		?.get?.( 'ui_theme' ) || 'auto';
}
