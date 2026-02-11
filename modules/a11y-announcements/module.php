<?php

namespace Elementor\Modules\A11yAnnouncements;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const MODULE_NAME = 'a11y-announcements';
	const ANNOUNCEMENT_DISPLAYED_OPTION = 'a11y-get-started-announcement';

	public function get_name() {
		return 'a11y-announcements';
	}

	public function __construct() {
		( new A11yAnnouncement() )->init();
	}
}
