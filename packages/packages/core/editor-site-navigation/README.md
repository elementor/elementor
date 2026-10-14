# Editor Site Navigation

> [!WARNING]
> This package is under development and not ready for production use.

## Code examples

**Get all pages and create a new one:**

```
import * as React from 'react';
import { useEffect } from 'react';
import { usePosts } from './use-posts';

const PageList = () => {
	const { getPosts: getPages, createPost: createPage, isLoading, posts } = usePosts( 'page' );

	useEffect( () => {
		getPages();
	}, [ getPages ] );

	const createNewPage = () => {
		const newPage = {
			title: 'New Page',
			content: 'This is a demo page',
			status: 'publish',
		};

		createPage( newPage );
	};

	if ( isLoading ) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>Pages</h1>
			<button onClick={ createNewPage }>Create New Page</button>
			<ul>
				{
					posts.map( ( page ) => (
						<li key={ page.id }>{ page.title }</li>
					) )
				}
			</ul>
		</div>
	);
};

export default PageList;
```
