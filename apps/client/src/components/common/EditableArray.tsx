import * as React from 'react';
import { Box, Typography, Input, Button, Chip, IconButton, Tooltip } from '@mui/joy';
import { Plus, Trash2, Info as InfoIcon } from 'lucide-react';

export interface EditableArrayProps {
  label: string;
  value: string[];
  onChange: (arr: string[]) => void;
  placeholder?: string;
  type?: string;
  tooltip?: string;
  disabled?: boolean;
}
export function EditableArray({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  tooltip,
  disabled = false,
}: EditableArrayProps) {
  const [input, setInput] = React.useState('');
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} variant="soft" color="primary" arrow>
            <InfoIcon
              size={15}
              style={{ marginLeft: 4, opacity: 0.7, cursor: 'pointer' }}
              aria-label="Info"
              tabIndex={0}
            />
          </Tooltip>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        {value?.map((item: string, idx: number) => (
          <Chip
            key={item + idx}
            endDecorator={
              <IconButton
                size="sm"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
                disabled={disabled}
                aria-label={`Remove ${item}`}
              >
                <Trash2 size={16} />
              </IconButton>
            }
          >
            {item}
          </Chip>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Input
          size="sm"
          value={input}
          placeholder={placeholder}
          type={type}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (!disabled && e.key === 'Enter' && input.trim()) {
              onChange([...(value || []), input.trim()]);
              setInput('');
            }
          }}
          sx={{ bgcolor: 'background.level2', color: 'text.primary' }}
          disabled={disabled}
          aria-label={label}
        />
        <Button
          size="sm"
          variant="soft"
          onClick={() => {
            if (!disabled && input.trim()) {
              onChange([...(value || []), input.trim()]);
              setInput('');
            }
          }}
          disabled={disabled}
          aria-label={`Add ${label}`}
        >
          <Plus size={18} />
        </Button>
      </Box>
    </Box>
  );
}
