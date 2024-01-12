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
import { __ } from '@wordpress/i18n';
import { XIcon } from '../icons/x-icon';
import { WrapperWithLink } from './wrapper-with-link';
import { useEffect } from '@wordpress/element';

export const WhatsNew = ( props ) => {
	const { isOpen, setIsOpen, items, onWhatever } = props;

	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

		onWhatever( true );
	}, [ isOpen ] );

	return (
		<>
			<ThemeProvider colorScheme="auto">
				<Drawer
					anchor={ 'right' }
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
						<AppBar
							position="relative"
							sx={ {
								boxShadow: 'none',
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
									<XIcon/>
								</IconButton>
							</Toolbar>
						</AppBar>
						<Divider/>
						<Box
							sx={ {
								padding: '16px',
							} }
						>
							{ items.map( ( item, itemIndex ) => {
								const chips = [];

								if ( item.chipPlan ) {
									chips.push( {
										color: 'accent',
										label: item.chipPlan,
									} );
								}

								if ( item.chipTags.length ) {
									item.chipTags.forEach( ( chipTag ) => {
										chips.push( {
											variant: 'outlined',
											label: chipTag,
										} );
									} );
								}

								return (
									<>
										<Box
											key={ itemIndex }
											display="flex"
											flexDirection="column"
											sx={ {
												paddingBlockStart: 2,
											} }
										>
											<Stack
												direction="row"
												divider={ <Divider orientation="vertical"
												                   flexItem/> }
												spacing={ 1 }
												color="text.tertiary"
												sx={ {
													paddingBlockEnd: 1,
												} }
											>
												{ item.topic && (
													<Box>{ item.topic }</Box>
												) }
												<Box>{ item.date }</Box>
											</Stack>
											<WrapperWithLink link={ item.link }>
												<Typography
													variant="subtitle1"
													sx={ {
														paddingBlockEnd: 2,
													} }
												>
													{ item.title }
												</Typography>
											</WrapperWithLink>
											{ item.imageSrc && (
												<Box
													sx={ {
														paddingBlockEnd: 2,
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
											{ chips && (
												<Stack
													direction="row"
													flexWrap="wrap"
													gap={ 1 }
													sx={ {
														paddingBlockEnd: 1,
													} }
												>
													{ chips.map( ( chip, chipIndex ) => {
														return (
															<Chip
																key={ chipIndex }
																{ ...chip }
															/>
														);
													} ) }
												</Stack>
											) }
											<Typography
												variant="body2"
												sx={ {
													paddingBlockEnd: 2,
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
											{ item.cta && item.ctaLink && (
												<Box
													sx={ {
														paddingBlockEnd: 2,
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
												<Divider/>
											) }
										</Box>
									</>
								);
							} ) }
						</Box>
					</Box>
				</Drawer>
			</ThemeProvider>
		</>
	);
};
