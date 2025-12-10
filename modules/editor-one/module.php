<?php

namespace Elementor\Modules\EditorOne;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\EditorOne\Components\Elementor_One_Menu_Manager;
use Elementor\Modules\EditorOne\Components\Sidebar_Navigation_Handler;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'e_editor_one';

	public function get_name(): string {
		return 'editor-one';
	}

	public static function get_experimental_data(): array {
		return [
			'name'           => static::EXPERIMENT_NAME,
			'title'          => esc_html__( 'Editor one', 'elementor' ),
			'description'    => esc_html__( 'General', 'elementor' ),
			'hidden'         => true,
			'default'        => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public function __construct() {
		parent::__construct();

		if ( is_admin() ) {

			$this->add_component( 'editor-one-menu-manager', new Elementor_One_Menu_Manager() );
			$this->add_component( 'sidebar-navigation-handler', new Sidebar_Navigation_Handler() );
		}
	}
}
