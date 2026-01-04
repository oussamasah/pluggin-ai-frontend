# Streaming Debug Guide

## Problem
- Stream stops at "planning" step
- All chunks appear at once at the end instead of streaming incrementally

## Possible Causes

### Backend Issue (Most Likely)
If the backend is buffering chunks and sending them all at once, you'll see:
- All chunks arrive in a very short time window
- Console shows chunks with timestamps very close together
- Network tab shows one large response instead of multiple small ones

**Check in browser console:**
1. Look for chunk logs - are they all timestamped at the same time?
2. Check Network tab → find the `/query/stream` request
3. Look at the response - is it one big chunk or multiple small chunks?

### Frontend Issue (Less Likely)
If React is batching updates:
- Chunks are received incrementally (check console logs)
- But UI updates all at once
- This is less common with React 18

## How to Debug

### Step 1: Check Console Logs
Look for these logs when streaming:
- `🚀 Starting to read stream...`
- `📝 Chunk #X: ...` - These should appear with time gaps between them
- `⏱️ Time gap detected: X ms` - If you see this frequently, backend might be buffering

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "stream" or find `/query/stream` request
3. Click on it → Response tab
4. Check if you see:
   - Multiple `data: {...}` events coming in over time (GOOD)
   - One big response with all data at once (BAD - backend issue)

### Step 3: Check Backend
The backend should:
1. Send chunks as they're generated (not buffer)
2. Use proper SSE format: `data: {...}\n\n`
3. Flush after each chunk (not buffer)

## Expected Behavior

**Good Streaming:**
```
🚀 Starting to read stream...
📨 SSE Event: start Processing your query...
📨 SSE Event: progress planner Planning your query... 10%
📝 Chunk #1: Based (total: 5 chars)
📝 Chunk #2:  on (total: 8 chars)
📝 Chunk #3:  your (total: 13 chars)
... (chunks appear with small delays between them)
📨 SSE Event: complete
✅ Stream reading complete. Total chunks processed: 150
```

**Bad Streaming (Backend Buffering):**
```
🚀 Starting to read stream...
📨 SSE Event: start Processing your query...
📨 SSE Event: progress planner Planning your query... 10%
... (long pause)
📝 Chunk #1: Based (total: 5 chars)
📝 Chunk #2:  on (total: 8 chars)
... (all chunks appear within 100ms)
📝 Chunk #150: ... (total: 5000 chars)
📨 SSE Event: complete
✅ Stream reading complete. Total chunks processed: 150
```

## Fixes Applied

1. **Added detailed logging** - Now logs chunk count, timestamps, and time gaps
2. **Force array reference update** - Ensures React sees state changes
3. **Auto-scroll on chunks** - Keeps view updated as text streams
4. **Time gap detection** - Warns if chunks arrive in bursts

## Next Steps

1. **Test and check console** - Look at the logs to see chunk timing
2. **If chunks arrive in bursts** → Backend issue (check backend streaming implementation)
3. **If chunks arrive incrementally but UI doesn't update** → Frontend React batching issue (we can add flushSync)

