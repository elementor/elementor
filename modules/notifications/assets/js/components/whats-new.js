import { useCallback, useEffect, useState } from 'react';
import { Box, DirectionProvider, Drawer, ThemeProvider } from '@elementor/ui';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { WhatsNewTopBar } from './whats-new-top-bar';
import { WhatsNewDrawerContent } from './whats-new-drawer-content';

const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
			staleTime: 1000 * 60 * 30, // 30 minutes
		},
	},
} );

const initialHasUnread = ( window.elementorNotifications?.unread_count ?? 0 ) > 0;

export const WhatsNew = ( props ) => {
	const { isOpen, setIsOpen, setIsRead = () => {}, anchorPosition = 'right' } = props;
	const [ seenItemIds, setSeenItemIds ] = useState( () => new Set() );

	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

		setIsRead( true );
	}, [ isOpen, setIsRead ] );

	const handleSeen = useCallback( ( itemId ) => {
		setSeenItemIds( ( prev ) => {
			if ( prev.has( itemId ) ) {
				return prev;
			}
			window.dispatchEvent( new CustomEvent( 'e-notification-item-seen' ) );
			return new Set( [ ...prev, itemId ] );
		} );
	}, [] );

	return (
		<>
			<QueryClientProvider client={ queryClient }>
				<DirectionProvider rtl={ elementorCommon.config.isRTL }>
					<ThemeProvider colorScheme={ window.elementor?.getPreferences?.( 'ui_theme' ) || 'auto' }>
						<Drawer
							anchor={ anchorPosition }
							open={ isOpen }
							onClose={ () => setIsOpen( false ) }
							BackdropProps={ { invisible: true } }
							ModalProps={ {
								style: {
									// Above the WordPress Admin Top Bar.
									zIndex: 999999,
								},
							} }
						>
							<Box
								sx={ {
									width: 360,
									backgroundColor: 'background.default',
								} }
								role="presentation"
							>
								<WhatsNewTopBar setIsOpen={ setIsOpen } />
								<Box
									sx={ {
										padding: '16px',
									} }
								>
									<WhatsNewDrawerContent
										setIsOpen={ setIsOpen }
										seenItemIds={ seenItemIds }
										onSeen={ handleSeen }
										initialHasUnread={ initialHasUnread }
									/>
								</Box>
							</Box>
						</Drawer>
					</ThemeProvider>
				</DirectionProvider>
			</QueryClientProvider>
		</>
	);
};

WhatsNew.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
	setIsRead: PropTypes.func,
	anchorPosition: PropTypes.oneOf( [ 'left', 'top', 'right', 'bottom' ] ),
};
