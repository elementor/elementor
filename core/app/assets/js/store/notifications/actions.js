import { sliceActions } from './slice';

export default {
	notifyAnErrorDialog: ( { learnMoreUrl, ...payload } ) => ( dispatch ) => {
		const id = elementorCommon.helpers.getUniqueId(),
			notification = {
				id,
				ui: 'dialog',
				props: {
					dismissButtonText: __( 'Back', 'elementor' ),
					approveButtonText: __( 'Learn More', 'elementor' ),
					approveButtonUrl: learnMoreUrl,
					approveButtonColor: 'link',
					approveButtonTarget: '_blank',
					...payload,
				},
			};

		dispatch( sliceActions.notify( notification ) );

		return notification;
	},
};
