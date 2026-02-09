<?php

namespace Elementor\Modules\AtomicWidgets\Elements\V4_Tabs;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Number_Control;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
use Elementor\Modules\AtomicWidgets\Elements\Loader\Frontend_Assets_Loader;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Plugin;
use Elementor\Utils;

class V4Tabs extends Atomic_Element_Base
{

	use Has_Element_Template;

	static $requires_xml_parser = true;

	public function __construct($data = [], $args = null)
	{
		parent::__construct($data, $args);
		$this->meta('is_container', true);
	}


	public static function get_type()
	{
		return 'v4-tabs';
	}

	public static function get_element_type(): string
	{
		return 'v4-tabs';
	}

	public function get_title()
	{
		return esc_html__('Tabs', 'elementor');
	}

	public function get_keywords()
	{
		return ['ato', 'atom', 'atoms', 'atomic', 'tabs'];
	}

	public function get_icon()
	{
		return 'eicon-tabs';
	}

	protected static function define_props_schema(): array
	{
		return [
			'classes' => Classes_Prop_Type::make()
				->default([]),
			'active_tab' => Number_Prop_Type::make()
				->default(0)
				->meta(Overridable_Prop_Type::ignore()),
			'attributes' => Attributes_Prop_Type::make()->meta(Overridable_Prop_Type::ignore()),
		];
	}

	protected function define_allowed_child_types()
	{
		return ['none'];
	}

	protected function define_atomic_controls(): array
	{
		return [
			Section::make()
				->set_label(__('Settings', 'elementor'))
				->set_id('settings')
				->set_items([
					Number_Control::bind_to('active_tab')
						->set_label(__('Active tab', 'elementor')),
				]),
		];
	}

	protected function define_default_children()
	{
		return [
			Flexbox::generate()
				->settings([
					'attributes' => Attributes_Prop_Type::generate([
						Key_Value_Prop_Type::generate([
							'key' => String_Prop_Type::generate('slot'),
							'value' => String_Prop_Type::generate('tabs-menu'),
						]),
					]),
				])
				->editor_settings([
					'title' => 'Tabs menu',
				])
				/* ->is_locked( true ) */
				->build(),
			Div_Block::generate()->settings([
				'attributes' => Attributes_Prop_Type::generate([
					Key_Value_Prop_Type::generate([
						'key' => String_Prop_Type::generate('slot'),
						'value' => String_Prop_Type::generate('tabs-content-area'),
					]),
				]),
			])
				->editor_settings([
					'title' => 'Tabs content',
				])
				/* ->is_locked( true ) */
				->build(),
		];
	}

	protected function get_templates(): array
	{
		return [
			'elementor/elements/v4-tabs' => __DIR__ . '/v4tabs.html.twig',
		];
	}

	public function get_script_depends()
	{
		$global_depends = parent::get_script_depends();
		if (Plugin::$instance->preview->is_preview_mode()) {
			return array_merge($global_depends, ['v4-tabs-handler']);
		}

		return array_merge($global_depends, ['v4-tabs-handler']);
	}

	public function register_frontend_handlers()
	{
		$assets_url = plugin_dir_url(__FILE__);
		wp_register_script(
			'v4-tabs-handler',
			"{$assets_url}v4-tabs-handler.js",
			[Frontend_Assets_Loader::FRONTEND_HANDLERS_HANDLE],
			ELEMENTOR_VERSION,
			true
		);
	}
}
