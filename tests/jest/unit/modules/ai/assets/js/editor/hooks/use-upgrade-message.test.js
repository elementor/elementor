import useUpgradeMessage, { USAGE_PERCENTAGE_THRESHOLD } from 'elementor/modules/ai/assets/js/editor/hooks/use-upgrade-message.js';
import useIntroduction from 'elementor/modules/ai/assets/js/editor/hooks/use-introduction.js';

jest.mock( 'elementor/modules/ai/assets/js/editor/hooks/use-introduction.js', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const BELOW_THRESHOLD_VALUE = USAGE_PERCENTAGE_THRESHOLD - 1;
const ABOVE_THRESHOLD_VALUE = USAGE_PERCENTAGE_THRESHOLD + 1;

describe( 'useUpgradeMessage', () => {
	it.each( [
		{
			isViewed: false,
			hasSubscription: false,
			usagePercentage: BELOW_THRESHOLD_VALUE,
			expectedShowBadge: false,
			expectedShowBanner: true,
		},
		{
			isViewed: true,
			hasSubscription: false,
			usagePercentage: BELOW_THRESHOLD_VALUE,
			expectedShowBadge: true,
			expectedShowBanner: false,
		},
		{
			isViewed: false,
			hasSubscription: true,
			usagePercentage: BELOW_THRESHOLD_VALUE,
			expectedShowBadge: false,
			expectedShowBanner: false,
		},
		{
			isViewed: true,
			hasSubscription: true,
			usagePercentage: BELOW_THRESHOLD_VALUE,
			expectedShowBadge: false,
			expectedShowBanner: false,
		},
		{
			isViewed: false,
			hasSubscription: false,
			usagePercentage: ABOVE_THRESHOLD_VALUE,
			expectedShowBadge: true,
			expectedShowBanner: false,
		},
		{
			isViewed: true,
			hasSubscription: false,
			usagePercentage: ABOVE_THRESHOLD_VALUE,
			expectedShowBadge: true,
			expectedShowBanner: false,
		},
		{
			isViewed: false,
			hasSubscription: true,
			usagePercentage: ABOVE_THRESHOLD_VALUE,
			expectedShowBadge: true,
			expectedShowBanner: false,
		},
		{
			isViewed: true,
			hasSubscription: true,
			usagePercentage: ABOVE_THRESHOLD_VALUE,
			expectedShowBadge: true,
			expectedShowBanner: false,
		},
	] )( 'isViewed: $isViewed | hasSubscription: $hasSubscription | usagePercentage: $usagePercentage', ( {
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

