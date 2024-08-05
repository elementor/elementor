import { ThemeProvider } from "@elementor/ui/styles";
import Launchpad from "./components/launchpad";

const App = () =>  {
	return (
		<ThemeProvider colorScheme={ 'light' }>
			<Launchpad />
		</ThemeProvider>
	);
}

export default App
