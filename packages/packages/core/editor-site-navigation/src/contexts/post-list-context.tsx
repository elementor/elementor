import * as React from 'react';
import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useState } from 'react';

import { type Slug } from '../api/post';

type EditMode =
	| {
			mode: 'rename';
			details: {
				postId: number;
			};
	  }
	| {
			mode: 'create';
			details: Record< string, never >;
	  }
	| {
			mode: 'duplicate';
			details: {
				postId: number;
				title: string;
			};
	  }
	| {
			mode: 'none';
			details: Record< string, never >;
	  };

type ContextType = {
	type: Slug;
	editMode: EditMode;
	setEditMode: Dispatch< SetStateAction< EditMode > >;
	resetEditMode: () => void;
	setError: () => void;
};

const defaultValues: ContextType = {
	type: 'page',
	editMode: { mode: 'none', details: {} },
	setEditMode: () => null,
	resetEditMode: () => null,
	setError: () => null,
};

const PostListContext = createContext< ContextType >( defaultValues );

export const PostListContextProvider = ( {
	type,
	setError,
	children,
}: {
	type: ContextType[ 'type' ];
	setError: ContextType[ 'setError' ];
	children: ReactNode;
} ) => {
	const [ editMode, setEditMode ] = useState( defaultValues.editMode );

	const resetEditMode = () => {
		setEditMode( defaultValues.editMode );
	};

	return (
		<PostListContext.Provider
			value={ {
				type,
				editMode,
				setEditMode,
				resetEditMode,
				setError,
			} }
		>
			{ children }
		</PostListContext.Provider>
	);
};

export function usePostListContext() {
	const context = useContext( PostListContext );

	if ( ! context ) {
		throw new Error( 'The `usePostListContext()` hook must be used within an `<PostListContextProvider />`' );
	}

	return context;
}
