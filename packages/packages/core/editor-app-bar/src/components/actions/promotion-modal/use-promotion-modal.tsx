import * as React from 'react';
import { type ReactNode, useCallback, useEffect, useState } from 'react';

import { PromotionModal } from './promotion-modal';
import { type PromotionProps } from './types';

type UseActionModalReturn = {
	isOpen: boolean;
	close: () => void;
	renderWithModal: ( children: ReactNode ) => ReactNode;
};

const STORAGE_KEY_PREFIX = 'elementor_promotion_modal_';

type StoredModalState = {
	version: number;
	dismissed: boolean;
};

export function usePromotionModal( props: PromotionProps | null ): UseActionModalReturn {
	const { id, title, content, condition, version, image, ctaLabel, onClick } = props ?? {};
	const [ isOpen, setIsOpen ] = useState( false );
	const [ conditionChecked, setConditionChecked ] = useState( false );

	const hasValidId = Boolean( id );

	useEffect( () => {
		if ( ! id || ! title || ! content || conditionChecked ) {
			return;
		}

		if ( ! hasValidId ) {
			setConditionChecked( true );
			return;
		}

		const checkCondition = async () => {
			if ( ! shouldShowModal( id, version ) ) {
				setConditionChecked( true );
				return;
			}

			if ( condition ) {
				try {
					const result = await condition();
					if ( result ) {
						setIsOpen( true );
					}
				} catch {
					// Condition threw an error, don't show modal
				}
			} else {
				setIsOpen( true );
			}

			setConditionChecked( true );
		};

		checkCondition();
	}, [ id, hasValidId, title, content, condition, version, image, ctaLabel, conditionChecked ] );

	const close = useCallback( () => {
		if ( id ) {
			dismissModal( id, version );
		}
		setIsOpen( false );
	}, [ id, version ] );

	const handleCtaClick = useCallback( () => {
		close();
		onClick?.();
	}, [ close, onClick ] );

	const handleClose = useCallback( () => {
		close();
	}, [ close ] );

	const renderWithModal = useCallback(
		( children: ReactNode ): ReactNode => {
			if ( ! id || ! title || ! content || ! conditionChecked || ! hasValidId || ! ctaLabel ) {
				return children;
			}

			return (
				<PromotionModal
					{ ...{ id, isOpen, title, content, image, ctaLabel } }
					onClick={ handleCtaClick }
					onClose={ handleClose }
				>
					{ children }
				</PromotionModal>
			);
		},
		[ conditionChecked, content, ctaLabel, handleClose, handleCtaClick, hasValidId, id, image, isOpen, title ]
	);

	return {
		isOpen,
		close,
		renderWithModal,
	};
}

function getStoredState( id: string ): StoredModalState | null {
	try {
		const stored = localStorage.getItem( `${ STORAGE_KEY_PREFIX }${ id }` );
		if ( ! stored ) {
			return null;
		}
		return JSON.parse( stored ) as StoredModalState;
	} catch {
		return null;
	}
}

function shouldShowModal( id: string, version: number = 0 ): boolean {
	const stored = getStoredState( id );

	if ( ! stored ) {
		return true;
	}

	if ( version !== undefined && version > stored.version ) {
		return true;
	}

	return ! stored.dismissed;
}

function dismissModal( id: string, version: number = 0 ): void {
	const state: StoredModalState = {
		version: version ?? 1,
		dismissed: true,
	};
	localStorage.setItem( `${ STORAGE_KEY_PREFIX }${ id }`, JSON.stringify( state ) );
}
