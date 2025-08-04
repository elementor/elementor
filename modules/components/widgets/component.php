<?php
namespace Elementor\Modules\Components\Widgets;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;


use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\Image\Placeholder_Image;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Plugin;
use Elementor\Utils;

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

class Component extends Atomic_Widget_Base
{
	// use Has_Template;

	private $component_id;

	private $component_title;

	const LINK_BASE_STYLE_KEY = 'link-base';

	// public function __construct($data = [], $args = null)
	// {
	// 	parent::__construct($data, $args);

	// 	if (isset($data['component_id'])) {

	// 		// $this->set_settings( [
	// 		// 	'component_id' => [
	// 		// 		'type' => 'text',
	// 		// 		'value' => $data['component_id'] ?? '',
	// 		// 	],
	// 		// ] );
	// 		$this->component_id = $data['component_id'] ?? null;
	// 		$this->component_title = $data['title'] ?? null;
	// 	}
	// }

	public static function get_element_type(): string
	{
		return 'e-component';
	}

	public function get_title()
	{
		$title = esc_html__('Component', 'elementor');


		if (isset($this->get_settings) && null !== $this->get_settings('component_title')) {
			$title = $this->get_settings('component_title')['value'];
		}

		return $title;
	}

	public function get_keywords()
	{
		return ['component'];
	}

	public function get_icon()
	{
		return 'eicon-user-circle-o';
	}

	protected static function define_props_schema(): array
	{
		$props = [
			'component_id' => Number_Prop_Type::make(),
			'component_title' => String_Prop_Type::make(),
		];

		return $props;
	}

	protected function define_atomic_controls(): array
	{
		return [];
	}

	protected function get_settings_controls(): array
	{
		return [];
	}

	protected function render()
	{
		if ( null === $this->get_settings( 'component_id' ) ) {
			return;
		}

		$post_id = $this->get_settings('component_id')['value'];

		// show draft if in editor canvas or in preview
		if (Plugin::$instance->editor->is_edit_mode() || is_preview()){
			// ignoring author
			$draft = Utils::get_post_autosave( $post_id );

			if ( $draft ) {
				$post_id = $draft->ID;
			}
			// by author
			// $draft_id = Plugin::$instance->documents->get_doc_or_auto_save($post_id)->get_post()->ID;
		}

		


		// error_log('this->component_id: ' . $this->component_id);
		// error_log('get_settings( component_id )[value]: ' . $this->get_settings('component_id')['value']);

		// error_log('post id: ' . $post_id);
		echo '<div class="e-component">';
		echo Plugin::$instance->frontend->get_builder_content($post_id);
		echo '</div>';
	}

}