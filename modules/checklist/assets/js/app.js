import { ThemeProvider } from "@elementor/ui/styles";
import Launchpad from "./components/launchpad";

console.log('app fuck my life');

const App = () =>  {
	return (
		<ThemeProvider colorScheme={ 'light' }>
			<Launchpad />
		</ThemeProvider>
	);
}

export default App
