<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Presets {
	const DEFAULT_DURATION = 600;
	const DEFAULT_DELAY = 0;
	const DEFAULT_SLIDE_DISTANCE = 100;
	const DEFAULT_SCALE_START = 0;
	const DEFAULT_EASING = 'easeIn';

	const TRIGGERS = [ 'load', 'scrollIn', 'scrollOut', 'scrollOn', 'hover', 'click' ];

	const EFFECTS = [ 'fade', 'slide', 'scale', 'custom' ];
	const TYPES = [ 'in', 'out' ];
	const DIRECTIONS = [ 'left', 'right', 'top', 'bottom' ];

	public function defaults() {
		return [
			'defaultDuration' => self::DEFAULT_DURATION,
			'defaultDelay' => self::DEFAULT_DELAY,
			'slideDistance' => self::DEFAULT_SLIDE_DISTANCE,
			'scaleStart' => self::DEFAULT_SCALE_START,
			'defaultEasing' => self::DEFAULT_EASING,
		];
	}
}
