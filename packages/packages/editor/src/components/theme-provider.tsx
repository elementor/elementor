import { ThemeProvider as ThemeProviderBase } from '@elementor/ui';
import { useColorScheme } from '../sync/use-color-scheme';

export default function ThemeProvider( { children }: { children: React.ReactNode } ) {
	const colorScheme = useColorScheme();

	return (
		<ThemeProviderBase colorScheme={ colorScheme }>
			{ children }
		</ThemeProviderBase>
	);
}
