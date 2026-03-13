import * as React from 'react';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useAutoplayCarousel } from '../hooks/use-autoplay-carousel';
import { FeatureItem } from './feature-item';
import { ModalFooter } from './modal-footer';
import { ModalHeader } from './modal-header';
import { ModalImage } from './modal-image';
import { V4ActivationModal } from './v4-activation-modal';

const BACKGROUND_COLOR = '#FFDFF9';

const LEARN_MORE_URL = 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/';

const FEATURE_ITEMS = [
	{
		id: 'combineWidgets',
		title: __( 'Use Atomic Elements alongside your existing widgets', 'elementor' ),
		subtitle: __( 'No need to rebuild pages. Combine legacy & new workflows.', 'elementor' ),
		image: 'https://assets.elementor.com/v4-promotion/v1/images/pop_up_combine_widgets.svg',
	},
	{
		id: 'designSystems',
		title: __( 'Build reusable design systems', 'elementor' ),
		subtitle: __( 'Classes, Variables & Components give a clear path for scale.', 'elementor' ),
		image: 'https://assets.elementor.com/v4-promotion/v1/images/pop_up_design_systems.svg',
	},
	{
		id: 'consistentStyling',
		title: __( 'Keep styles consistent across your site', 'elementor' ),
		subtitle: __( 'A unified Style tab with full control over responsive design.', 'elementor' ),
		image: 'https://assets.elementor.com/v4-promotion/v1/images/pop_up_consistent_styling.svg',
	},
	{
		id: 'performance',
		title: __( 'Get unparalleled performance', 'elementor' ),
		subtitle: __( 'Clean code and a light CSS footprint with single-div wrappers.', 'elementor' ),
		image: 'https://assets.elementor.com/v4-promotion/v1/images/pop_up_performance.svg',
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
					title={ __( 'You’re now using the Atomic Editor', 'elementor' ) }
					subtitle={
						<>
							{ __( 'Elementor’s new editing experience is now active.', 'elementor' ) }
							<br />
							{ __(
								'Your existing pages stay exactly the same - you can keep working as usual while exploring new Atomic Elements.',
								'elementor'
							) }
						</>
					}
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
