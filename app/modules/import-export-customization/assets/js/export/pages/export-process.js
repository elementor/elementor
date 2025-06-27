import React from 'react';
import { Redirect } from '@reach/router';
import { Box, Stack } from '@elementor/ui';
import { BaseLayout, TopBar, PageHeader } from '../../components';
import { useExportContext } from '../../context/export-context';
import { useExportKit } from '../../hooks/use-export-kit';
import ExportProcessing from '../../components/export-processing';
import ExportError from '../../components/export-error';

export default function ExportProcess() {
	const { data, dispatch } = useExportContext();
	const { kitInfo, includes, plugins, isExportProcessStarted } = data;

	const { status, STATUS_PROCESSING, STATUS_ERROR } = useExportKit( {
		includes,
		kitInfo,
		plugins,
		isExportProcessStarted,
		dispatch,
	} );

	if ( ! isExportProcessStarted ) {
		return <Redirect to="/export-customization/" replace />;
	}

	const getStatusText = () => {
		if ( status === STATUS_PROCESSING ) {
			return __( 'Setting up your website template...', 'elementor' );
		}

		return __( 'Export failed', 'elementor' );
	};

	const headerContent = (
		<PageHeader title={ __( 'Export', 'elementor' ) } />
	);

	return (
		<BaseLayout topBar={ <TopBar>{ headerContent }</TopBar> }>
			<Box sx={ {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: 'calc(100vh - 120px)',
				p: 3,
			} }>
				<Box sx={ {
					maxWidth: '600px',
					textAlign: 'center',
					width: '100%',
				} }>
					<Stack spacing={ 3 } alignItems="center">
						{ status === STATUS_PROCESSING && (
							<ExportProcessing statusText={ getStatusText() } />
						) }

						{ status === STATUS_ERROR && (
							<ExportError statusText={ getStatusText() } />
						) }
					</Stack>
				</Box>
			</Box>
		</BaseLayout>
	);
}
