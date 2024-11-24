import { getAnimation } from '../api';
import usePrompt from './use-prompt';
import { useEffect } from 'react';

const getAnimationResult = async ( payload, motionEffectType ) => {
	return getAnimation( { ...payload, motionEffectType } );
};

const useAnimationPrompt = ( motionEffectType, widgetType, initialValue ) => {
	const { data, isLoading, error, reset, send, sendUsageData } = usePrompt(
		( payload ) => getAnimationResult( payload, motionEffectType ),
		initialValue,
	);

	const getControlData = ( controlKey ) => {
		const label = elementor.widgetsCache?.[ widgetType ?? '' ]?.controls[ controlKey ]?.label;
		const innerTab = elementor.widgetsCache?.[ widgetType ?? '' ]?.controls[ controlKey ]?.inner_tab;
		return { label, innerTab };
	};

	const processMotionEffects = ( jsonObject ) => {
		const result = {}; // See UT for example result

		const firstChildKey = Object.keys( jsonObject )[ 0 ];
		const firstChild = jsonObject[ firstChildKey ];
		const firstEnableControlKey = Object.keys( firstChild )[ 0 ];

		// First enabled property under scrolling_effects
		result[ firstEnableControlKey ] = {
			isParent: true,
			label: getControlData( firstEnableControlKey ).label,
			value: jsonObject.enabled[ firstEnableControlKey ],
			tabs: 0,
		};

		// Process other properties
		const processOtherProps = ( props ) => {
			for ( const [ key, value ] of Object.entries( props ) ) {
				if ( 'enabled' === key && value ) {
					const enableControlKey = Object.keys( value )[ 0 ];
					result[ enableControlKey ] = {
						isParent: false,
						label: getControlData( enableControlKey ).label,
						value: value[ enableControlKey ],
						tabs: 1,
					};
				} else {
					if ( 'none' === value || 'normal' === value ) {
						continue;
					}
					result[ key ] = {
						value,
					};
				}
			}
		};

		// Process all other inner properties
		for ( const [ propKey, propValue ] of Object.entries( jsonObject ) ) {
			if ( propKey !== 'enabled' && 'object' === typeof propValue ) {
				processOtherProps( propValue );
			}
		}

		return result;
	};

	const processEntranceEffects = ( jsonObject ) => {
		const result = {};

		const firstChildKey = Object.keys( jsonObject )[ 0 ];
		const firstChild = jsonObject[ firstChildKey ];

		result[ firstChildKey ] = {
			isParent: true,
			label: getControlData( firstChildKey ).label,
			value: firstChild,
			tabs: 0,
		};

		result[ firstChild ] = {
			isParent: false,
			label: firstChild,
			tabs: 1,
		};

		const processProps = ( props ) => {
			for ( const [ key, value ] of Object.entries( props ) ) {
				if ( 'none' === value || 'normal' === value ) {
					continue;
				}
				result[ key ] = {
					value,
				};
			}
		};

		for ( const [ propKey, propValue ] of Object.entries( jsonObject ) ) {
			if ( propKey !== firstChildKey && 'object' === typeof propValue ) {
				processProps( propValue );
			}
		}

		return result;
	};

	const processHoverEffects = ( jsonObject ) => {
		const result = {};
		let isHoverLabelAdded = false;
		const processProps = ( props ) => {
			for ( const [ key, value ] of Object.entries( props ) ) {
				if ( 'enabled' === key && value ) {
					const enableControlKey = Object.keys( value )[ 0 ];
					const { label, innerTab } = getControlData( enableControlKey );

					if ( ! isHoverLabelAdded ) {
						result[ innerTab ] = {
							isParent: true,
							label: getControlData( innerTab ).label,
							tabs: 0,
						};
						isHoverLabelAdded = true;
					}

					result[ enableControlKey ] = {
						isParent: false,
						label,
						value: value[ enableControlKey ],
						tabs: 1,
					};
				} else {
					if ( 'none' === value || 'normal' === value ) {
						continue;
					}
					result[ key ] = {
						value,
					};
				}
			}
		};

		for ( const [ , propValue ] of Object.entries( jsonObject ) ) {
			if ( 'object' === typeof propValue ) {
				processProps( propValue );
			}
		}

		return result;
	};

	const digestResult = ( jsonString ) => {
		let result = {};

		function traverse( currentObj ) {
			if ( ! currentObj || typeof currentObj !== 'object' ) {
				return;
			}
			for ( const key in currentObj ) {
				if ( ! currentObj.hasOwnProperty( key ) ) {
					continue;
				}

				if ( [ 'scrolling_effects', 'mouse_effects' ].includes( key ) ) {
					result = { ...result, ...processMotionEffects( currentObj[ key ] ) };
					continue;
				}

				if ( 'entrance_effects' === key ) {
					result = { ...result, ...processEntranceEffects( currentObj[ key ] ) };
					continue;
				}

				if ( 'hover_effects' === key ) {
					result = { ...result, ...processHoverEffects( currentObj[ key ] ) };
					return;
				}

				traverse( currentObj[ key ] );
			}
		}

		const obj = JSON.parse( jsonString );
		traverse( obj );
		return result;
	};

	useEffect( () => {
		if ( data.result ) {
			data.result = digestResult( data.result );
		}
	}, [ data ] );

	return {
		data,
		isLoading,
		error,
		reset,
		send,
		sendUsageData,
	};
};

export default useAnimationPrompt;
