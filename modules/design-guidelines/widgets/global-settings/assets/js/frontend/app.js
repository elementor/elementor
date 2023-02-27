import useSettings from "./hooks/use-site-settings";
import { createContext } from "react";
import ColorsSection from "./sections/colors-section";
import FontsSection from "./sections/fonts-section";
import AreaTitle from "./components/area-title";
import AnchorProvider from "./providers/anchor-provider";
import Header from "./sections/header";
import styled from "styled-components";

export const ActiveElementContext = createContext( null );

const App = ( { config } ) => {
	const { settings, setActive } = useSettings( config.settings );

	const Content = styled.div`
      padding: 0 5% 0 5%;
	`;

	return (
		<div className='App'>
			<ActiveElementContext.Provider value={ { setActive } }>
			<AnchorProvider>
				<Header/>
				<Content>
					<AreaTitle name='colors'>global colors</AreaTitle>
					<ColorsSection title='System Colors'
					               source={ settings[ 'system_colors' ] }
					               width='191px'
					/>
					<ColorsSection title='Custom Colors'
					               source={ settings[ 'custom_colors' ] }
					               width='114px'
					/>
					<AreaTitle name='fonts'>global fonts</AreaTitle>
					<FontsSection title='System Fonts'
					              source={ settings[ 'system_typography' ] }
					/>
					<FontsSection title='Custom Fonts'
					              source={ settings[ 'custom_typography' ] }
					/>
				</Content>
			</AnchorProvider>
			</ActiveElementContext.Provider>
        </div>
	);
};

export default App;