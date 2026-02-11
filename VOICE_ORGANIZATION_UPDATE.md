# Voice Organization Update

## Changes Made

### 1. Separated Voices by Gender
- **Male Voices Section**: All male voices grouped under "Male Voices" label (blue indicator)
- **Female Voices Section**: All female voices grouped under "Female Voices" label (pink indicator)

### 2. Changed Default Voice
- **Before**: `en-US-AriaNeural` (Female - Aria)
- **After**: `en-US-GuyNeural` (Male - Guy)

### 3. Implementation Details

#### File: `src/sections/Generator.tsx`

**Added Imports:**
```typescript
import {
  Select,
  SelectContent,
  SelectGroup,      // NEW
  SelectItem,
  SelectLabel,      // NEW
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
```

**Added Voice Filtering:**
```typescript
// Separate voices by gender
const maleVoices = voices.filter(v => v.gender === 'male');
const femaleVoices = voices.filter(v => v.gender === 'female');
```

**Updated Select Dropdown:**
```typescript
<SelectContent>
  {/* Male Voices Section */}
  <SelectGroup>
    <SelectLabel className="text-blue-600 font-semibold">Male Voices</SelectLabel>
    {maleVoices.map((voice) => (
      <SelectItem key={voice.id} value={voice.id}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>{voice.name}</span>
          <span className="text-gray-400 text-xs">({voice.accent})</span>
        </div>
      </SelectItem>
    ))}
  </SelectGroup>
  
  {/* Female Voices Section */}
  <SelectGroup>
    <SelectLabel className="text-pink-600 font-semibold">Female Voices</SelectLabel>
    {femaleVoices.map((voice) => (
      <SelectItem key={voice.id} value={voice.id}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-400" />
          <span>{voice.name}</span>
          <span className="text-gray-400 text-xs">({voice.accent})</span>
        </div>
      </SelectItem>
    ))}
  </SelectGroup>
</SelectContent>
```

## Key Features

✅ **Dynamic Categorization**: Uses `voice.gender` metadata - no hardcoding
✅ **Visual Separation**: Clear section labels with color coding
✅ **Male Default**: Opens with Guy (American male voice) selected
✅ **Preserved UI**: No changes to layout, styling, or responsiveness
✅ **Maintained Behavior**: All existing functionality intact

## Voice Distribution (from backend)

- **Male Voices**: ~29 voices
- **Female Voices**: ~30 voices
- **Total**: 59 voices across 15+ languages

## Testing

After Vercel redeploys:
1. Open voice dropdown
2. Should see "Male Voices" section first (blue label)
3. Followed by "Female Voices" section (pink label)
4. Default selection: Guy (Male, American)
5. All 59 voices properly categorized
