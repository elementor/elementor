import AiPromotionInfotip from './ai-promotion-infotip';
import AiPromotionInfotipContent from './ai-promotion-infotip-content';
import { ThemeProvider } from '@elementor/ui';

import useIntroduction from '../hooks/use-introduction';
import { FocusOutListener, useFocusOutListener } from '../helpers/focus-out-listener';

const AiPromotionInfotipWrapper = ( { anchor, header, contentText, controlType, unmountAction } ) => {
	const focusOutListener = useFocusOutListener();
	const { isViewed, markAsViewed } = useIntroduction( `ai_promotion_introduction_${ controlType }` );
	if ( isViewed ) {
		return;
	}
	return (
		<ThemeProvider>
			<FocusOutListener
				listener={ focusOutListener }
				onFocusOut={ () => unmountAction() }
			>
				<AiPromotionInfotip anchor={ anchor[ 0 ] }
					focusOutListener={ focusOutListener }
					content={ <AiPromotionInfotipContent
						focusOutListener={ focusOutListener }
						header={ header }
						contentText={ contentText }
						onClose={ () => {
							markAsViewed();
							focusOutListener.disable();
							unmountAction();
						} }
						onClick={ () => {
							markAsViewed();
							focusOutListener.disable();
							unmountAction();
							anchor.trigger( 'click' );
						} }
					/> }
				/>
			</FocusOutListener>
		</ThemeProvider>
	);
};

AiPromotionInfotipWrapper.propTypes = {
	anchor: PropTypes.object,
	header: PropTypes.string,
	contentText: PropTypes.string,
	controlType: PropTypes.string,
	unmountAction: PropTypes.func,
};

export default AiPromotionInfotipWrapper;
