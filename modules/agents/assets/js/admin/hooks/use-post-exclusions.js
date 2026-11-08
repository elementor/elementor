import { useCallback, useEffect, useRef, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';

import { saveAgentReadySettings } from '../api';
import { MAX_EXCLUDED_POSTS } from '../constants';
import { getSaveErrorMessage } from './get-save-error-message';

export const EXCLUSIONS_SAVE_DEBOUNCE_MS = 500;

const getExcludedCounts = ( postTypes ) => Object.fromEntries(
	postTypes.map( ( postType ) => [ postType.name, postType.excludedCount ?? 0 ] ),
);

const isSameList = ( first, second ) => first.length === second.length &&
	first.every( ( id, index ) => id === second[ index ] );

const withExcludedCounts = ( postTypes, counts ) => postTypes.map( ( postType ) => (
	Object.prototype.hasOwnProperty.call( counts, postType.name )
		? { ...postType, excludedCount: counts[ postType.name ] }
		: postType
) );

export const usePostExclusions = ( { settingsKey, initialExcludedPostIds = [], initialPostTypes, setPostTypes, setSaveError, onSaved } ) => {
	const [ excludedPostIds, setExcludedPostIds ] = useState( initialExcludedPostIds );
	const [ savedVersion, setSavedVersion ] = useState( 0 );
	const currentRef = useRef( { ids: initialExcludedPostIds, counts: getExcludedCounts( initialPostTypes ) } );
	const savedRef = useRef( currentRef.current );
	const timerRef = useRef( null );
	const queueRef = useRef( Promise.resolve() );
	const onSavedRef = useRef( onSaved );

	useEffect( () => {
		onSavedRef.current = onSaved;
	} );

	useEffect( () => () => clearTimeout( timerRef.current ), [] );

	const restoreSaved = useCallback( ( reason ) => {
		currentRef.current = savedRef.current;
		setExcludedPostIds( savedRef.current.ids );
		setPostTypes( ( postTypes ) => withExcludedCounts( postTypes, savedRef.current.counts ) );
		setSaveError( getSaveErrorMessage( reason ) );
	}, [ setPostTypes, setSaveError ] );

	const persist = useCallback( () => {
		timerRef.current = null;

		queueRef.current = queueRef.current.then( () => {
			const pending = currentRef.current;

			if ( isSameList( pending.ids, savedRef.current.ids ) ) {
				return;
			}

			return saveAgentReadySettings( { [ settingsKey ]: { excluded_post_ids: pending.ids } } )
				.then( () => {
					savedRef.current = pending;
					setSavedVersion( ( version ) => version + 1 );
					onSavedRef.current?.();
				} )
				.catch( restoreSaved );
		} );

		return queueRef.current;
	}, [ settingsKey, restoreSaved ] );

	const togglePostExclusion = useCallback( ( postTypeName, postId ) => {
		const { ids, counts } = currentRef.current;
		const isExcluded = ids.includes( postId );

		if ( ! isExcluded && ids.length >= MAX_EXCLUDED_POSTS ) {
			setSaveError( sprintf(
				/* Translators: %d: Maximum number of excluded items. */
				__( 'You can exclude up to %d items.', 'elementor' ),
				MAX_EXCLUDED_POSTS,
			) );

			return;
		}

		const nextCounts = { ...counts, [ postTypeName ]: Math.max( 0, ( counts[ postTypeName ] ?? 0 ) + ( isExcluded ? -1 : 1 ) ) };

		currentRef.current = {
			ids: isExcluded ? ids.filter( ( id ) => id !== postId ) : [ ...ids, postId ],
			counts: nextCounts,
		};

		setExcludedPostIds( currentRef.current.ids );
		setPostTypes( ( postTypes ) => withExcludedCounts( postTypes, { [ postTypeName ]: nextCounts[ postTypeName ] } ) );
		setSaveError( '' );

		clearTimeout( timerRef.current );
		timerRef.current = setTimeout( persist, EXCLUSIONS_SAVE_DEBOUNCE_MS );
	}, [ persist, setPostTypes, setSaveError ] );

	const flushExclusions = useCallback( () => {
		if ( ! timerRef.current ) {
			return queueRef.current;
		}

		clearTimeout( timerRef.current );

		return persist();
	}, [ persist ] );

	return {
		excludedPostIds,
		exclusionsSavedVersion: savedVersion,
		flushExclusions,
		togglePostExclusion,
	};
};
