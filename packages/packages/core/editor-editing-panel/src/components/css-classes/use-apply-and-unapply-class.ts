import { useCallback, useMemo } from 'react';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { getElementLabel, getElementSetting, updateElementSettings } from '@elementor/editor-elements';
import { classesPropTypeUtil, type ClassesPropValue } from '@elementor/editor-props';
import { type StyleDefinitionID } from '@elementor/editor-styles';
import { useGetStylesRepositoryCreateAction } from '@elementor/editor-styles-repository';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { useClassesProp } from '../../contexts/classes-prop-context';
import { useElement } from '../../contexts/element-context';
import { useStyle } from '../../contexts/style-context';

type UndoableClassActionPayload = {
	classId: StyleDefinitionID;
	classLabel: string;
};

type CreateAndApplyClassPayload = {
	classLabel: string;
};

type CreateAndApplyClassUndoData = {
	prevActiveId: string | null;
	createdId: StyleDefinitionID;
};

export function useApplyClass() {
	const { id: activeId, setId: setActiveId } = useStyle();
	const { element } = useElement();

	const applyClass = useApply();
	const unapplyClass = useUnapply();

	return useMemo( () => {
		return undoable(
			{
				do: ( { classId }: UndoableClassActionPayload ) => {
					const prevActiveId = activeId;

					applyClass( classId );

					return prevActiveId;
				},
				undo: ( { classId }: UndoableClassActionPayload, prevActiveId: string | null ) => {
					unapplyClass( classId );
					setActiveId( prevActiveId );
				},
			},
			{
				title: getElementLabel( element.id ),
				subtitle: ( { classLabel } ) => {
					/* translators: %s is the class name. */
					return __( `class %s applied`, 'elementor' ).replace( '%s', classLabel );
				},
			}
		);
	}, [ activeId, applyClass, element.id, unapplyClass, setActiveId ] );
}

export function useUnapplyClass() {
	const { id: activeId, setId: setActiveId } = useStyle();
	const { element } = useElement();

	const applyClass = useApply();
	const unapplyClass = useUnapply();

	return useMemo( () => {
		return undoable(
			{
				do: ( { classId }: UndoableClassActionPayload ) => {
					const prevActiveId = activeId;

					unapplyClass( classId );

					return prevActiveId;
				},
				undo: ( { classId }: UndoableClassActionPayload, prevActiveId: string | null ) => {
					applyClass( classId );
					setActiveId( prevActiveId );
				},
			},
			{
				title: getElementLabel( element.id ),
				subtitle: ( { classLabel } ) => {
					/* translators: %s is the class name. */
					return __( `class %s removed`, 'elementor' ).replace( '%s', classLabel );
				},
			}
		);
	}, [ activeId, applyClass, element.id, unapplyClass, setActiveId ] );
}

export function useCreateAndApplyClass() {
	const { id: activeId, setId: setActiveId } = useStyle();

	const [ provider, createAction ] = useGetStylesRepositoryCreateAction() ?? [ null, null ];
	const deleteAction = provider?.actions.delete;

	const applyClass = useApply();
	const unapplyClass = useUnapply();

	const undoableCreateAndApply = useMemo( () => {
		if ( ! provider || ! createAction ) {
			return;
		}

		return undoable(
			{
				do: ( { classLabel }: CreateAndApplyClassPayload ): CreateAndApplyClassUndoData => {
					const prevActiveId = activeId;

					const createdId = createAction( classLabel );
					applyClass( createdId );

					return { prevActiveId, createdId };
				},
				undo: ( _: CreateAndApplyClassPayload, { prevActiveId, createdId }: CreateAndApplyClassUndoData ) => {
					unapplyClass( createdId );
					deleteAction?.( createdId );

					setActiveId( prevActiveId );
				},
			},
			{
				title: __( 'Class', 'elementor' ),
				subtitle: ( { classLabel } ) => {
					/* translators: %s is the class name. */
					return __( `%s created`, 'elementor' ).replace( '%s', classLabel );
				},
			}
		);
	}, [ activeId, applyClass, createAction, deleteAction, provider, setActiveId, unapplyClass ] );

	if ( ! provider || ! undoableCreateAndApply ) {
		return [ null, null ];
	}

	return [ provider, undoableCreateAndApply ] as const;
}

function useApply() {
	const { element } = useElement();
	const { setId: setActiveId } = useStyle();
	const { setClasses, getAppliedClasses } = useClasses();

	return useCallback(
		( classIDToApply: StyleDefinitionID ) => {
			const appliedClasses = getAppliedClasses();

			if ( appliedClasses.includes( classIDToApply ) ) {
				throw new Error(
					`Class ${ classIDToApply } is already applied to element ${ element.id }, cannot re-apply.`
				);
			}

			const updatedClassesIds = [ ...appliedClasses, classIDToApply ];
			setClasses( updatedClassesIds );
			setActiveId( classIDToApply );
		},
		[ element.id, getAppliedClasses, setActiveId, setClasses ]
	);
}

function useUnapply() {
	const { element } = useElement();
	const { id: activeId, setId: setActiveId } = useStyle();
	const { setClasses, getAppliedClasses } = useClasses();

	return useCallback(
		( classIDToUnapply: StyleDefinitionID ) => {
			const appliedClasses = getAppliedClasses();

			if ( ! appliedClasses.includes( classIDToUnapply ) ) {
				throw new Error(
					`Class ${ classIDToUnapply } is not applied to element ${ element.id }, cannot unapply it.`
				);
			}

			const updatedClassesIds = appliedClasses.filter( ( id ) => id !== classIDToUnapply );
			setClasses( updatedClassesIds );

			if ( activeId === classIDToUnapply ) {
				setActiveId( updatedClassesIds[ 0 ] ?? null );
			}
		},
		[ activeId, element.id, getAppliedClasses, setActiveId, setClasses ]
	);
}

function useClasses() {
	const { element } = useElement();
	const currentClassesProp = useClassesProp();

	return useMemo( () => {
		const setClasses = ( ids: StyleDefinitionID[] ) => {
			updateElementSettings( {
				id: element.id,
				props: { [ currentClassesProp ]: classesPropTypeUtil.create( ids ) },
				withHistory: false,
			} );

			setDocumentModifiedStatus( true );
		};

		const getAppliedClasses = () =>
			getElementSetting< ClassesPropValue >( element.id, currentClassesProp )?.value || [];

		return { setClasses, getAppliedClasses };
	}, [ currentClassesProp, element.id ] );
}
