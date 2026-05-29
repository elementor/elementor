<?php

namespace Elementor\Modules\Audits;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	const FILTER_AUDITS = 'elementor/audits/audits';

	const REST_NAMESPACE = 'elementor/v1';

	public function get_name(): string {
		return 'audits';
	}
}
