import PropTypes from 'prop-types';
import { createContext, useReducer, useContext, useEffect } from 'react';
import useImageSize from '../hooks/use-image-size';
import { getAspectRatioSizes } from '../utils';

export const EditImageContext = createContext( {} );

const SET_STATE = 'SET_STATE';
export const SET_ASPECT_RATIO = 'SET_ASPECT_RATIO';
export const SET_LOADING = 'SET_LOADING';
export const RESET = 'RESET';

const initialValue = {
	id: '',
	url: '',
	isLoading: false,
	aspectRatio: '1:1',
};

const reducer = ( state, { type, payload } ) => {
	switch ( type ) {
		case SET_STATE:
			return {
				...state,
				...payload,
			};
		case SET_ASPECT_RATIO:
			return {
				...state,
				aspectRatio: payload,
			};
		case SET_LOADING:
			return {
				...state,
				isLoading: payload,
			};
		case RESET:
			return initialValue;
		default:
			throw Error( 'Unknown action.' );
	}
};

export const EditImageProvider = ( { children, imageData } ) => {
	const initialData = { ...initialValue, ...imageData };
	const [ state, dispatch ] = useReducer( reducer, initialData );

	return (
		<EditImageContext.Provider value={ { state, dispatch } }>
			{ children }
		</EditImageContext.Provider>
	);
};

EditImageProvider.propTypes = {
	children: PropTypes.node,
	imageData: PropTypes.object,
};

export const useEditImage = () => {
	const { state, dispatch } = useContext( EditImageContext );

	const { id, url, aspectRatio, isLoading } = state;

	const { width, height } = useImageSize( aspectRatio );

	const setEditImage = ( payload ) => dispatch( { type: SET_STATE, payload } );

	const setAspectRatio = ( payload ) => dispatch( { type: SET_ASPECT_RATIO, payload } );

	const reset = () => dispatch( { type: RESET } );

	// Getting the aspect ratio of the image.
	useEffect( () => {
		if ( ! id ) {
			return;
		}

		dispatch( { type: SET_LOADING, payload: true } );

		const img = new Image();

		img.src = url;

		img.onload = () => {
			const { ratio } = getAspectRatioSizes( img.width, img.height );

			dispatch( {
				type: SET_STATE,
				payload: { aspectRatio: ratio, isLoading: false },
			} );
		};
	}, [ id ] );

	return {
		editImage: state,
		isLoading,
		aspectRatio,
		width,
		height,
		setEditImage,
		setAspectRatio,
		reset,
	};
};
