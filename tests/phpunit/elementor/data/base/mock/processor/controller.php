<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Processor;

class Controller extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller {

	public function register_processors() {
		$this->register_processor( Processor::class );
	}
}
