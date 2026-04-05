

# Remove Submit Thud on Successful Unlock

## Problem
`playClickGlitch()` fires on every form submit (line 118), then `playUnlockSuccess()` fires when the password is valid (line 128). The thud plays first and sounds like failure, undermining the success chime that follows.

## Fix — `src/components/PasswordGate.tsx`
Move `playClickGlitch()` from the general submit path into the **failure** branch only. On success, only `playUnlockSuccess()` plays.

```
// Empty password → playClickGlitch (already there, keep)
// Valid password → playUnlockSuccess only (remove the pre-submit playClickGlitch)
// Wrong password → playClickGlitch (move it here)
```

Concretely: remove `playClickGlitch()` from line 118 (before the API call), and add it to the `else` branch when `data?.valid` is false.

## Result
- Empty submit: thud + shake (unchanged)
- Wrong password: thud + error state
- Correct password: clean success chime only

## File
- `src/components/PasswordGate.tsx`

