<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Animation extends Control_Base {

	public function get_type() {
		return 'animation';
	}

	private static $_animations = [
		'fadeIn' => 'Fade In',
		'fadeInDown' => 'Fade In Down',
		'fadeInDownBig' => 'Fade In Down Big',
		'fadeInLeft' => 'Fade In Left',
		'fadeInLeftBig' => 'Fade In Left Big',
		'fadeInRight' => 'Fade In Right',
		'fadeInRightBig' => 'Fade In Right Big',
		'fadeInUp' => 'Fade In Up',
		'fadeInUpBig' => 'Fade In Up Big',
	];

	public static function get_animations() {
		return self::$_animations;
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title"><%= data.label %></label>
			<div class="elementor-control-input-wrapper">
				<select data-setting="<%= data.name %>">
					<?php foreach ( self::$_animations as $animation_key => $animation_title ) { ?>
						<option value="<?php echo $animation_key; ?>"><?php echo $animation_title; ?></option>
					<?php } ?>
				</select>
			</div>
		</div>
		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}
}
