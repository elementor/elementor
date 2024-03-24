import AiPromotionInfotip from './ai-promotion-infotip';
import AiPromotionInfotipContent from './ai-promotion-infotip-content';
import { ThemeProvider } from '@elementor/ui';

import useIntroduction from '../hooks/use-introduction';
import { FocusOutListener, useFocusOutListener } from '../helpers/focus-out-listener';

const AiPromotionInfotipWrapper = ( { anchor, header, contentText, controlType, unmountAction, colorScheme } ) => {
	const focusOutListener = useFocusOutListener();
	const { isViewed, markAsViewed } = useIntroduction( `ai_promotion_introduction_${ controlType }` );
	if ( isViewed ) {
		return;
	}

	const { isViewedInThisEditorSession, markAsViewedInSession } = useIntroduction( `ai_promotion_introduction_editor_session_${ EDITOR_SESSION_ID }` );

	if ( isViewedInThisEditorSession ) {
		return;
	}

	markAsViewedInSession();

	return (
		<ThemeProvider colorScheme={ colorScheme }>
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
							focusOutListener.remove();
							unmountAction();
						} }
						onClick={ () => {
							markAsViewed();
							focusOutListener.remove();
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
	colorScheme: PropTypes.string,
};

export default AiPromotionInfotipWrapper;
