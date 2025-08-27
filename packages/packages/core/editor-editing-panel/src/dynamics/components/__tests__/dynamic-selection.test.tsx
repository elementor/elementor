import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { usePersistDynamicValue } from '../../../hooks/use-persist-dynamic-value';
import { usePropDynamicTags } from '../../hooks/use-prop-dynamic-tags';
import { getAtomicDynamicTags } from '../../sync/get-atomic-dynamic-tags';
import { type DynamicTag } from '../../types';
import { DynamicSelection } from '../dynamic-selection';

jest.mock( '../../hooks/use-prop-dynamic-tags' );
jest.mock( '../../sync/get-atomic-dynamic-tags' );
jest.mock( '../../../hooks/use-persist-dynamic-value' );

describe( '<DynamicSelection />', () => {
	const originalGetBoundingClientRect = globalThis.Element.prototype.getBoundingClientRect;

	beforeEach( () => {
		globalThis.Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue( { height: 1000, width: 1000 } );

		jest.mocked( usePersistDynamicValue ).mockReturnValue( [ null, jest.fn(), jest.fn() ] );
	} );

	afterEach( () => {
		jest.clearAllMocks();
		jest.resetAllMocks();

		globalThis.Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
	} );

	it.skip( 'should render search input with the initial list of dynamic tags and their respective group titles', () => {
		// TODO: Fix me!
		// Arrange.
		jest.mocked( getAtomicDynamicTags ).mockReturnValue( {
			groups: {
				group1: { title: 'Group 1 Title' },
				group2: { title: 'Group 2 Title' },
				group3: { title: 'Group 3 Title' },
			},
		} as never );

		jest.mocked( usePropDynamicTags ).mockReturnValue(
			mockDynamicTags( [
				{ name: 'tag1', label: 'Tag 1', group: 'group1' },
				{ name: 'tag2', label: 'Tag 2', group: 'group1' },
				{ name: 'tag3', label: 'Tag 3', group: 'unknown' },
			] )
		);

		const props = {
			value: { $$type: 'dynamic', value: {} },
			propType: createMockPropType( { kind: 'object' } ),
		};

		// Act.
		renderControl( <DynamicSelection close={ jest.fn() } />, props );

		// Assert.
		expect( screen.getByRole( 'textbox' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Tag 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Tag 2' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Group 1 Title' ) ).toBeInTheDocument();
		// if we cant find the group label, show its name:
		expect( screen.getByText( 'unknown' ) ).toBeInTheDocument();
	} );

	it.skip( 'should categorize dynamic tags by group', () => {
		// TODO: Fix me!
		// Arrange.
		jest.mocked( getAtomicDynamicTags ).mockReturnValue( {
			groups: {
				group1: { title: 'Group 1 Title' },
				group2: { title: 'Group 2 Title' },
				group3: { title: 'Group 3 Title' },
			},
		} as never );

		jest.mocked( usePropDynamicTags ).mockReturnValue(
			mockDynamicTags( [
				{ name: 'tag1', label: 'Tag 1', group: 'group1' },
				{ name: 'tag2', label: 'Tag 2', group: 'group1' },
				{ name: 'tag3', label: 'Tag 3', group: 'group2' },
			] )
		);

		const props = {
			value: { $$type: 'dynamic', value: {} },
			propType: createMockPropType( { kind: 'object' } ),
		};

		// Act.
		renderControl( <DynamicSelection close={ jest.fn() } />, props );

		// eslint-disable-next-line testing-library/no-node-access
		const [ category1, tag1, tag2, category2, tag3 ] = document.querySelectorAll( 'li' );

		// Assert.
		expect( category1 ).toHaveTextContent( 'Group 1 Title' );
		expect( tag1 ).toHaveTextContent( 'Tag 1' );
		expect( tag2 ).toHaveTextContent( 'Tag 2' );
		expect( category2 ).toHaveTextContent( 'Group 2 Title' );
		expect( tag3 ).toHaveTextContent( 'Tag 3' );
	} );

	it.skip( 'should filter dynamic tags and groups by search value, and keep it sorted and grouped by category', () => {
		// TODO: Fix me!
		// Arrange.
		jest.mocked( getAtomicDynamicTags ).mockReturnValue( {
			groups: {
				group1: { title: 'Group 1 Title' },
				group2: { title: 'Group 2 Title' },
				group3: { title: 'Group 3 Title' },
			},
		} as never );

		jest.mocked( usePropDynamicTags ).mockReturnValue(
			mockDynamicTags( [
				{ name: 'tag1', label: 'A', group: 'group1' },
				{ name: 'tag2', label: 'ABCD', group: 'group2' },
				{ name: 'tag3', label: 'ABCDE', group: 'group2' },
				{ name: 'tag4', label: 'AB', group: 'group3' },
				{ name: 'tag5', label: 'ABC', group: 'group3' },
			] )
		);

		const props = {
			value: {},
			propType: createMockPropType( { kind: 'object' } ),
		};

		// Act.
		renderControl( <DynamicSelection close={ jest.fn() } />, props );

		const searchInput = screen.getByRole( 'textbox' );
		fireEvent.change( searchInput, { target: { value: 'ABC' } } );

		// Assert.
		// eslint-disable-next-line testing-library/no-node-access
		const [ category2, tag2, tag3, category3, tag5 ] = document.querySelectorAll( 'li' );
		expect( category2 ).toHaveTextContent( 'Group 2 Title' );
		expect( tag2 ).toHaveTextContent( 'ABCD' );
		expect( tag3 ).toHaveTextContent( 'ABCDE' );
		expect( category3 ).toHaveTextContent( 'Group 3 Title' );
		expect( tag5 ).toHaveTextContent( 'ABC' );

		expect( screen.queryByText( 'A' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Group 1 Title' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'AB' ) ).not.toBeInTheDocument();
	} );

	it( 'should show empty state message when no dynamic tags are found, with clear button', () => {
		// Arrange.
		jest.mocked( usePropDynamicTags ).mockReturnValue(
			mockDynamicTags( [
				{ name: 'tag1', label: 'A', group: 'group1' },
				{ name: 'tag2', label: 'AB', group: 'group1' },
				{ name: 'tag3', label: 'ABC', group: 'group2' },
			] )
		);

		const props = {
			value: {},
			propType: createMockPropType( { kind: 'object' } ),
		};

		// Act.
		renderControl( <DynamicSelection close={ jest.fn() } />, props );

		const searchInput = screen.getByRole( 'textbox' );

		fireEvent.change( searchInput, { target: { value: 'not exists' } } );

		// Assert.
		expect( screen.getByText( 'Clear & try again' ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByText( 'Clear & try again' ) );

		// Assert.
		expect( searchInput ).toHaveValue( '' );
	} );

	it.skip( 'should set the selected dynamic tag value when clicking on a tag, and close the popover', () => {
		// TODO: Fix me!
		// Arrange.
		const closePopover = jest.fn();
		const setValue = jest.fn();

		jest.mocked( usePropDynamicTags ).mockReturnValue(
			mockDynamicTags( [
				{ name: 'tag1', label: 'Tag 1', group: 'group1' },
				{ name: 'tag2', label: 'Tag 2', group: 'group1' },
			] )
		);

		const props = {
			setValue,
			bind: 'title',
			propType: createMockPropType( { kind: 'object' } ),
			value: { $$type: 'dynamic', value: { name: 'prop' } },
		};

		// Act.
		renderControl( <DynamicSelection close={ closePopover } />, props );

		const tag1 = screen.getByText( 'Tag 1' );

		// Assert.
		expect( tag1 ).toBeInTheDocument();

		// Act.
		fireEvent.click( tag1 );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'dynamic',
			value: { name: 'tag1', settings: { label: 'Tag 1' } },
		} );

		expect( closePopover ).toHaveBeenCalled();
	} );

	it.skip( 'should save the prop value in the history before switching to dynamic', () => {
		// TODO: Fix me!
		// Arrange.
		const updateValue = jest.fn();
		jest.mocked( usePersistDynamicValue ).mockReturnValue( [ null, updateValue, jest.fn() ] );

		jest.mocked( usePropDynamicTags ).mockReturnValue(
			mockDynamicTags( [
				{ name: 'tag1', label: 'Tag 1', group: 'group1' },
				{ name: 'tag2', label: 'Tag 2', group: 'group1' },
			] )
		);

		const props = {
			bind: 'title',
			value: { $$type: 'string', value: "Please don't replace me" },
			propType: createMockPropType( { kind: 'object' } ),
		};

		// Act.
		renderControl( <DynamicSelection close={ jest.fn() } />, props );

		fireEvent.click( screen.getByText( 'Tag 1' ) );

		// Assert.
		expect( updateValue ).toHaveBeenCalledWith( { $$type: 'string', value: "Please don't replace me" } );
	} );

	it.skip( 'should not save the prop value in the history if it is already dynamic', () => {
		// TODO: Fix me!
		// Arrange.
		const updateValue = jest.fn();
		jest.mocked( usePersistDynamicValue ).mockReturnValue( [ null, updateValue, jest.fn() ] );

		jest.mocked( usePropDynamicTags ).mockReturnValue(
			mockDynamicTags( [
				{ name: 'tag1', label: 'Tag 1', group: 'group1' },
				{ name: 'tag2', label: 'Tag 2', group: 'group1' },
			] )
		);

		const props = {
			bind: 'title',
			value: { $$type: 'dynamic', value: { name: 'tag1' } },
			propType: createMockPropType( { kind: 'object' } ),
		};

		// Act.
		renderControl( <DynamicSelection close={ jest.fn() } />, props );

		fireEvent.click( screen.getByText( 'Tag 1' ) );

		// Assert.
		expect( updateValue ).not.toHaveBeenCalled();
	} );
} );

const mockDynamicTags = ( tags: Partial< DynamicTag >[] ) => {
	return tags as DynamicTag[];
};
