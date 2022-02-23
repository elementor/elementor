<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Utils\Checking;

use Elementor\Core\Utils\Checking\Check;
use Elementor\Tests\Phpunit\Elementor\Core\Utils\Checking\Mock\Check_Mock;
use ElementorEditorTesting\Elementor_Test_Base;

abstract class Checking_Test_Base extends Elementor_Test_Base {

	const CHECK_MOCK_CLASS_NAME = 'Check_Mock';

	public function create_abstract_check_mock( $class_name = self::CHECK_MOCK_CLASS_NAME, $mocked_methods = [], $constructor_args = [] ) {
		$class = $this->getMockForAbstractClass(
			Check::class,
			[],
			$class_name,
			true, true, true,
			$mocked_methods
		);

		$class->__construct( ...$constructor_args );

		return $class;
	}

	public function create_check_mock( $mocked_methods = [], $constructor_args = [] ) {
		$class = $this->getMockBuilder( Check_Mock::class )
			->enableProxyingToOriginalMethods()
			->setConstructorArgs( $constructor_args )
			->setMethods( $mocked_methods )
			->getMock();

		//$class->__construct( ...$constructor_args );

		return $class;
	}
}
