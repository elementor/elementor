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
			
			add_filter('elementor/editor/localize_settings', [$this, 'localize_settings']);
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
	}

	// public function get_component_documents()
	// {
	// 	$args = [
	// 		'post_type' => Component::get_type(),
	// 		'post_status' => 'publish',
	// 		// 'meta_key' => '_elementor_template_type',
	// 		'meta_value' => 'component',
	// 		'posts_per_page' => -1,
	// 	];

	// 	return get_posts($args);
	// }

	public function get_component_documents_mock(){
		return [
			[
				'component_id' => 461,
				'title' => 'Profile Card',
				'elType' => 'widget',
				'widgetType' => 'e-component',
				'custom' => [
						'component_id' => 461,
				],
			],
			[
				'component_id' => 467,
				'title' => 'Confirmation Modal',
				'elType' => 'widget',
				'widgetType' => 'e-component',
				'custom' => [
					'component_id' => 467,
				],
			],
			[
				'component_id' => 720,
				'title' => 'Button',
				'elType' => 'widget',
				'widgetType' => 'e-component',
				'custom' => [
					'component_id' => 720,
				],
			],
		];
	}

	public function localize_settings($settings)
	{
		// error_log('localize_settings: ' . print_r($this->get_component_documents_mock(), true));
		$settings['components'] = $this->get_component_documents_mock();
		$settings['doc_types'] = Plugin::$instance->documents->get_document_types();

		return $settings;
	}

	public function create_component($component_name, $content) {
		$document = Plugin::$instance->documents->create(
			Component::get_type(),
			[
				'post_title' => $component_name,
				'post_status' => 'publish',
			]
		);

		if ( is_wp_error( $document ) ) {
			return $document;
		}

		$document->save( [
			'elements' => $content,
		] );

		$template_id = $document->get_main_id();

		return $template_id;
	}

	private function register_rest_api() {
		$rest_api = new Components_REST_API();
		$rest_api->register_hooks();
	}
}
