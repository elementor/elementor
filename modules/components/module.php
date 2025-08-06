<?php
namespace Elementor\Modules\Components;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Components\Styles\Component_Styles;
use Elementor\Modules\Components\Documents\Component as Component_Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'e_components';
	const PACKAGES = [ 'editor-components' ];

	public function get_name() {
		return 'components';
	}

	public function __construct() {
		parent::__construct();

		$this->register_hooks();
		$this->register_document_type();
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Components', 'elementor' ),
			'description' => esc_html__( 'Enable components.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	private function register_document_type(){
        add_action('elementor/documents/register', function ($documents_manager) {
            $documents_manager->register_document_type(
                Component_Document::get_type(),
                Component_Document::get_class_full_name()
            );
        });
        error_log('--------------------------------register_document_type--------------------------------');
        register_post_type( Component_Document::get_type(), [
            'labels' => [
                'name' => esc_html_x( 'Components', '', 'elementor' ),
            ],
            'public' => true,
            'rewrite' => false,
            'menu_icon' => 'dashicons-admin-page',
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_nav_menus' => false,
            'exclude_from_search' => true,
            'capability_type' => 'post',
            'hierarchical' => false,
            'supports' => [ 'title', 'thumbnail', 'author', 'elementor', 'custom-fields' ],
            'show_in_rest' => true,
        ] );
    }

	private function register_hooks() {
		add_filter( 'elementor/editor/v2/packages', fn ( $packages ) => $this->add_packages( $packages ) );

		( new Component_Styles() )->register_hooks();
		( new Components_REST_API() )->register_hooks();

	}

	private function add_packages( $packages ) {
		return array_merge( $packages, self::PACKAGES );
	}
}
