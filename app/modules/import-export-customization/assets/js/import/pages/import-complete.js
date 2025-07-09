import { Box, Typography, Card, CardContent, Button, Link, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { BaseLayout, TopBar, PageHeader, Footer } from '../../shared/components';

const Illustration = () => (
	<Box
		sx={ {
			height: 140,
			alignSelf: 'center',
			borderRadius: 2,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		} }
	>
		<img
			src={ elementorAppConfig.assets_url + 'images/kit-is-live.svg' }
			alt="Kit is live illustration"
		/>
	</Box>
);

const ExternalLinkIcon = ( { fontSize = 20 } ) => (
	<Box
		component="i"
		sx={ { fontFamily: 'eicons', fontSize } }
		className="eps-icon eicon-editor-external-link"
	>
	</Box>
);

ExternalLinkIcon.propTypes = {
	fontSize: PropTypes.number,
};

export default function ImportComplete() {
	const headerContent = (
		<PageHeader title={ __( 'Import', 'elementor' ) } />
	);

	const footerContent = (
		<Stack direction="row" spacing={ 1 }>
			<Button
				variant="outlined"
				color="secondary"
				startIcon={<ExternalLinkIcon />}
				size="small"
			>
				{ __( 'See it Live', 'elementor' ) }
			</Button>
			<Button
				variant="contained"
				color="primary"
				size="small"
			>
				{ __( 'Close', 'elementor' ) }
			</Button>
		</Stack>
	);

	return (
		<BaseLayout
			topBar={ <TopBar>{ headerContent }</TopBar> }
			footer={ <Footer>{ footerContent }</Footer> }
		>
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				width={ 1080 }
				mx="auto"
				pt={ 10 }
				gap={ 4 }
			>
				<Illustration />
				<Stack spacing={ 1 } alignItems="center" width="100%">
					<Typography
						variant="h4"
						color="text.primary"
						sx={ { fontWeight: 700, textAlign: 'center', width: '100%' } }
					>
						{ __( 'Your website templates is now live on your site!', 'elementor' ) }
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
						sx={ { textAlign: 'center', width: '100%' } }
					>
						{ __( 'You\'ve imported and applied the following to your site:', 'elementor' ) }
					</Typography>
				</Stack>
				<Card sx={ { width: '100%', borderRadius: 2, boxShadow: 0, border: '1px solid', borderColor: 'elevation.outlined' } }>
					<CardContent sx={ { p: 0 } }>
						<Box>
							<Box sx={ { borderBottom: '1px solid', borderColor: 'elevation.outlined', p: 2 } }>
								<Typography variant="subtitle1" color="text.primary" sx={ { fontWeight: 500 } }>
									{ __( 'This website templates includes:', 'elementor' ) }
								</Typography>
							</Box>
							<Box sx={ { p: 2 } }>
								<Stack spacing={ 2 }>
									<Box>
										<Stack direction="row" alignItems="center" spacing={ 1 }>
											<Typography variant="body2" color="text.primary" sx={ { fontWeight: 500 } }>
												{ __( 'Site settings', 'elementor' ) }
											</Typography>
											<Box sx={ { width: 25, height: 25, color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
												<ExternalLinkIcon />
											</Box>
										</Stack>
										<Typography variant="caption" color="text.secondary" sx={ { mt: 0.5 } }>
											{ __( 'Global Colors | Global Fonts | Typography | Buttons | Images | Form Fields | Previousground | Layout | Lightbox | Page Transitions | Custom CSS', 'elementor' ) }
										</Typography>
									</Box>
									<Box>
										<Stack direction="row" alignItems="center" spacing={ 1 }>
											<Typography variant="body2" color="text.primary" sx={ { fontWeight: 500 } }>
												{ __( 'Content', 'elementor' ) }
											</Typography>
											<Box sx={ { width: 25, height: 25, color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
												<ExternalLinkIcon />
											</Box>
										</Stack>
										<Typography variant="caption" color="text.secondary" sx={ { mt: 0.5 } }>
											{ __( '5 Posts | 12 Pages | 39 Products | 15 Navigation Menu Items', 'elementor' ) }
										</Typography>
									</Box>
									<Box>
										<Stack direction="row" alignItems="center" spacing={ 1 }>
											<Typography variant="body2" color="text.primary" sx={ { fontWeight: 500 } }>
												{ __( 'Plugins', 'elementor' ) }
											</Typography>
											<Box sx={ { width: 25, height: 25, color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
												<ExternalLinkIcon />
											</Box>
										</Stack>
										<Typography variant="caption" color="text.secondary" sx={ { mt: 0.5 } }>
											{ __( 'WooCommerce | Variation Swatches for WooCommerce | Ally - Web Accessibility & Usability | Advanced Custom Fields 4o', 'elementor' ) }
										</Typography>
									</Box>
								</Stack>
							</Box>
						</Box>
					</CardContent>
				</Card>
				<Box width="100%" mt={ 2 }>
					<Stack direction="row" justifyContent="center" alignItems="center" spacing={ 3 }>
						<Typography variant="body2" color="text.secondary">
							{ __( 'Build sites faster with Website Templates.', 'elementor' ) }
							<Link href="#" sx={ { color: 'info.main', fontWeight: 500, ml: 1, textDecoration: 'none' } }>{ __( 'Show me how', 'elementor' ) }</Link>
						</Typography>
					</Stack>
				</Box>
			</Box>
		</BaseLayout>
	);
}
