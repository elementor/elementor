import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Box, Button, Divider, Link, Typography } from '@elementor/ui';
import { WhatsNewItemTopicLine } from './whats-new-item-topic-line';
import { WrapperWithLink } from './wrapper-with-link';
import { WhatsNewItemThumbnail } from './whats-new-item-thumbnail';
import { WhatsNewItemChips } from './whats-new-item-chips';

const InstallPluginButton = ( { slug, notificationId, installLabel, activateLabel } ) => {
	const [ status, setStatus ] = useState( 'idle' ); // Idle | installing | activating | done | error
	const [ errorMsg, setErrorMsg ] = useState( '' );

	const dismissCard = () => {
		elementorCommon.ajax.addRequest( 'notifications_mark_installed', {
			data: { notification_id: notificationId },
		} );
	};

	const findAndActivate = async () => {
		setStatus( 'activating' );
		try {
			const plugins = await wp.apiFetch( { path: '/wp/v2/plugins' } );
			const plugin = plugins.find( ( p ) => p.plugin.startsWith( slug + '/' ) );

			if ( plugin && 'active' === plugin.status ) {
				setStatus( 'done' );
				dismissCard();
				return;
			}

			if ( plugin ) {
				await wp.apiFetch( {
					path: `/wp/v2/plugins/${ encodeURIComponent( plugin.plugin ) }`,
					method: 'PUT',
					data: { status: 'active' },
				} );
			}

			setStatus( 'done' );
			dismissCard();
		} catch ( err ) {
			setStatus( 'error' );
			setErrorMsg( err?.message || __( 'Activation failed', 'elementor' ) );
		}
	};

	const handleInstall = async () => {
		setStatus( 'installing' );
		try {
			await wp.apiFetch( {
				path: '/wp/v2/plugins',
				method: 'POST',
				data: { slug, status: 'active' },
			} );
			setStatus( 'done' );
			dismissCard();
		} catch ( err ) {
			// Plugin already installed — find it and activate
			if ( 'folder_exists' === err?.code ) {
				await findAndActivate();
			} else {
				setStatus( 'error' );
				setErrorMsg( err?.message || __( 'Installation failed', 'elementor' ) );
			}
		}
	};

	const getButtonLabel = () => {
		switch ( status ) {
			case 'installing': return __( 'Installing...', 'elementor' );
			case 'activating': return activateLabel || __( 'Activating...', 'elementor' );
			case 'done': return __( 'Installed ✓', 'elementor' );
			default: return installLabel;
		}
	};

	const isDisabled = [ 'installing', 'activating', 'done' ].includes( status );

	return (
		<Box>
			<Button
				variant="contained"
				size="small"
				color="primary"
				disabled={ isDisabled }
				onClick={ ! isDisabled ? handleInstall : undefined }
			>
				{ getButtonLabel() }
			</Button>
			{ 'error' === status && (
				<Typography variant="caption" color="error.main" sx={ { display: 'block', mt: 0.5 } }>
					{ errorMsg }
				</Typography>
			) }
		</Box>
	);
};

InstallPluginButton.propTypes = {
	slug: PropTypes.string.isRequired,
	notificationId: PropTypes.string.isRequired,
	installLabel: PropTypes.string.isRequired,
	activateLabel: PropTypes.string,
};

export const WhatsNewItem = ( { item, itemIndex, itemsLength, setIsOpen } ) => {
	return (
		<Box
			key={ itemIndex }
			display="flex"
			flexDirection="column"
			sx={ {
				pt: 2,
			} }
		>
			{ ( item.topic || item.date ) && (
				<WhatsNewItemTopicLine
					topic={ item.topic }
					date={ item.date }
				/>
			) }
			<WrapperWithLink link={ item.link }>
				<Typography
					variant="subtitle1"
					sx={ {
						pb: 2,
					} }
				>
					{ item.title }
				</Typography>
			</WrapperWithLink>
			{ item.imageSrc && (
				<WhatsNewItemThumbnail
					imageSrc={ item.imageSrc }
					link={ item.link }
					title={ item.title }
				/>
			) }

			<WhatsNewItemChips
				chipPlan={ item.chipPlan }
				chipTags={ item.chipTags }
				itemIndex={ itemIndex }
			/>

			{ item.description && (
				<Typography
					variant="body2"
					color="text.secondary"
					sx={ {
						pb: 2,
					} }
				>
					{ item.description }
					{ item.readMoreText && (
						<>
							{ ' ' }
							<Link
								href={ item.link }
								color="info.main"
								target="_blank"
							>
								{ item.readMoreText }
							</Link>
						</>
					) }
				</Typography>
			) }
			{ item.installPlugin ? (
				<Box sx={ { pb: 2 } }>
					<InstallPluginButton
						slug={ item.installPlugin }
						notificationId={ item.id }
						installLabel={ item.cta || __( 'Install Plugin', 'elementor' ) }
						activateLabel={ item.ctaActivate }
					/>
				</Box>
			) : item.cta && item.ctaLink && (
				<Box
					sx={ {
						pb: 2,
					} }
				>
					<Button
						href={ item.ctaLink }
						target={ item.ctaLink.startsWith( '#' ) ? '_self' : '_blank' }
						variant="contained"
						size="small"
						color="promotion"
						onClick={ item.ctaLink.startsWith( '#' ) ? () => setIsOpen( false ) : () => {} }
					>
						{ item.cta }
					</Button>
				</Box>
			) }
			{ itemIndex !== itemsLength - 1 && (
				<Divider
					sx={ {
						my: 1,
					} }
				/>
			) }
		</Box>
	);
};

WhatsNewItem.propTypes = {
	item: PropTypes.object.isRequired,
	itemIndex: PropTypes.number.isRequired,
	itemsLength: PropTypes.number.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};
