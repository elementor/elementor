import * as React from 'react';
import { useState } from 'react';
import { ajax } from '@elementor/editor-v1-adapters';
import { BulbIcon } from '@elementor/icons';
import { Alert, AlertAction, type AlertProps, AlertTitle, styled, Typography } from '@elementor/ui';

import { createControl } from '../create-control';

type NoticeType = 'info' | 'success' | 'warning' | 'danger';

// Elementor's `Alert` forces `.MuiAlertTitle-root { marginBottom: 0 }` via a selector scoped to the
// Alert's own class. Repeating the `.MuiAlertTitle-root` class here matches that selector's specificity
// so this override applies reliably regardless of stylesheet insertion order.
const NoticeTitle = styled( AlertTitle )( {
	'&.MuiAlertTitle-root.MuiAlertTitle-root': {
		marginBottom: 4,
		fontStyle: 'italic',
	},
} );

type NoticeControlProps = {
	noticeType?: NoticeType;
	heading?: string;
	content?: string;
	dismissible?: string;
	buttonText?: string;
	buttonUrl?: string;
};

type ExtendedWindow = Window & {
	elementor?: {
		config?: {
			user?: {
				dismissed_editor_notices?: string[];
			};
		};
	};
};

const markNoticeAsDismissedInSession = ( dismissId: string ) => {
	const dismissedNotices = ( window as ExtendedWindow ).elementor?.config?.user?.dismissed_editor_notices;

	if ( dismissedNotices && ! dismissedNotices.includes( dismissId ) ) {
		dismissedNotices.push( dismissId );
	}
};

export const NoticeControl = createControl(
	( { noticeType = 'info', heading, content, dismissible, buttonText, buttonUrl }: NoticeControlProps ) => {
		const [ isDismissed, setIsDismissed ] = useState( false );

		if ( isDismissed || ! content ) {
			return null;
		}

		const severity: AlertProps[ 'severity' ] = noticeType === 'danger' ? 'error' : noticeType;
		const icon = noticeType === 'info' ? <BulbIcon fontSize="inherit" /> : undefined;

		const handleDismiss = () => {
			setIsDismissed( true );

			if ( ! dismissible ) {
				return;
			}

			markNoticeAsDismissedInSession( dismissible );

			ajax.load( {
				action: 'dismissed_editor_notices',
				unique_id: `dismiss-editor-notice-${ dismissible }`,
				data: { dismissId: dismissible },
			} ).catch( () => {} );
		};

		const handleActionClick = () => {
			setIsDismissed( true );

			if ( dismissible ) {
				markNoticeAsDismissedInSession( dismissible );
			}
		};

		return (
			<Alert variant="outlined" severity={ severity } icon={ icon } size="small" onClose={ handleDismiss }>
				{ heading && <NoticeTitle>{ heading }</NoticeTitle> }
				<Typography variant="caption" color="textSecondary" sx={ { fontStyle: 'italic' } }>
					{ content }
				</Typography>
				{ buttonText && buttonUrl && (
					<AlertAction
						variant="contained"
						color={ severity }
						target="_blank"
						rel="noopener noreferrer"
						href={ buttonUrl }
						onClick={ handleActionClick }
						sx={ { mt: 2 } }
					>
						{ buttonText }
					</AlertAction>
				) }
			</Alert>
		);
	}
);
