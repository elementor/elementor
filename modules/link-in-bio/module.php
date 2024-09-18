<?php

namespace Elementor\Modules\LinkInBio;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'link-in-bio';

	public function get_name(): string {
		return static::EXPERIMENT_NAME;
	}

	public function get_widgets(): array {
		return [
			'Link_In_Bio',
		];
	}

	// TODO: This is a hidden experiment which needs to remain enabled like this until 3.26 for pro compatibility.
	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Link In Bio', 'elementor' ),
			'hidden' => true,
			'default' => Manager::STATE_ACTIVE,
			'release_status' => Manager::RELEASE_STATUS_STABLE,
			'mutable' => false,
		];
	}

	protected function get_widgets_style_list():array {
		return [
			'widget-link-in-bio', // TODO: Remove in v3.27.0 [ED-15717]
			'widget-link-in-bio-base',
			'widget-link-in-bio-var-2',
			'widget-link-in-bio-var-3',
			'widget-link-in-bio-var-4',
			'widget-link-in-bio-var-5',
			'widget-link-in-bio-var-7',
		];
	}
}
