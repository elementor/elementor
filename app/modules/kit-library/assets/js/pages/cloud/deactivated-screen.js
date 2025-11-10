import { Heading, Text, Grid, Button } from '@elementor/app-ui';
import PropTypes from 'prop-types';
import Content from '../../../../../../assets/js/layout/content';
import IndexHeader from '../index/index-header';
import IndexSidebar from '../index/index-sidebar';
import Layout from '../../components/layout';
import DeactivatedIcon from './deactivated-icon';

export default function DeactivatedScreen( {
	menuItems,
	forceRefetch,
	isFetching,
} ) {
	const renewUrl = 'https://go.elementor.com/go-pro-cloud-website-templates-library-advanced/';

	return (
		<Layout
			sidebar={
				<IndexSidebar menuItems={ menuItems } />
			}
			header={
				<IndexHeader
					refetch={ () => {
						forceRefetch();
					} }
					isFetching={ isFetching }
				/>
			}
		>
			<div className="e-kit-library__index-layout-container">
				<Content className="e-kit-library__index-layout-main e-kit-library__connect-container">
					<Grid container alignItems="center" justify="center" direction="column" className="e-kit-library__error-screen">
						<DeactivatedIcon />
						<Heading
							tag="h3"
							variant="display-1"
							className="e-kit-library__error-screen-title"
						>
							{ __( 'Your library has been deactivated', 'elementor' ) }
						</Heading>
						<Text variant="xl" className="e-kit-library__error-screen-description">
							{ __( 'Your subscription is currently deactivated, but you still have a 90 day window to keep all your templates safe. Upgrade within this time to continue enjoying them without interruption.', 'elementor' ) }
						</Text>
						<Button
							text={ __( 'Upgrade now', 'elementor' ) }
							url={ renewUrl }
							target="_blank"
							className="e-kit-library__upgrade-button"
						/>
					</Grid>
				</Content>
			</div>
		</Layout>
	);
}

DeactivatedScreen.propTypes = {
	menuItems: PropTypes.array.isRequired,
	forceRefetch: PropTypes.func.isRequired,
	isFetching: PropTypes.bool.isRequired,
};
