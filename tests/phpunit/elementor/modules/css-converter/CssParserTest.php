<?php

use PHPUnit\Framework\TestCase;
use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Exceptions\CssParseException;

class CssParserTest extends TestCase
{
    public function testSimpleClassParsing()
    {
        $css = "
            .button {
                background-color: red;
                color: white;
                padding: 10px;
            }
            .header {
                font-size: 24px;
                margin-bottom: 20px;
            }
        ";
        $parser = new CssParser();
        $parsed = $parser->parse($css);
        $classes = $parser->extract_classes($parsed);

        $this->assertCount(2, $classes);
        $this->assertArrayHasKey('button', $classes);
        $this->assertArrayHasKey('header', $classes);
        $this->assertEquals('red', $classes['button']['rules']['background-color']['value']);
        $this->assertEquals('24px', $classes['header']['rules']['font-size']['value']);
    }

    public function testCssVariablesExtraction()
    {
        $css = "
            :root {
                --primary-color: #007cba;
                --spacing: 20px;
            }
            .button {
                background-color: var(--primary-color);
                margin: var(--spacing);
            }
        ";
        $parser = new CssParser();
        $parsed = $parser->parse($css);
        $variables = $parser->extract_variables($parsed);

        $this->assertArrayHasKey('--primary-color', $variables);
        $this->assertEquals('#007cba', $variables['--primary-color']['value']);
        $this->assertArrayHasKey('--spacing', $variables);
        $this->assertEquals('20px', $variables['--spacing']['value']);
    }

    public function testEmptyCssThrowsException()
    {
        $this->expectException(CssParseException::class);
        $parser = new CssParser();
        $parser->parse('');
    }

    public function testComplexSelectorHandling()
    {
        $css = "
            .simple { color: red; }
            .parent .child { color: blue; }
            .button:hover { background: green; }
            #header { width: 100%; }
        ";
        $parser = new CssParser();
        $parsed = $parser->parse($css);
        $classes = $parser->extract_classes($parsed);
        $unsupported = $parser->extract_unsupported($parsed);

        $this->assertCount(1, $classes);
        $this->assertArrayHasKey('simple', $classes);
        $this->assertStringContainsString('.parent .child', $unsupported);
        $this->assertStringContainsString(':hover', $unsupported);
        $this->assertStringContainsString('#header', $unsupported);
    }

    public function testShorthandProperties()
    {
        $css = "
            .box {
                margin: 10px 20px 15px 5px;
                border: 1px solid black;
                background: red url(image.jpg) no-repeat center;
                font: bold 16px/1.5 'Arial', sans-serif;
            }
        ";
        $parser = new CssParser();
        $parsed = $parser->parse($css);
        $classes = $parser->extract_classes($parsed);

        $this->assertArrayHasKey('box', $classes);
        $this->assertArrayHasKey('margin', $classes['box']['rules']);
        $this->assertArrayHasKey('border', $classes['box']['rules']);
        $this->assertArrayHasKey('background', $classes['box']['rules']);
        $this->assertArrayHasKey('font', $classes['box']['rules']);
    }

    public function testImportantDeclarations()
    {
        $css = "
            .priority {
                color: red !important;
                background-color: blue;
                margin: 10px !important;
            }
        ";
        $parser = new CssParser();
        $parsed = $parser->parse($css);
        $classes = $parser->extract_classes($parsed);

        $this->assertArrayHasKey('priority', $classes);
        $this->assertTrue($classes['priority']['rules']['color']['important']);
        $this->assertFalse($classes['priority']['rules']['background-color']['important']);
        $this->assertTrue($classes['priority']['rules']['margin']['important']);
    }

    public function testAtRulesAndMediaQueries()
    {
        $css = "
            .simple { color: red; }
            @media (max-width: 768px) {
                .responsive { display: none; }
            }
            @keyframes slide {
                from { left: 0; }
                to { left: 100px; }
            }
            @import url('fonts.css');
            .animated { animation: slide 2s ease; }
        ";
        $parser = new CssParser();
        $parsed = $parser->parse($css);
        $classes = $parser->extract_classes($parsed);
        $unsupported = $parser->extract_unsupported($parsed);

        $this->assertArrayHasKey('simple', $classes);
        $this->assertArrayHasKey('animated', $classes);
        $this->assertStringContainsString('@media', $unsupported);
        $this->assertStringContainsString('@keyframes', $unsupported);
        $this->assertStringContainsString('@import', $unsupported);
    }
} 