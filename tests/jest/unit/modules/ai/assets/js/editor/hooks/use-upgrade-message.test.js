import useUpgradeMessage, { USAGE_PERCENTAGE_THRESHOLD } from 'elementor/modules/ai/assets/js/editor/hooks/use-upgrade-message';
import useIntroduction from 'elementor/modules/ai/assets/js/editor/hooks/use-introduction';

jest.mock( 'elementor/modules/ai/assets/js/editor/hooks/use-introduction', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const BELOW_THRESHOLD_VALUE = USAGE_PERCENTAGE_THRESHOLD - 1;
const ABOVE_THRESHOLD_VALUE = USAGE_PERCENTAGE_THRESHOLD + 1;

describe( 'useUpgradeMessage', () => {
	it.each( [
		{
			label: 'Should only show the banner when a free user has not reached the threshold',
			isViewed: false,
			hasSubscription: false,
			usagePercentage: BELOW_THRESHOLD_VALUE,
			expectedShowBadge: true,
			expectedShowBanner: true,
		},
		{
			label: 'Should only show the badge when a free user has not reached the threshold and the banner was closed',
			isViewed: true,
			hasSubscription: false,
			usagePercentage: BELOW_THRESHOLD_VALUE,
			expectedShowBadge: true,
			expectedShowBanner: false,
		},
		{
			label: 'Should not show the badge or the banner when a paid user has not reached the threshold',
			isViewed: false,
			hasSubscription: true,
			usagePercentage: BELOW_THRESHOLD_VALUE,
			expectedShowBadge: false,
			expectedShowBanner: false,
		},
		{
			label: 'Should not show the badge or the banner when a paid user has not reached the threshold even if the banner was closed',
			isViewed: true,
			hasSubscription: true,
			usagePercentage: BELOW_THRESHOLD_VALUE,
			expectedShowBadge: false,
			expectedShowBanner: false,
		},
		{
			label: 'Should only show the badge when a free user has reached the threshold even if the banner was not closed',
			isViewed: false,
			hasSubscription: false,
			usagePercentage: ABOVE_THRESHOLD_VALUE,
			expectedShowBadge: true,
			expectedShowBanner: false,
		},
		{
			label: 'Should only show the badge when a free user has reached the threshold and the banner was closed',
			isViewed: true,
			hasSubscription: false,
			usagePercentage: ABOVE_THRESHOLD_VALUE,
			expectedShowBadge: true,
			expectedShowBanner: false,
		},
		{
			label: 'Should only show the badge when a paid user has reached the threshold and the banner was not closed',
			isViewed: false,
			hasSubscription: true,
			usagePercentage: ABOVE_THRESHOLD_VALUE,
			expectedShowBadge: true,
			expectedShowBanner: false,
		},
		{
			label: 'Should only show the badge when a paid user has reached the threshold and the banner was closed',
			isViewed: true,
			hasSubscription: true,
			usagePercentage: ABOVE_THRESHOLD_VALUE,
			expectedShowBadge: true,
			expectedShowBanner: false,
		},
	] )( '$label', ( {
		isViewed,
		hasSubscription,
		usagePercentage,
		expectedShowBadge,
		expectedShowBanner,
	} ) => {
		// Arrange
		useIntroduction.mockImplementation( () => ( { isViewed } ) );

		// Act
		const { showBadge, showBanner } = useUpgradeMessage( { hasSubscription, usagePercentage } );

		// Assert
		expect( showBadge ).toBe( expectedShowBadge );
		expect( showBanner ).toBe( expectedShowBanner );
	} );
} );

