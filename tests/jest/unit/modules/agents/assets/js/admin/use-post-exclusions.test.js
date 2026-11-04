import { useState } from 'react';
import { act, renderHook } from '@testing-library/react';

import { saveAgentReadySettings } from 'elementor/modules/agents/assets/js/admin/api';
import { MAX_EXCLUDED_POSTS } from 'elementor/modules/agents/assets/js/admin/constants';
import { EXCLUSIONS_SAVE_DEBOUNCE_MS, usePostExclusions } from 'elementor/modules/agents/assets/js/admin/hooks/use-post-exclusions';

jest.mock( 'elementor/modules/agents/assets/js/admin/api', () => ( {
	saveAgentReadySettings: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
	sprintf: ( format, ...args ) => args.reduce( ( text, arg ) => text.replace( /%(\d\$)?[sd]/, arg ), format ),
} ) );

const SETTINGS_KEY = 'llms_txt';
const INITIAL_EXCLUDED_ID = 7;
const PAGE_ID = 11;
const SECOND_PAGE_ID = 12;

const initialPostTypes = [
	{ name: 'page', label: 'Pages', count: 3, included: true, excludedCount: 1 },
	{ name: 'post', label: 'Posts', count: 2, included: true, excludedCount: 0 },
];

const renderExclusions = ( onSaved = jest.fn() ) => renderHook( () => {
	const [ postTypes, setPostTypes ] = useState( initialPostTypes );
	const [ saveError, setSaveError ] = useState( '' );
	const exclusions = usePostExclusions( {
		settingsKey: SETTINGS_KEY,
		initialExcludedPostIds: [ INITIAL_EXCLUDED_ID ],
		initialPostTypes,
		setPostTypes,
		setSaveError,
		onSaved,
	} );

	return { ...exclusions, postTypes, saveError };
} );

const getExcludedCount = ( result, name ) => result.current.postTypes.find( ( postType ) => postType.name === name ).excludedCount;

const waitForDebouncedSave = () => act( async () => {
	jest.advanceTimersByTime( EXCLUSIONS_SAVE_DEBOUNCE_MS );
} );

describe( 'usePostExclusions', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		saveAgentReadySettings.mockReset().mockResolvedValue( {} );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'saves every toggle made within the debounce window as one list of excluded ids', async () => {
		// Arrange
		const onSaved = jest.fn();
		const { result } = renderExclusions( onSaved );

		// Act
		act( () => result.current.togglePostExclusion( 'page', PAGE_ID ) );
		act( () => result.current.togglePostExclusion( 'page', SECOND_PAGE_ID ) );

		// Assert
		expect( result.current.excludedPostIds ).toEqual( [ INITIAL_EXCLUDED_ID, PAGE_ID, SECOND_PAGE_ID ] );
		expect( getExcludedCount( result, 'page' ) ).toBe( 3 );
		expect( saveAgentReadySettings ).not.toHaveBeenCalled();

		// Act
		await waitForDebouncedSave();

		// Assert
		expect( saveAgentReadySettings ).toHaveBeenCalledTimes( 1 );
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			[ SETTINGS_KEY ]: { excluded_post_ids: [ INITIAL_EXCLUDED_ID, PAGE_ID, SECOND_PAGE_ID ] },
		} );
		expect( onSaved ).toHaveBeenCalledTimes( 1 );
		expect( result.current.exclusionsSavedVersion ).toBe( 1 );
	} );

	it( 'includes an excluded post again and lowers the count', async () => {
		// Arrange
		const { result } = renderExclusions();

		// Act
		act( () => result.current.togglePostExclusion( 'page', INITIAL_EXCLUDED_ID ) );
		await waitForDebouncedSave();

		// Assert
		expect( result.current.excludedPostIds ).toEqual( [] );
		expect( getExcludedCount( result, 'page' ) ).toBe( 0 );
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( { [ SETTINGS_KEY ]: { excluded_post_ids: [] } } );
	} );

	it( 'skips the save when the toggles cancel each other out', async () => {
		// Arrange
		const { result } = renderExclusions();

		// Act
		act( () => result.current.togglePostExclusion( 'post', PAGE_ID ) );
		act( () => result.current.togglePostExclusion( 'post', PAGE_ID ) );
		await waitForDebouncedSave();

		// Assert
		expect( saveAgentReadySettings ).not.toHaveBeenCalled();
		expect( getExcludedCount( result, 'post' ) ).toBe( 0 );
	} );

	it( 'saves right away when flushed, without waiting for the debounce', async () => {
		// Arrange
		const { result } = renderExclusions();
		act( () => result.current.togglePostExclusion( 'post', PAGE_ID ) );

		// Act
		await act( () => result.current.flushExclusions() );

		// Assert
		expect( saveAgentReadySettings ).toHaveBeenCalledWith( {
			[ SETTINGS_KEY ]: { excluded_post_ids: [ INITIAL_EXCLUDED_ID, PAGE_ID ] },
		} );
	} );

	it( 'refuses new exclusions past the limit and shows an error', async () => {
		// Arrange
		const fullList = Array.from( { length: MAX_EXCLUDED_POSTS }, ( _, index ) => index + 1 );
		const { result } = renderHook( () => {
			const [ , setPostTypes ] = useState( initialPostTypes );
			const [ saveError, setSaveError ] = useState( '' );
			const exclusions = usePostExclusions( {
				settingsKey: SETTINGS_KEY,
				initialExcludedPostIds: fullList,
				initialPostTypes,
				setPostTypes,
				setSaveError,
			} );

			return { ...exclusions, saveError };
		} );

		// Act
		act( () => result.current.togglePostExclusion( 'page', MAX_EXCLUDED_POSTS + 1 ) );
		await waitForDebouncedSave();

		// Assert
		expect( result.current.excludedPostIds ).toEqual( fullList );
		expect( result.current.saveError ).toBe( `You can exclude up to ${ MAX_EXCLUDED_POSTS } items.` );
		expect( saveAgentReadySettings ).not.toHaveBeenCalled();
	} );

	it( 'restores the last saved exclusions and shows the error when the save fails', async () => {
		// Arrange
		const serverError = 'Failed to update setting.';
		saveAgentReadySettings.mockRejectedValue( { message: serverError } );
		const { result } = renderExclusions();

		// Act
		act( () => result.current.togglePostExclusion( 'post', PAGE_ID ) );
		await waitForDebouncedSave();

		// Assert
		expect( result.current.excludedPostIds ).toEqual( [ INITIAL_EXCLUDED_ID ] );
		expect( getExcludedCount( result, 'post' ) ).toBe( 0 );
		expect( getExcludedCount( result, 'page' ) ).toBe( 1 );
		expect( result.current.saveError ).toBe( serverError );
	} );
} );
