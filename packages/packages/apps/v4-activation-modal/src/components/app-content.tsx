import * as React from 'react';

import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { FeatureItem } from './feature-item';
import { ModalFooter } from './modal-footer';
import { ModalHeader } from './modal-header';
import { ModalImage } from './modal-image';
import { V4ActivationModal } from './v4-activation-modal';

import { useAutoplayCarousel } from '../hooks/use-autoplay-carousel';

const BACKGROUND_COLOR = '#FFDFF9';

const LEARN_MORE_URL = 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/';

const FEATURE_ITEMS = [
	{
		id: 'combineWidgets',
		title: __( 'Combine legacy Widgets & new Elements', 'elementor' ),
		subtitle: __( 'Current and new workflows work together on the same page.', 'elementor' ),
		image: '',
	},
	{
		id: 'designSystems',
		title: __( 'Build reusable design systems', 'elementor' ),
		subtitle: __( 'Classes, Variables & Components give a clear path for scale.', 'elementor' ),
		image: '',
	},
	{
		id: 'consistentStyling',
		title: __( 'Consistent styling experience', 'elementor' ),
		subtitle: __( 'A unified Style tab with full control over responsive design.', 'elementor' ),
		image: '',
	},
	{
		id: 'performance',
		title: __( 'Unparalleled performance', 'elementor' ),
		subtitle: __( 'Clean code and a light CSS footprint with single-div wrappers.', 'elementor' ),
		image: '',
	},
];

const FEATURE_IDS = FEATURE_ITEMS.map( ( item ) => item.id );

export function AppContent( { onClose }: { onClose: () => void } ) {
	const { selectedItem, selectItem } = useAutoplayCarousel( FEATURE_IDS );

	return (
		<V4ActivationModal
			onClose={ onClose }
			rightPanelBackgroundColor={ BACKGROUND_COLOR }
			rightPanel={
				<ModalImage 
					id={ selectedItem } 
					images={ FEATURE_ITEMS.map( ( { id, image } ) => ( { id, src: image } ) ) } 
				/>
			}
			header={
				<ModalHeader
					title={ __( 'Welcome to the future of Elementor!', 'elementor' ) }
					subtitle={ __(
						"You're now using The Atomic Editor, a new architectural foundation that will continue to evolve with more features and capabilities.",
						'elementor'
					) }
				/>
			}
			footer={
				<ModalFooter
					helpText={ __( 'Need help getting started?', 'elementor' ) }
					learnMoreText={ __( 'Learn more', 'elementor' ) }
					learnMoreUrl={ LEARN_MORE_URL }
				/>
			}
		>
			<Stack gap={ 2 }>
				{ FEATURE_ITEMS.map( ( item ) => (
					<FeatureItem
						key={ item.id }
						title={ item.title }
						subtitle={ item.subtitle }
						selected={ item.id === selectedItem }
						onClick={ () => selectItem( item.id ) }
					/>
				) ) }
			</Stack>
		</V4ActivationModal>
	);
}
