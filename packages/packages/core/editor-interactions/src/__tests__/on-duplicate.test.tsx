import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { initCleanInteractionIdsOnDuplicate } from '../hooks/on-duplicate';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { getContainer, getAllDescendants } from '@elementor/editor-elements';
// import type { V1Element } from '@elementor/editor-elements';
import { generateTempInteractionId } from '../utils/temp-id-utils';
import { extractString, createString } from '../utils/prop-value-utils';
// import { StringPropValue } from '@elementor/editor-props';


jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '@elementor/editor-elements' );
jest.mock( '../utils/temp-id-utils' );
jest.mock( '../utils/prop-value-utils' );

describe( 'on-duplicate', () => {
    let mockContainer;
    let mockModel;
    let mockRegisterDataHook;

    beforeEach( () => {
        jest.clearAllMocks();

        mockModel = {
            get: jest.fn(),
            set: jest.fn(),
        };

        mockContainer = {
            id: 'element-123',
            model: mockModel,
        };

        jest.mocked( getContainer ).mockReturnValue( mockContainer );
        jest.mocked( getAllDescendants ).mockReturnValue( [
            { id: 'element-456' },
            { id: 'element-789' },
        ] );

        mockRegisterDataHook = jest.fn();
        jest.mocked( registerDataHook ).mockImplementation( mockRegisterDataHook );

        jest.mocked( extractString ).mockImplementation( ( val ) => {
            return ( val && typeof val === 'object' && 'value' in val ? ( val as { value?: string } ).value : null ) ?? null;
        } );
        jest.mocked( createString ).mockImplementation( ( val ) => ( {
            $$type: 'string',
            value: val,
        } ) );
        jest.mocked( generateTempInteractionId ).mockReturnValue( 'temp-new-id-123' );
    } );

    describe( 'initCleanInteractionIdsOnDuplicate', () => {
        it( 'should register data hook for duplicate event', () => {
            initCleanInteractionIdsOnDuplicate();

            expect( registerDataHook ).toHaveBeenCalledWith(
                'after',
                'document/elements/duplicate',
                expect.any( Function )
            );
        } );

        it.only( 'should clean interaction IDs for single duplicated element', () => {
            const duplicateCallback = mockRegisterDataHook.mock.calls[ 0 ][ 2 ] as ( _args: unknown, result: { id: string } | { id: string }[] ) => void;
            const duplicatedElement = { id: 'element-123' };

            mockModel.get.mockReturnValue( {
                items: [
                    {
                        $$type: 'interaction-item',
                        value: {
                            interaction_id: { $$type: 'string', value: 'permanent-id-123' },
                        },
                    },
                ],
            } );

            ( getAllDescendants as jest.Mock ).mockReturnValue( [] );

            duplicateCallback( [], duplicatedElement );

            expect( getContainer ).toHaveBeenCalledWith( 'element-123' );
            expect( getAllDescendants ).toHaveBeenCalledWith( mockContainer );
        } );

        it( 'should clean interaction IDs for multiple duplicated elements', () => {
            const duplicateCallback = mockRegisterDataHook.mock.calls[ 0 ][ 2 ] as ( _args: unknown, result: V1Element | V1Element[] ) => void;
            const duplicatedElements = [
                { id: 'element-123' },
                { id: 'element-456' },
            ];

            mockModel.get.mockReturnValue( {
                items: [
                    {
                        $$type: 'interaction-item',
                        value: {
                            interaction_id: { $$type: 'string', value: 'permanent-id-123' },
                        },
                    },
                ],
            } );

            ( getAllDescendants as jest.Mock ).mockReturnValue( [] );

            duplicateCallback( [], duplicatedElements );

            expect( getContainer ).toHaveBeenCalledWith( 'element-123' );
            expect( getContainer ).toHaveBeenCalledWith( 'element-456' );
        } );

        it( 'should clean interaction IDs recursively for all descendants', () => {
            const duplicateCallback = mockRegisterDataHook.mock.calls[ 0 ][ 2 ] as ( _args: unknown, result: V1Element | V1Element[] ) => void;
            const duplicatedElement = { id: 'element-123' };

            const childContainer1 = {
                id: 'element-456',
                model: {
                    get: jest.fn().mockReturnValue( {
                        items: [
                            {
                                $$type: 'interaction-item',
                                value: {
                                    interaction_id: { $$type: 'string', value: 'permanent-id-456' },
                                },
                            },
                        ],
                    } ),
                    set: jest.fn(),
                },
            };

            const childContainer2 = {
                id: 'element-789',
                model: {
                    get: jest.fn().mockReturnValue( null ),
                    set: jest.fn(),
                },
            };

            ( getContainer as jest.Mock )
                .mockReturnValueOnce( mockContainer )
                .mockReturnValueOnce( childContainer1 )
                .mockReturnValueOnce( childContainer2 );

            mockModel.get.mockReturnValue( null );

            duplicateCallback( [], duplicatedElement );

            expect( getContainer ).toHaveBeenCalledWith( 'element-456' );
            expect( getContainer ).toHaveBeenCalledWith( 'element-789' );
        } );

        it( 'should not add temp ID when interaction already has ID', () => {
            const duplicateCallback = mockRegisterDataHook.mock.calls[ 0 ][ 2 ] as ( _args: unknown, result: V1Element | V1Element[] ) => void;
            const duplicatedElement = { id: 'element-123' };

            mockModel.get.mockReturnValue( {
                items: [
                    {
                        $$type: 'interaction-item',
                        value: {
                            interaction_id: { $$type: 'string', value: 'permanent-id-123' },
                        },
                    },
                ],
            } );

            ( getAllDescendants as jest.Mock ).mockReturnValue( [] );

            duplicateCallback( [], duplicatedElement );

            expect( generateTempInteractionId ).not.toHaveBeenCalled();
            expect( mockModel.set ).toHaveBeenCalledWith( 'interactions', expect.any( Object ) );
        } );

        it( 'should add temp ID when interaction does not have ID', () => {
            const duplicateCallback = mockRegisterDataHook.mock.calls[ 0 ][ 2 ] as ( _args: unknown, result: V1Element | V1Element[] ) => void;
            const duplicatedElement = { id: 'element-123' };

            mockModel.get.mockReturnValue( {
                items: [
                    {
                        $$type: 'interaction-item',
                        value: {},
                    },
                ],
            } );

            ( getAllDescendants as jest.Mock ).mockReturnValue( [] );

            duplicateCallback( [], duplicatedElement );

            expect( generateTempInteractionId ).toHaveBeenCalled();
            expect( mockModel.set ).toHaveBeenCalledWith(
                'interactions',
                expect.objectContaining( {
                    items: expect.arrayContaining( [
                        expect.objectContaining( {
                            value: expect.objectContaining( {
                                interaction_id: expect.objectContaining( {
                                    value: 'temp-new-id-123',
                                } ),
                            } ),
                        } ),
                    ] ),
                } )
            );
        } );

        it( 'should handle elements without interactions', () => {
            const duplicateCallback = mockRegisterDataHook.mock.calls[ 0 ][ 2 ] as ( _args: unknown, result: V1Element | V1Element[] ) => void;
            const duplicatedElement = { id: 'element-123' };

            mockModel.get.mockReturnValue( null );
            ( getAllDescendants as jest.Mock ).mockReturnValue( [] );

            duplicateCallback( [], duplicatedElement );

            expect( mockModel.set ).not.toHaveBeenCalled();
        } );

        it( 'should handle interactions without items', () => {
            const duplicateCallback = mockRegisterDataHook.mock.calls[ 0 ][ 2 ] as ( _args: unknown, result: V1Element | V1Element[] ) => void;
            const duplicatedElement = { id: 'element-123' };

            mockModel.get.mockReturnValue( { items: null } );
            ( getAllDescendants as jest.Mock ).mockReturnValue( [] );

            duplicateCallback( [], duplicatedElement );

            expect( mockModel.set ).not.toHaveBeenCalled();
        } );

        it( 'should skip non-interaction-item types', () => {
            const duplicateCallback = mockRegisterDataHook.mock.calls[ 0 ][ 2 ] as ( _args: unknown, result: V1Element | V1Element[] ) => void;
            const duplicatedElement = { id: 'element-123' };

            mockModel.get.mockReturnValue( {
                items: [
                    {
                        $$type: 'other-type',
                        value: {},
                    },
                ],
            } );

            ( getAllDescendants as jest.Mock ).mockReturnValue( [] );

            duplicateCallback( [], duplicatedElement );

            expect( generateTempInteractionId ).not.toHaveBeenCalled();
        } );
    } );
} );