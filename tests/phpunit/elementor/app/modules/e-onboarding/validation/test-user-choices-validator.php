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

	public function test_validate_returns_empty_array_for_empty_params() {
		// Act
		$result = $this->validator->validate( [] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertEmpty( $result );
	}

	public function test_validate_building_for_accepts_string() {
		// Act
		$result = $this->validator->validate( [
			'building_for' => 'myself',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'myself', $result['building_for'] );
	}

	public function test_validate_building_for_accepts_null() {
		// Act
		$result = $this->validator->validate( [
			'building_for' => null,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNull( $result['building_for'] );
	}

	public function test_validate_building_for_rejects_non_string() {
		// Act
		$result = $this->validator->validate( [
			'building_for' => 123,
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_building_for', $result->get_error_code() );
	}

	public function test_validate_site_about_accepts_string_array() {
		// Act
		$result = $this->validator->validate( [
			'site_about' => [ 'blog', 'portfolio', 'ecommerce' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'blog', 'portfolio', 'ecommerce' ], $result['site_about'] );
	}

	public function test_validate_site_about_filters_non_strings() {
		// Act
		$result = $this->validator->validate( [
			'site_about' => [ 'blog', 123, 'portfolio', null, 'ecommerce' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'blog', 'portfolio', 'ecommerce' ], $result['site_about'] );
	}

	public function test_validate_site_about_rejects_non_array() {
		// Act
		$result = $this->validator->validate( [
			'site_about' => 'blog',
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_site_about', $result->get_error_code() );
	}

	public function test_validate_experience_level_accepts_string() {
		// Act
		$result = $this->validator->validate( [
			'experience_level' => 'intermediate',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'intermediate', $result['experience_level'] );
	}

	public function test_validate_experience_level_accepts_null() {
		// Act
		$result = $this->validator->validate( [
			'experience_level' => null,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNull( $result['experience_level'] );
	}

	public function test_validate_theme_selection_accepts_string() {
		// Act
		$result = $this->validator->validate( [
			'theme_selection' => 'modern-theme',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'modern-theme', $result['theme_selection'] );
	}

	public function test_validate_theme_selection_accepts_null() {
		// Act
		$result = $this->validator->validate( [
			'theme_selection' => null,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNull( $result['theme_selection'] );
	}

	public function test_validate_site_features_accepts_string_array() {
		// Act
		$result = $this->validator->validate( [
			'site_features' => [ 'contact_form', 'gallery', 'blog' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'contact_form', 'gallery', 'blog' ], $result['site_features'] );
	}

	public function test_validate_site_features_filters_non_strings() {
		// Act
		$result = $this->validator->validate( [
			'site_features' => [ 'contact_form', 123, 'gallery' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'contact_form', 'gallery' ], $result['site_features'] );
	}

	public function test_validate_site_features_rejects_non_array() {
		// Act
		$result = $this->validator->validate( [
			'site_features' => 'gallery',
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_site_features', $result->get_error_code() );
	}

	public function test_validate_sanitizes_strings() {
		// Act
		$result = $this->validator->validate( [
			'building_for' => '<script>alert("xss")</script>myself',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertStringNotContainsString( '<script>', $result['building_for'] );
	}

	public function test_validate_ignores_unknown_fields() {
		// Act
		$result = $this->validator->validate( [
			'building_for' => 'myself',
			'unknown_field' => 'some_value',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'building_for', $result );
		$this->assertArrayNotHasKey( 'unknown_field', $result );
	}

	public function test_validate_all_fields_together() {
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
}
