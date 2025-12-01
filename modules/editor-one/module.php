<?php

namespace Elementor\Modules\EditorOne;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'e_editor_one';

	public function get_name() {
		return 'editor-one';
	}

	public static function get_experimental_data() {
		return [
			'name'           => static::EXPERIMENT_NAME,
			'title'          => esc_html__( 'Editor one', 'elementor' ),
			'description'    => esc_html__( 'General', 'elementor' ),
			'hidden'         => true,
			'default'        => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}
}
