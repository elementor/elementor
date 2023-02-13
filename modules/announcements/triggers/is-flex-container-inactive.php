<?php

namespace Elementor\Modules\Announcements\Triggers;

use Elementor\Modules\Announcements\Classes\Trigger_Base;
use ElementorPro\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class IsFlexContainerInactive extends Trigger_Base {
	/**
	 * @var string
	 */
	protected string $name = 'is-flex-container-inactive';

	/**
	 * @return bool
	 */
	public function is_active(): bool {
		return Plugin::elementor()->experiments->is_feature_active( 'container' );
	}
}
