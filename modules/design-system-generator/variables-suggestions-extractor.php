<?php

namespace Elementor\Modules\Design_System_Generator;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/class-claude-api.php';

class Variables_Suggestions_Extractor {
 
	private $elements;  
    private $globals_map;
    private $colors;
    private $font_families;
    private $font_sizes;
    private $spacing;

	
	public function __construct($data = null, $globals_map = null) {
        if (! isset($data)) {
            $this->elements = require __DIR__ . '/sample-post.php';
        } else {
            $this->elements = $data;
        }

        if (! isset($globals_map)) {
            $this->globals_map = require __DIR__ . '/globals-example.php';
        } else {
            $this->globals_map = $globals_map;
        }
	}

    private function generate_colors_prompt($colors_data) {
        $prompt = "You are a design system color expert. Analyze this color token data and generate semantic CSS variable names.

For each color you'll see:
- HEX value
- Total occurrences in the design
- Where it's used (elements and properties)
- Current global title (if exists)

Generate semantic names following these patterns:
- Primary/Secondary/Accent: For main brand colors
- Background/Surface variants
- Text/Typography variants
- Border/Stroke variants
- Interactive states (hover, active)
- Use format: color-[semantic-meaning] (e.g., color-primary, color-text-dark)

Rules:
- Use kebab-case
- Consider usage frequency and context
- Use existing global titles as reference
- Maintain consistent color naming across the system

Here's the color token data:
" . json_encode($colors_data, JSON_PRETTY_PRINT) . "

Return ONLY a JSON array with this exact structure for each color:
[
  {
    \"value\": \"#FFFFFF\",
    \"occurrences\": 48,
    \"label\": \"color-primary\"
  }
]";

        return $prompt;
    }

