<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Validation;

use Elementor\App\Modules\E_Onboarding\Validation\User_Choices_Validator;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_User_Choices_Validator extends TestCase {

	private User_Choices_Validator $validator;

	public function setUp(): void {
		parent::setUp();
		$this->validator = new User_Choices_Validator();
	}

	public function test_validates_complete_onboarding_choices() {
		// Act
		$result = $this->validator->validate( [
			'building_for' => 'client',
			'site_about' => [ 'ecommerce', 'blog' ],
			'experience_level' => 'advanced',
			'theme_selection' => 'business-theme',
			'site_features' => [ 'shop', 'contact_form' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'client', $result['building_for'] );
		$this->assertSame( [ 'ecommerce', 'blog' ], $result['site_about'] );
		$this->assertSame( 'advanced', $result['experience_level'] );
		$this->assertSame( 'business-theme', $result['theme_selection'] );
		$this->assertSame( [ 'shop', 'contact_form' ], $result['site_features'] );
	}

	public function test_accepts_nullable_fields() {
		// Act
		$result = $this->validator->validate( [
			'building_for' => null,
			'experience_level' => null,
			'theme_selection' => null,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNull( $result['building_for'] );
		$this->assertNull( $result['experience_level'] );
		$this->assertNull( $result['theme_selection'] );
	}

	public function test_rejects_invalid_types() {
		// Assert - building_for should be string, not int
		$result = $this->validator->validate( [ 'building_for' => 123 ] );
		$this->assertInstanceOf( \WP_Error::class, $result );

		// Assert - site_about should be array, not string
		$result = $this->validator->validate( [ 'site_about' => 'blog' ] );
		$this->assertInstanceOf( \WP_Error::class, $result );

		// Assert - site_features should be array, not string
		$result = $this->validator->validate( [ 'site_features' => 'gallery' ] );
		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	public function test_sanitizes_xss() {
		// Act
		$result = $this->validator->validate( [
			'building_for' => '<script>alert("xss")</script>myself',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertStringNotContainsString( '<script>', $result['building_for'] );
	}
}
