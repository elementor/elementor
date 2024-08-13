import ReactUtils from 'elementor-utils/react';
import Launchpad from './components/launchpad';
import { ThemeProvider } from '@elementor/ui/styles';
import {
	ApolloClient,
	InMemoryCache,
	ApolloProvider,
	HttpLink,
	from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const errorLink = onError(( { graphqlErrors, networkError }) => {
	if ( graphqlErrors ) {
		graphqlErrors.map( ( { message, location, path } ) => {
			alert( `Graphql error ${ message }` );
		} );
	}
} );

const link = from([
	errorLink,
	new HttpLink( { uri: "http://headless.local/graphql" } ),
]);

const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: link,
});

function App() {
	return (
		<ApolloProvider client={ client }>
			<ThemeProvider colorScheme={ 'light' }>
				<Launchpad />
			</ThemeProvider>
		</ApolloProvider>
	);
}

const rootElement = document.querySelector( '#e-checklist' );

ReactUtils.render( (
	<App />
), rootElement );
