import React, { useContext } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ResolverCheckbox from './components/resolver-checkbox/resolver-checkbox';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import Button from 'elementor-app/ui/molecules/button';
import Box from 'elementor-app/ui/atoms/box';
import Card from 'elementor-app/ui/card/card';
import List from 'elementor-app/ui/molecules/list';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

export default function ImportResolver( props ) {
	const context = useContext( Context ),
		navigate = useNavigate(),
		getFooter = () => (
			<WizardFooter separator justify="end">
				<Button
					text={ __( 'Previous', 'elementor' ) }
					variant="contained"
					onClick={ () => {
						context.dispatch( { type: 'SET_FILE', payload: null } );
						navigate( 'import' );
					} }
				/>
			</WizardFooter>
		),
		getLearnMoreLink = () => (
			<InlineLink url="https://go.elementor.com/app-what-are-kits" italic>
				{ __( 'Learn More', 'elementor' ) }
			</InlineLink>
		);

	return (
		<Layout type="import" footer={ getFooter() }>
			<section className="e-app-export-kit">
				<PageHeader
					heading={ __( 'Import a Template Kit', 'elementor' ) }
					description={ [
						__( 'Choose which Elementor components - pages, site settings, headers, etc. - to include in your kit file.', 'elementor' ),
						<React.Fragment key="description-secondary-line">
							{ __( 'By default, all of your components will be exported.', 'elementor' ) } { getLearnMoreLink() }
						</React.Fragment>,
					] }
				/>

				<Card className="e-site-part">
					<Card.Header padding="20" active>
						<Card.Headline>Select the items you want to keep and apply:</Card.Headline>
					</Card.Header>

					<Card.Body padding="20" passive>
						<Box>
							<List separated className="e-app-export-kit-content">
								<List.Item padding="20" key={ 1 } className="e-app-export-kit-content__item">
									<div>
										<Grid container noWrap>
											<ResolverCheckbox type="main-type" className="e-app-export-kit-content__checkbox" />

											<Grid item>
												<Heading variant="h4" tag="h3" className="e-app-export-kit-content__title">
													title
												</Heading>

												<Grid item>
													<Text variant="sm" tag="span" className="e-app-export-kit-content__description">
														description
													</Text>
												</Grid>
											</Grid>
										</Grid>
									</div>
								</List.Item>

								<List.Item padding="20" key={ 1 } className="e-app-export-kit-content__item">
									<div>
										<Grid container noWrap>
											<ResolverCheckbox type="main-type" className="e-app-export-kit-content__checkbox" />

											<Grid item>
												<Heading variant="h4" tag="h3" className="e-app-export-kit-content__title">
													title
												</Heading>

												<Grid item>
													<Text variant="sm" tag="span" className="e-app-export-kit-content__description">
														description
													</Text>
												</Grid>
											</Grid>
										</Grid>
									</div>
								</List.Item>
							</List>
						</Box>
					</Card.Body>
				</Card>
			</section>
		</Layout>
	);
}
