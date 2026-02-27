<?php
namespace Elementor\Modules\DesignSystemSync\Controls;

use Elementor\Base_UI_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V4_Color_Variable_List extends Base_UI_Control {

	const TYPE = 'v4_color_variable_list';

	public function get_type() {
		return self::TYPE;
	}

	public function content_template() {
		?>
		<label>
			<span class="elementor-control-title">{{{ data.label }}}</span>
		</label>
		<div class="elementor-repeater-fields-wrapper" role="list">
			<# _.each( data.items, function( item ) {
				var title = item[ data.title_field ] || '';
				var color = item[ data.color_field ] || '';
				#>
				<div class="elementor-repeater-fields" role="listitem">
					<div class="elementor-repeater-row-controls e-v4-color-variable-list__row">
						<span class="elementor-control-title e-v4-color-variable-list__title">{{{ title }}}</span>
						<span class="e-v4-color-variable-list__color-value">{{ color }}</span>
						<span class="e-v4-color-variable-list__color-swatch" style="background-color:{{ color }}; box-shadow: inset 0 0 0 7px var(--e-a-bg-default), 0 0 0 1px var(--e-a-border-color);"></span>
					</div>
				</div>
			<# } ); #>
		</div>
		<?php
	}

	protected function get_default_settings() {
		return [
			'items' => [],
			'title_field' => 'title',
			'color_field' => 'color',
		];
	}
}
