import React from 'react';
import { Select, TextField, Stack, Typography, InputAdornment, type SelectChangeEvent } from '@elementor/ui';
import { MenuListItem } from '@elementor/editor-ui';
import { entranceAnimationPropTypeUtil } from '@elementor/editor-props';
import type { 
  EntranceAnimationType,
  DurationType 
} from '../types/entrance-animation-control';
import { ENTRANCE_ANIMATIONS, DURATION_OPTIONS, DURATION_VALUES } from '../types/entrance-animation-control';
import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const EntranceAnimationControl = createControl(() => {
  const { value, setValue, disabled } = useBoundProp(entranceAnimationPropTypeUtil);
  
  // Provide default values if value is undefined or incomplete
  const safeValue = {
    animation: value?.animation?.value ?? '',
    duration: (value?.duration?.value ?? 'normal') as 'slow' | 'normal' | 'fast',
    delay: value?.delay?.value ?? 0,
  };

  const handleAnimationChange = (event: SelectChangeEvent<EntranceAnimationType>) => {
    const animation = event.target.value as EntranceAnimationType;
    setValue({
      animation: {
        $$type: 'string',
        value: animation
      },
      duration: {
        $$type: 'string',
        value: safeValue.duration
      },
      delay: {
        $$type: 'number',
        value: safeValue.delay
      }
    });
  };

  const handleDurationChange = (event: SelectChangeEvent<DurationType>) => {
    const duration = event.target.value as DurationType;
    setValue({
      animation: {
        $$type: 'string',
        value: safeValue.animation
      },
      duration: {
        $$type: 'string',
        value: duration
      },
      delay: {
        $$type: 'number',
        value: safeValue.delay
      }
    });
  };

  const handleDelayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const delay = parseFloat(event.target.value) || 0;
    setValue({
      animation: {
        $$type: 'string',
        value: safeValue.animation
      },
      duration: {
        $$type: 'string',
        value: safeValue.duration
      },
      delay: {
        $$type: 'number',
        value: delay
      }
    });
  };

  return (
    <ControlActions>
      <Stack direction="column" spacing={2}>
      
      {/* Animation Selection */}
      <Stack direction="column" spacing={1}>
        <Typography variant="caption" color="text.secondary">Animation</Typography>
        <Select
          value={safeValue.animation}
          onChange={handleAnimationChange}
          placeholder="Select animation"
          size="tiny"
          fullWidth
          disabled={disabled}
        >
          {Object.entries(ENTRANCE_ANIMATIONS).map(([key, label]) => (
            <MenuListItem key={key} value={key}>
              {label}
            </MenuListItem>
          ))}
        </Select>
      </Stack>

      {/* Duration Selection (Enum) */}
      <Stack direction="column" spacing={1}>
        <Typography variant="caption" color="text.secondary">Duration</Typography>
        <Select
          value={safeValue.duration}
          onChange={handleDurationChange}
          size="tiny"
          fullWidth
          disabled={disabled}
        >
          {DURATION_VALUES.map((duration) => (
            <MenuListItem key={duration} value={duration}>
              {DURATION_OPTIONS[duration]}
            </MenuListItem>
          ))}
        </Select>
      </Stack>

      {/* Delay Input (Number) */}
      <Stack direction="column" spacing={1}>
        <Typography variant="caption" color="text.secondary">Delay</Typography>
        <TextField
          type="number"
          size="tiny"
          fullWidth
          value={safeValue.delay}
          onChange={handleDelayChange}
          inputProps={{ min: 0, max: 5, step: 0.1 }}
          placeholder="0"
          disabled={disabled}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="caption" color="text.secondary">s</Typography>
              </InputAdornment>
            )
          }}
        />
      </Stack>
    </Stack>
    </ControlActions>
  );
});

export default EntranceAnimationControl; 