# Query

This package is a wrapper around `@tanstack/react-query` in order to easily expose it in the Editor.

For more information about `@tanstack/react-query` please refer to the [official documentation](https://tanstack.com/query/v4/docs/react/overview).

> [!WARNING]
> Please refrain from accessing or depending on functions and variables starting with double underscores, as they are subject to change without notice.
> Naming convention involving double underscores (`__`) as a prefix to indicate that a function or variable is meant for internal use and should not be accessed or relied upon by third-party developers.

## Usage

```tsx
import { createQueryClient, QueryClientProvider, useQuery } from '@elementor/query';

const queryClient = createQueryClient();

const App = () => (
	<QueryClientProvider client={ queryClient }>
		<MyComponent />
	</QueryClientProvider>
);

const MyComponent = () => {
	const { data: todos, isLoading } = useQuery( {
		queryKey: 'todos',
		queryFn: () => fetch( '/todos' ).then( ( res ) => res.json() ),
	} );
	
	if ( isLoading ) {
		return <div>Loading...</div>;
	}
	
	return todos.map( /* ... */ );
};
```
