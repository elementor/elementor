I am wondering if the current PHPUnit test, assert each aspect of the JSON structure.

Questions for verification:

 "props": {
                  "border-width": {
                    "$$type": "size", // Asserted?
                    "value": { // Asserted?
                      "size": 19, // Structure asserted?
                      "unit": "px" // Structure asserted?
                      // Assertion for no incorrect properties?
                    }
                    // Assertion for no incorrect properties?
                  },
                  "background": {
                    "$$type": "background", // Asserted?
                     // Assertion for no incorrect properties?
                    "value": {
                      "background-overlay": { // Asserted?
                        // Assertion for no incorrect properties?
                        "$$type": "background-overlay", // Asserted?
                        "value": [ // Array type Asserted?
                          { // Object type Asserted?
                            "$$type": "background-gradient-overlay", // Asserted?
                            "value": { // Object asserted?
                              "type": { // Type asserted?
                                "$$type": "string", // Asserted?
                                "value": "radial"
                              },
                              "angle": {
                                "$$type": "number",
                                "value": 180
                              },
                              "stops": {
                                "$$type": "gradient-color-stop",
                                "value": [
                                  {
                                    "$$type": "color-stop",
                                    "value": {
                                      "color": {
                                        "$$type": "color",
                                        "value": "rgba(198, 60, 60, 1)"
                                      },
                                      "offset": {
                                        "$$type": "number",
                                        "value": 0
                                      }
                                    }
                                  },
                                  {
                                    "$$type": "color-stop",
                                    "value": {
                                      "color": {
                                        "$$type": "color",
                                        "value": "rgb(255,255,255)"
                                      },
                                      "offset": {
                                        "$$type": "number",
                                        "value": 100
                                      }
                                    }
                                  }
                                ]
                              },
                              "positions": {
                                "$$type": "string",
                                "value": "bottom left"
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                },

[
  {
    "id": "42478f2",
    "elType": "e-flexbox",
    "settings": [],
    "elements": [
      {
        "id": "3c28554",
        "elType": "widget",
        "settings": {
          "classes": {
            "$$type": "classes",
            "value": [
              "e-3c28554-4795394"
            ]
          }
        },
        "elements": [],
        "widgetType": "e-heading",
        "styles": {
          "e-3c28554-4795394": {
            "id": "e-3c28554-4795394",
            "label": "local",
            "type": "class",
            "variants": [
              {
                "meta": {
                  "breakpoint": "desktop",
                  "state": null
                },
                "props": {
                  "border-width": {
                    "$$type": "size",
                    "value": {
                      "size": 19,
                      "unit": "px"
                    }
                  },
                  "border-color": {
                    "$$type": "color",
                    "value": "#883333"
                  },
                  "border-style": {
                    "$$type": "string",
                    "value": "inset"
                  },
                  "background": {
                    "$$type": "background",
                    "value": {
                      "background-overlay": {
                        "$$type": "background-overlay",
                        "value": [
                          {
                            "$$type": "background-gradient-overlay",
                            "value": {
                              "type": {
                                "$$type": "string",
                                "value": "radial"
                              },
                              "angle": {
                                "$$type": "number",
                                "value": 180
                              },
                              "stops": {
                                "$$type": "gradient-color-stop",
                                "value": [
                                  {
                                    "$$type": "color-stop",
                                    "value": {
                                      "color": {
                                        "$$type": "color",
                                        "value": "rgba(198, 60, 60, 1)"
                                      },
                                      "offset": {
                                        "$$type": "number",
                                        "value": 0
                                      }
                                    }
                                  },
                                  {
                                    "$$type": "color-stop",
                                    "value": {
                                      "color": {
                                        "$$type": "color",
                                        "value": "rgb(255,255,255)"
                                      },
                                      "offset": {
                                        "$$type": "number",
                                        "value": 100
                                      }
                                    }
                                  }
                                ]
                              },
                              "positions": {
                                "$$type": "string",
                                "value": "bottom left"
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                },
                "custom_css": null
              }
            ]
          }
        },
        "editor_settings": [],
        "version": "0.0"
      }
    ],
    "isInner": false,
    "styles": [],
    "editor_settings": [],
    "version": "0.0"
  }
]

---

# CRITICAL ANALYSIS: Schema Validation Gaps in PHPUnit Tests

## 🚨 FINDINGS: Our Tests Are DANGEROUSLY INSUFFICIENT

After analyzing the JSON structure above against our current PHPUnit implementation, I've identified **CRITICAL GAPS** that allow property mappers to break atomic widget schemas without detection.

### **Current Validation Depth vs Required Depth**

**What we validate:**
- Level 1: `$$type: "background"`
- Level 2: `background-overlay.$$type: "background-overlay"`
- Level 3: `background-gradient-overlay.$$type: "background-gradient-overlay"`
- **STOPS HERE** ❌

**What the schema requires:**
- Level 4: `stops.$$type: "gradient-color-stop"`
- Level 5: `stops.value[].$$type: "color-stop"`
- Level 6: `color.$$type: "color"` + `offset.$$type: "number"`
- Level 7: Exact field validation (no extras allowed)

### **Critical Vulnerabilities in Current Tests**

#### 1. **Missing Deep Nested Structure Validation**
```php
// CURRENT (INSUFFICIENT):
$this->assertEquals('gradient-color-stop', $gradientData['stops']['$$type']);
$this->assertIsArray($gradientData['stops']['value']);

// MISSING VALIDATION:
// - Each color-stop's $$type
// - Each color-stop's nested color structure  
// - Each color-stop's nested offset structure
// - Exact data types in nested objects
```

#### 2. **No "Extra Fields" Detection**
```php
// CURRENT: Only checks required fields exist
$this->assertArrayHasKey('type', $gradientData);
$this->assertArrayHasKey('angle', $gradientData);
$this->assertArrayHasKey('stops', $gradientData);

// MISSING: Assert NO extra fields exist
// A mapper could add 'invalidField' and we wouldn't detect it
```

#### 3. **Missing Recursive Type Validation**
```php
// MISSING VALIDATION FOR:
"color": {
  "$$type": "color",        // ← Not validated in nested context
  "value": "rgba(...)"      // ← Not validated for correct format
},
"offset": {
  "$$type": "number",       // ← Not validated in nested context  
  "value": 0                // ← Not validated for correct type
}
```

#### 4. **Missing Required Fields in Deep Structures**
```php
// The schema shows "positions" field:
"positions": {
  "$$type": "string",
  "value": "bottom left"
}

// OUR TESTS: Don't validate this field exists at all
```

### **Specific Risks Our Tests Don't Catch**

| Risk | Current Detection | Impact |
|------|------------------|---------|
| Extra fields in gradient data | ❌ None | Mappers can add invalid properties |
| Wrong $$type in color-stops | ❌ None | Frontend crashes possible |
| Missing offset in color-stops | ❌ None | Malformed gradient data |
| Wrong data type for offset.value | ❌ None | Type errors in frontend |
| Missing positions field | ❌ None | Incomplete gradient definition |
| String instead of number for angle | ❌ None | Runtime type errors |

### **Questions Our Tests Can't Answer**

1. ❓ **Can a mapper add `extraField: "invalid"` to gradient data?** → YES (undetected)
2. ❓ **Can color-stop have `$$type: "wrong-type"`?** → YES (undetected)  
3. ❓ **Can offset.value be string instead of number?** → YES (undetected)
4. ❓ **Can positions field be completely missing?** → YES (undetected)
5. ❓ **Can color.value be malformed?** → YES (undetected)

## 📋 COMPREHENSIVE FIX PLAN

### **Phase 1: Enhanced Base Validation Methods**

#### 1.1 Add Recursive Structure Validators
```php
// New methods needed in AtomicWidgetComplianceTestCase:

protected function assertValidGradientColorStopPropType(array $stops): void
protected function assertValidColorStopPropType(array $colorStop, string $context): void  
protected function assertValidGradientDataStructure(array $gradientData): void
protected function assertExactFields(array $data, array $requiredFields, string $context): void
protected function assertNoExtraFields(array $data, array $allowedFields, string $context): void
```

#### 1.2 Add Deep Type Validation
```php
protected function assertValidNestedColorPropType(array $color, string $context): void
protected function assertValidNestedNumberPropType(array $number, string $context): void
protected function assertValidNestedStringPropType(array $string, string $context): void
```

#### 1.3 Add Schema Completeness Validation
```php
protected function assertCompleteGradientSchema(array $gradientData): void {
    // Validate ALL required fields exist
    $requiredFields = ['type', 'angle', 'stops', 'positions'];
    $this->assertExactFields($gradientData, $requiredFields, 'gradient data');
    
    // Validate each field's structure
    $this->assertValidNestedStringPropType($gradientData['type'], 'gradient type');
    $this->assertValidNestedNumberPropType($gradientData['angle'], 'gradient angle');
    $this->assertValidGradientColorStopPropType($gradientData['stops']);
    $this->assertValidNestedStringPropType($gradientData['positions'], 'gradient positions');
}
```

### **Phase 2: Update Existing Tests**

#### 2.1 Enhance BackgroundGradientPropertyMapperTest
```php
// Replace current shallow validation with:
public function it_returns_exact_background_gradient_structure(): void {
    $result = $this->mapper->map_to_v4_atomic('background', 'linear-gradient(45deg, #667eea, #764ba2)');
    
    // ULTRA-SPECIFIC validation
    $this->assertValidBackgroundPropType($result);
    
    // Deep validation of gradient structure
    $gradientOverlay = $result['value']['background-overlay']['value'][0];
    $this->assertCompleteGradientSchema($gradientOverlay['value']);
    
    // Validate each color stop individually
    $stops = $gradientOverlay['value']['stops']['value'];
    foreach ($stops as $index => $stop) {
        $this->assertValidColorStopPropType($stop, "Color stop {$index}");
    }
}
```

#### 2.2 Add Negative Tests
```php
public function it_rejects_malformed_gradient_structures(): void {
    // Test that mappers can't create invalid structures
    // (This will require creating test doubles that return malformed data)
}
```

### **Phase 3: Universal Schema Validation**

#### 3.1 Create Schema Definition Files
```php
// Create schema definition files for each atomic widget type:
// - BackgroundGradientSchema.php
// - SizeSchema.php  
// - ColorSchema.php
// - DimensionsSchema.php
// - etc.
```

#### 3.2 Add Universal Schema Validator
```php
protected function assertMatchesAtomicSchema(array $result, string $schemaType): void {
    $schema = $this->getAtomicSchema($schemaType);
    $this->validateAgainstSchema($result, $schema);
}
```

### **Phase 4: Automated Schema Compliance**

#### 4.1 Add Schema Compliance Test Generator
```php
// Auto-generate tests for all property mappers based on their expected schema
public function generateSchemaComplianceTests(): void {
    foreach ($this->getAllPropertyMappers() as $mapper) {
        $this->generateTestForMapper($mapper);
    }
}
```

#### 4.2 Add CI/CD Schema Validation
```bash
# Add to CI pipeline:
composer run test:schema-compliance
```

## 🎯 SUCCESS CRITERIA

After implementing this plan, our tests should:

1. ✅ **Detect extra fields** in any nested structure
2. ✅ **Validate all $$type fields** at every nesting level  
3. ✅ **Ensure correct data types** for all nested values
4. ✅ **Validate complete schema compliance** for every atomic widget type
5. ✅ **Prevent any schema violations** from reaching production

## 🚀 IMPLEMENTATION PRIORITY

1. **CRITICAL (Week 1)**: Phase 1 - Enhanced base validation methods
2. **HIGH (Week 2)**: Phase 2 - Update existing tests  
3. **MEDIUM (Week 3)**: Phase 3 - Universal schema validation
4. **LOW (Week 4)**: Phase 4 - Automated compliance

## 💡 VALIDATION APPROACH

Each test should answer:
- ✅ Does the structure match the atomic widget schema EXACTLY?
- ✅ Are there NO extra fields at any nesting level?
- ✅ Are all $$type fields correct at every level?
- ✅ Are all data types correct for nested values?
- ✅ Are all required fields present at every level?

**GOAL: 500% certainty that our property mappers cannot break atomic widget schemas.**