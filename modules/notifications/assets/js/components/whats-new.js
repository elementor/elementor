import { useEffect } from 'react';
import {
	AppBar,
	Box,
	Button,
	Chip,
	Divider,
	Drawer,
	IconButton, Link,
	Stack,
	ThemeProvider,
	Toolbar,
	Typography,
} from '@elementor/ui';
import { QueryClient, QueryClientProvider, useQuery } from '@elementor/query';
import { __ } from '@wordpress/i18n';

import { WrapperWithLink } from './wrapper-with-link';
import { getNotifications } from '../api';
import { XIcon } from '../icons/x-icon';

const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
			staleTime: 1000 * 60 * 30, // 30 minutes
		},
	},
} );

const WhatsNewTopBar = ( props ) => {
	const { setIsOpen } = props;

	return (
		<>
			<AppBar
				elevation={ 0 }
				position="sticky"
				sx={ {
					backgroundColor: 'background.default',
				} }
			>
				<Toolbar>
					<Typography
						variant="overline"
						sx={ { flexGrow: 1 } }
					>
						{ __( 'What\'s New', 'elementor' ) }
					</Typography>
					<IconButton
						aria-label={ 'close' }
						size="small"
						onClick={ () => setIsOpen( false ) }
					>
						<XIcon />
					</IconButton>
				</Toolbar>
			</AppBar>
			<Divider />
		</>
	);
};

WhatsNewTopBar.propTypes = {
	setIsOpen: PropTypes.func.isRequired,
};

const WhatsNewDrawerContent = () => {
	const { isPending, error, data: items } = useQuery( {
		queryKey: [ 'e-notifications' ],
		queryFn: getNotifications,
	} );

	if ( isPending ) {
		return (
			<Box>Loading...</Box>
		);
	}

	if ( error ) {
		return (
			<Box>
				An error has occurred: { error }
			</Box>
		);
	}

	return (
		items.map( ( item, itemIndex ) => {
			const chips = [];

			if ( item.chipPlan ) {
				chips.push( {
					color: 'accent',
					label: item.chipPlan,
				} );
			}

			if ( item.chipTags ) {
				item.chipTags.forEach( ( chipTag ) => {
					chips.push( {
						variant: 'outlined',
						label: chipTag,
					} );
				} );
			}

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
						<Stack
							direction="row"
							divider={ <Divider orientation="vertical" flexItem /> }
							spacing={ 1 }
							color="text.tertiary"
							sx={ {
								pb: 1,
							} }
						>
							{ item.topic && (
								<Box>{ item.topic }</Box>
							) }
							{ item.topic && (
								<Box>{ item.date }</Box>
							) }
						</Stack>
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
						<Box
							sx={ {
								pb: 2,
							} }
						>
							<WrapperWithLink link={ item.link }>
								<img
									src={ item.imageSrc }
									alt={ item.title }
									style={ { maxWidth: '100%' } }
								/>
							</WrapperWithLink>
						</Box>
					) }
					{ !! chips.length && (
						<Stack
							direction="row"
							flexWrap="wrap"
							gap={ 1 }
							sx={ {
								pb: 1,
							} }
						>
							{ chips.map( ( chip, chipIndex ) => {
								return (
									<Chip
										key={ `chip-    ${ itemIndex }${ chipIndex }` }
										{ ...chip }
									/>
								);
							} ) }
						</Stack>
					) }
					{ item.description && (
						<Typography
							variant="body2"
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
										target="_blank"
									>
										{ item.readMoreText }
									</Link>
								</>
							) }
						</Typography>
					) }
					{ item.cta && item.ctaLink && (
						<Box
							sx={ {
								pb: 2,
							} }
						>
							<Button
								href={ item.ctaLink }
								target="_blank"
								variant="contained"
								color="accent"
							>
								{ item.cta }
							</Button>
						</Box>
					) }
					{ itemIndex !== items.length - 1 && (
						<Divider />
					) }
				</Box>
			);
		} )
	);
};

export const WhatsNew = ( props ) => {
	const { isOpen, setIsOpen, setIsRead, anchorPosition = 'right' } = props;

	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

		setIsRead( true );
	}, [ isOpen, setIsRead ] );

	return (
		<>
			<QueryClientProvider client={ queryClient }>
				<ThemeProvider colorScheme="auto">
					<Drawer
						anchor={ anchorPosition }
						open={ isOpen }
						onClose={ () => setIsOpen( false ) }
						ModalProps={ {
							style: {
								// Above the WordPress Admin Top Bar.
								zIndex: 999999,
							},
						} }
					>
						<Box
							sx={ {
								width: 320,
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
								<WhatsNewDrawerContent />
							</Box>
						</Box>
					</Drawer>
				</ThemeProvider>
			</QueryClientProvider>
		</>
	);
};

WhatsNew.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
	setIsRead: PropTypes.func.isRequired,
	anchorPosition: PropTypes.oneOf( [ 'left', 'top', 'right', 'bottom' ] ),
};
