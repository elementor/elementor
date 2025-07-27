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

		$is_feature_active = Plugin::$instance->experiments->is_feature_active(self::NAME);

		// if ($is_feature_active) {
			$this->register_document_type();
			
			add_filter('elementor/editor/localize_settings', [$this, 'localize_settings']);
		// }
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

	public function get_component_documents()
	{
		$args = [
			'post_type' => Component::get_type(),
			'post_status' => 'publish',
			// 'meta_key' => '_elementor_template_type',
			'meta_value' => 'component',
			'posts_per_page' => -1,
		];

		return get_posts($args);
	}

	public function get_component_documents_mock(){
		return [
			[
				'id' => 461,
				'title' => 'First Component',
				'elType' => 'widget',
				'widgetType' => 'e-component',
			],
			[
				'id' => 467,
				'title' => 'Second Component',
				'elType' => 'widget',
				'widgetType' => 'e-component',
			],
		];
	}

	public function localize_settings($settings)
	{
		$settings['components'] = $this->get_component_documents_mock();

		return $settings;
	}
}