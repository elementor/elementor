<?php

namespace Elementor\Tests\Phpunit\Includes\Base\Mock;

class Mock_Button__On_Save extends \Elementor\Widget_Button {
	protected function on_save( array $settings ) {
		return [ 'text' => 'On Save' ];
	}
}