    private function get_color_labels($colors_data) {
        try {
            // Load environment variables from .env file
            $env_path = __DIR__ . '/.env';
            error_log("Looking for .env file at: " . $env_path);
            
            if (file_exists($env_path)) {
                error_log(".env file found!");
                $env_lines = file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($env_lines as $line) {
                    if (strpos($line, '#') === 0) continue; // Skip comments
                    list($key, $value) = explode('=', $line, 2);
                    putenv(trim($key) . '=' . trim($value));
                }
                error_log("Environment variables loaded");
            } else {
                error_log("WARNING: .env file not found!");
            }

            error_log("\nCreating Claude API instance...");
            $claude = new \Elementor\Modules\Design_System_Generator\Claude_API();
            
            error_log("\nGenerating prompt...");
            $prompt = $this->generate_colors_prompt($colors_data);
            error_log("\nPrompt: " . $prompt);
            
            error_log("\nSending message to Claude...");
            $response = $claude->send_message($prompt);
            error_log("\nClaude response: " . json_encode($response));
            
            // Extract the JSON response from Claude's message
            if (isset($response['content'][0]['text'])) {
                $text = $response['content'][0]['text'];
                // Remove markdown code block markers if present
                $text = str_replace('```json', '', $text);
                $text = str_replace('```', '', $text);
                $labels = json_decode(trim($text), true);
                error_log("\nParsed labels: " . json_encode($labels));
                return $labels;
            }
            
            throw new \Exception('Unexpected response format from Claude API');
        } catch (\Exception $e) {
            error_log("\nError getting color labels from Claude: " . $e->getMessage());
            error_log("\nStack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    private function generate_font_sizes_prompt($font_sizes_data) {
        $prompt = "You are a design system typography expert. Analyze this font size token data and generate semantic CSS variable names.

For each font size you'll see:
- Size value (in px)
- Total occurrences in the design
- Where it's used (elements and properties)
- Current global title (if exists)

Generate semantic names following these patterns:
- Scale based: text-xs through text-2xl
- Special cases: text-display, text-heading, text-body
- Use format: text-[size] or text-[purpose]
- Consider relative size compared to other values

Rules:
- Use kebab-case
- Create a logical size scale
- Consider most common usage
- Use existing global titles as reference
- Maintain consistent scale across the system

Here's the font size token data:
" . json_encode($font_sizes_data, JSON_PRETTY_PRINT) . "

Return ONLY a JSON array with this exact structure for each font size:
[
  {
    \"value\": \"24px\",
    \"occurrences\": 21,
    \"label\": \"text-lg\"
  }
]";

        return $prompt;
    }

    private function get_font_size_labels($font_sizes_data) {
        try {
            error_log("\nCreating Claude API instance...");
            $claude = new \Elementor\Modules\Design_System_Generator\Claude_API();
            
            error_log("\nGenerating prompt...");
            $prompt = $this->generate_font_sizes_prompt($font_sizes_data);
            error_log("\nPrompt: " . $prompt);
            
            error_log("\nSending message to Claude...");
            $response = $claude->send_message($prompt);
            error_log("\nClaude response: " . json_encode($response));
            
            // Extract the JSON response from Claude's message
            if (isset($response['content'][0]['text'])) {
                $text = $response['content'][0]['text'];
                // Remove markdown code block markers if present
                $text = str_replace('```json', '', $text);
                $text = str_replace('```', '', $text);
                $labels = json_decode(trim($text), true);
                error_log("\nParsed labels: " . json_encode($labels));
                return $labels;
            }
            
            throw new \Exception('Unexpected response format from Claude API');
        } catch (\Exception $e) {
            error_log("\nError getting font size labels from Claude: " . $e->getMessage());
            error_log("\nStack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    private function generate_font_families_prompt($font_families_data) {
        $prompt = "You are a design system typography expert. Analyze this font family token data and generate semantic CSS variable names.

For each font family you'll see:
- Font family name
- Total occurrences in the design
- Where it's used (elements and properties)
- Current global title (if exists)

Generate semantic names following these patterns:
- Purpose based: font-heading, font-body, font-display
- Use format: font-[purpose]
- Consider most common usage

Rules:
- Use kebab-case
- Consider usage frequency and context
- Use existing global titles as reference
- Maintain consistent naming across the system

Here's the font family token data:
" . json_encode($font_families_data, JSON_PRETTY_PRINT) . "

Return ONLY a JSON array with this exact structure for each font family:
[
  {
    \"value\": \"Karla\",
    \"occurrences\": 52,
    \"label\": \"font-body\"
  }
]";

        return $prompt;
    }

    private function get_font_family_labels($font_families_data) {
        try {
            error_log("\nCreating Claude API instance...");
            $claude = new \Elementor\Modules\Design_System_Generator\Claude_API();
            
            error_log("\nGenerating prompt...");
            $prompt = $this->generate_font_families_prompt($font_families_data);
            error_log("\nPrompt: " . $prompt);
            
            error_log("\nSending message to Claude...");
            $response = $claude->send_message($prompt);
            error_log("\nClaude response: " . json_encode($response));
            
            // Extract the JSON response from Claude's message
            if (isset($response['content'][0]['text'])) {
                $text = $response['content'][0]['text'];
                // Remove markdown code block markers if present
                $text = str_replace('```json', '', $text);
                $text = str_replace('```', '', $text);
                $labels = json_decode(trim($text), true);
                error_log("\nParsed labels: " . json_encode($labels));
                return $labels;
            }
            
            throw new \Exception('Unexpected response format from Claude API');
        } catch (\Exception $e) {
            error_log("\nError getting font family labels from Claude: " . $e->getMessage());
            error_log("\nStack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    public function extract() {
        $this->colors = [];
        $this->font_families = [];
        $this->font_sizes = [];
        $this->spacing = [];

        error_log(json_encode($this->elements, JSON_PRETTY_PRINT));
        $this->loop_through_elements($this->elements);

        $result = $this->get_sorted_result();

        // // Get color labels from Claude
        // $color_labels = $this->get_color_labels($result['colors']);

        // // Merge labels with existing color data
        // if ($color_labels) {
        //     foreach ($color_labels as $label_data) {
        //         if (isset($result['colors'][$label_data['value']])) {
        //             $result['colors'][$label_data['value']]['label'] = $label_data['label'];
        //         }
        //     }
        // }

        // // Get font size labels from Claude
        // $font_size_labels = $this->get_font_size_labels($result['font_sizes']);

        // // Merge labels with existing font size data
        // if ($font_size_labels) {
        //     foreach ($font_size_labels as $label_data) {
        //         if (isset($result['font_sizes'][$label_data['value']])) {
        //             $result['font_sizes'][$label_data['value']]['label'] = $label_data['label'];
        //         }
        //     }
        // }

        // // Get font family labels from Claude
        // $font_family_labels = $this->get_font_family_labels($result['font_families']);

        // // Merge labels with existing font family data
        // if ($font_family_labels) {
        //     foreach ($font_family_labels as $label_data) {
        //         if (isset($result['font_families'][$label_data['value']])) {
        //             $result['font_families'][$label_data['value']]['label'] = $label_data['label'];
        //         }
        //     }
        // }
      
        
        $this->save_to_json_file($result);
        return $result;
    }

    public function get_sorted_result() {
        $result = [
            'colors' => $this->colors,
            'font_families' => $this->font_families,
            'font_sizes' => $this->font_sizes,
            'spacing' => $this->spacing,
        ];

        // Sort arrays while preserving the original values as keys
        foreach (['colors', 'font_families', 'font_sizes', 'spacing'] as $type) {
            $sorted = [];
            foreach ($result[$type] as $key => $value) {
                $value['value'] = $key;
                $sorted[$key] = $value;
            }
            uasort($sorted, function($a, $b) { 
                return $b['totalOccurrences'] - $a['totalOccurrences']; 
            });
            $result[$type] = $sorted;
        }

        return $result;
    }
    
    public function save_to_json_file($data, $filename = 'extract_vars_res.json') {
        // שמירה בשורש הפרויקט (Elementor root directory)
        $project_root = dirname(dirname(dirname(__FILE__))); // חזרה 3 רמות למעלה מהתיקייה הנוכחית
        $file_path = $project_root . '/' . $filename;
        
        $json_data = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        if (file_put_contents($file_path, $json_data)) {
            // error_log("Design System data saved to: $file_path");
            echo "\n<!-- File saved to: $file_path -->";
            return $file_path;
        } else {
            error_log("Failed to save design system data to file: $file_path");
            return false;
        }
    }
	
	public function loop_through_elements($elements) {
        foreach ($elements as $element) {
            // run cbs
            $this->extract_data_from_single_element($element);

            if (isset($element['elements'])) {
                $this->loop_through_elements($element['elements']);
            }
        }
    }

    public function extract_data_from_single_element($element) {
        foreach ($element['settings'] as $key => $value) {

            $is_color = fn($key) => strpos($key, 'color') !== false;
            $is_typography = fn($key) => strpos($key, 'typography') !== false;
            $is_spacing = fn($key) => strpos($key, 'margin') !== false || strpos($key, 'padding') !== false || strpos($key, 'gap') !== false;

            if ($is_color($key)) {
                $this->handle_color($value, $key, $element);
            }
            if ($is_typography($key)) {
                if ($key === 'typography_font_family') {
                    $this->handle_font_family($value, $key, $element);
                }
                if ($key === 'typography_font_size') {
                    $this->handle_font_size($value, $key, $element);
                }
            }
            if ($is_spacing($key)) {
                $this->handle_spacing($value, $key, $element);
            }

            $is_global = strpos($key, '__globals__') !== false;

            if ($is_global) {

                $get_id = fn($global_value) => explode('id=', $global_value)[1];
                
                foreach ($value as $global_key => $global_value) {
                    
                    if ($is_color($global_key)) {
                        $global = $this->globals_map['colors'][$get_id($global_value)];
                        $this->handle_color($global['value'], $global_key, $element, $global['title']);
                    }
                    if ($is_typography($global_key)) {
                        $global_typography = $this->globals_map['typography'][$get_id($global_value)];
                        $global_font_family = $global_typography['value']['typography_font_family'];
                        $global_font_size = $global_typography['value']['typography_font_size'];

                        $this->handle_font_family($global_font_family, 'typography_font_family', $element, $global_typography['title']);
                        $this->handle_font_size($global_font_size, 'typography_font_size', $element, $global_typography['title']);
                    }
                }
            }
        }
    }

    public function handle_color($color, $property, $element, $global_title = null) {
        $this->record_entity($this->colors, $color, $property, $element, $global_title);
    }

    public function handle_font_family($font_family, $property, $element, $global_title = null) {
        $this->record_entity($this->font_families, $font_family, $property, $element, $global_title);
        
            // error_log('Font family: ' . json_encode([$font_family, $property, $element['id']], JSON_PRETTY_PRINT));
            // error_log('Font family res: ' . json_encode($this->font_families, JSON_PRETTY_PRINT));


    }

    public function handle_font_size($font_size, $property, $element, $global_title = null) {
        $font_size_as_string = $font_size['size'] . $font_size['unit'];
        $this->record_entity($this->font_sizes, $font_size_as_string, $property, $element, $global_title);
    }

    public function handle_spacing($spacing, $property, $element, $global_title = null) {
        //handle margin and padding - record entity for top, right, bottom, left plus unit
        if (strpos($property, 'margin') !== false  || strpos($property, 'padding') !== false) {
            foreach (['top', 'right', 'bottom', 'left'] as $direction) {
                $size = $spacing[$direction];
                if (isset($size) && $size !== '' && $size !== '0') {
                    $this->record_entity($this->spacing, $size . $spacing['unit'], $property, $element, $global_title);
                }
            }
        }
        if (strpos($property, 'gap') !== false) {
            foreach (['column', 'row'] as $direction) {
                $size = $spacing[$direction];
                if (isset($size) && $size !== '' && $size !== '0') {
                    $this->record_entity($this->spacing, $size . $spacing['unit'], $property, $element, $global_title);
                }
            }
        }
    }

    public function record_entity(&$array, $entity, $property, $element, $global_title = null) {
        if (!isset($entity) || !is_string($entity)) {
            return;
        }

        if (!isset($array[$entity])) {
            // add entity to array
            $array[$entity] = [
                'totalOccurrences' => 0,
                'properties' => [],
            ];
            if ($global_title) {
                $array[$entity]['global_title'] = $global_title;
            }
        }
        // increment total occurrences
        $array[$entity]['totalOccurrences']++;

        // add property to entity
        if (!isset($array[$entity]['properties'][$property])) {
            $array[$entity]['properties'][$property] = [
                'totalOccurrences' => 0,
                'elements' => [],
            ];
        }
        $array[$entity]['properties'][$property]['totalOccurrences']++;

        // add element to property
        $element_type = $element['elType'] === 'widget' ? $element['widgetType'] : 'section';
        $current_count = isset($array[$entity]['properties'][$property]['elements'][$element_type]) 
            ? $array[$entity]['properties'][$property]['elements'][$element_type] 
            : 0;
        $array[$entity]['properties'][$property]['elements'][$element_type] = $current_count + 1;
    }
}

// if (php_sapi_name() === 'cli') {
//     try {
//         error_log("Starting script...");
//         $extractor = new Variables_Suggestions_Extractor();
//         $extractor->extract();
//     } catch (\Exception $e) {
//         error_log("Error: " . $e->getMessage());
//     }
// }



