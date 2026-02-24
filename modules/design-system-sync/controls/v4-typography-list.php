<?php
namespace Elementor\Modules\DesignSystemSync\Controls;

use Elementor\Base_UI_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V4_Typography_List extends Base_UI_Control {

	const TYPE = 'v4_typography_list';

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
				#>
				<div class="elementor-repeater-fields" role="listitem">
					<div class="elementor-repeater-row-controls e-v4-typography-list__row">
						<span class="elementor-control-title e-v4-typography-list__title">{{{ title }}}</span>
						<button class="e-v4-typography-list__edit-btn" disabled>
							<i class="eicon-edit" aria-hidden="true"></i>
						</button>
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
		];
	}
}
