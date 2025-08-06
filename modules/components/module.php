<?php
namespace Elementor\Modules\Components;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Components\Documents\Component;
use Elementor\Plugin;

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule
{
	const NAME = 'components';

	public function get_name()
	{
		return 'components';
	}

	public function __construct()
	{
		parent::__construct();

		$this->register_features();
		$this->register_rest_api();

		$is_feature_active = Plugin::$instance->experiments->is_feature_active(self::NAME);

		// if ($is_feature_active) {
			$this->register_document_type();
		// }
	}

    public function get_widgets() {
		return [
            'Component',
		];
	}

	private function register_features()
	{
		Plugin::$instance->experiments->add_feature([
			'name' => self::NAME,
			'title' => esc_html__('Components', 'elementor'),
			'description' => esc_html__('Enable components.', 'elementor'),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		]);
	}

	private function register_document_type()
	{
		add_action('elementor/documents/register', function ($documents_manager) {
			$documents_manager->register_document_type(
				Component::get_type(),
				Component::get_class_full_name()
			);
		});
		error_log('--------------------------------register_document_type--------------------------------');
		register_post_type( Component::get_type(), [
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

	private function register_rest_api() {
		$rest_api = new Components_REST_API();
		$rest_api->register_hooks();
	}
}
