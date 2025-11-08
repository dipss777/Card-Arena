# 🔧 Fixes & Troubleshooting Guide

## Table of Contents
1. [Complete Fix Guide](#complete-fix-guide)
2. [Socket.IO Fixes](#socketio-fixes)
3. [Testing Guide](#testing-guide)

---


## The Real Issue

The problem is that Socket.IO needs to connect through the Vite proxy, but it was trying to connect directly.

## ✅ Final Solution

### What Changed:

1. **`frontend/src/services/socket.ts`**
   - Set `SOCKET_URL` to empty string `''` 
   - This makes Socket.IO connect to **same origin** (the ngrok URL)
   - Added explicit `path: '/socket.io'` to use Vite proxy

2. **`frontend/vite.config.ts`**
   - Already configured to proxy `/socket.io` → `localhost:3001`
   - WebSocket support enabled

---

## 🚀 Step-by-Step Setup

### Step 1: Clean Everything
```bash
# Kill all processes
pkill -f "node"
pkill -f "ngrok"

# Wait a moment
sleep 2
```

### Step 2: Start the Script
```bash
./start-ngrok.sh
```

**Keep this terminal open!** Don't close it.

### Step 3: Verify Everything is Running
In a NEW terminal:
```bash
./test-ngrok.sh
```

This will check:
- ✅ Backend running on 3001
- ✅ Frontend running on 3000  
- ✅ ngrok tunnel active
- ✅ All services responding

### Step 4: Get the ngrok URL
The script will show:
```
🌍 Share this URL with friends ANYWHERE:
   https://something.ngrok-free.dev
```

### Step 5: Test on Your Device First
1. Open the ngrok URL in YOUR browser
2. Open DevTools (F12) → Console tab
3. You should see: `Connected to server`
4. Try creating a room

### Step 6: Test from Another Device
1. Open the SAME ngrok URL on phone/tablet
2. Open DevTools if possible (Chrome on Android)
3. Look for connection errors
4. Try joining the room

---

## 🔍 Debugging

### Check 1: What URL is Socket.IO using?

Open browser console and type:
```javascript
console.log(window.location.origin)
```

Should show: `https://your-url.ngrok-free.dev`

### Check 2: Is WebSocket connecting?

In DevTools:
1. Network tab
2. Filter: `WS` (WebSocket)
3. Should see: `socket.io/?EIO=4&transport=websocket`
4. Status should be: `101 Switching Protocols` (green)

### Check 3: Backend accessible through proxy?

Open in browser:
```
https://your-url.ngrok-free.dev/health
```

Should NOT show: `{"error":"Not found"}`
Should show: Backend health response OR 404 (which means proxy is working)

### Check 4: Console errors?

Look for errors like:
- ❌ `ERR_CONNECTION_REFUSED` → Backend not running
- ❌ `WebSocket connection failed` → Proxy not working
- ❌ `CORS error` → Backend CORS issue
- ❌ `404 on /socket.io` → Path issue

---

## 🐛 Common Issues

### Issue: "Still connecting to localhost"

**Solution:**
The frontend uses empty string `''` for SOCKET_URL, which means "same origin".
- When on localhost → connects to localhost
- When on ngrok → connects to ngrok URL

This is correct!

### Issue: "WebSocket connection failed"

**Check:**
1. Is backend running? `lsof -i :3001`
2. Is Vite proxy configured? Check `vite.config.ts`
3. Restart everything

**Solution:**
```bash
pkill -f "node"
pkill -f "ngrok"
./start-ngrok.sh
```

### Issue: "CORS error"

**Solution:**
Backend should auto-allow ngrok domains. If not:
```bash
# Edit backend/.env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Restart backend
cd backend
npm run dev
```

### Issue: "Can create room on my device, not on friend's"

This is the ORIGINAL problem. **Solution:**

1. **Verify Vite proxy is working:**
   ```bash
   # On your device
   curl https://your-url.ngrok-free.dev/socket.io/
   
   # Should NOT return "Not found"
   # Should return socket.io response or proper proxy error
   ```

2. **Check browser console on friend's device:**
   - What URL is it trying to connect to?
   - Any WebSocket errors?
   - Any CORS errors?

3. **Verify socket.ts has correct code:**
   ```typescript
   const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';
   
   this.socket = io(SOCKET_URL, {
     path: '/socket.io',  // Must have this!
     transports: ['websocket', 'polling'],
     // ... rest
   });
   ```

---

## 📊 How It Should Work

### Your Device:
```
Browser (localhost:3000)
    ↓
Frontend JS: io('') → connects to same origin
    ↓
http://localhost:3000/socket.io
    ↓
Vite Proxy → localhost:3001
    ↓
Backend ✅
```

### Friend's Device:
```
Browser (https://abc.ngrok-free.dev)
    ↓
Frontend JS: io('') → connects to same origin
    ↓
https://abc.ngrok-free.dev/socket.io
    ↓
ngrok tunnel → Your Vite (localhost:3000)
    ↓
Vite Proxy → Your Backend (localhost:3001)
    ↓
Backend ✅
```

---

## 🧪 Manual Test

### Test 1: Backend Direct
```bash
curl http://localhost:3001/health
# Should work
```

### Test 2: Frontend Direct
```bash
curl http://localhost:3000
# Should return HTML
```

### Test 3: Frontend through ngrok
```bash
curl https://your-url.ngrok-free.dev
# Should return HTML
```

### Test 4: Socket.IO through ngrok
```bash
curl https://your-url.ngrok-free.dev/socket.io/
# Should NOT return {"error":"Not found"}
```

If Test 4 fails → Vite proxy not working!

---

## ✅ Success Indicators

When everything works:

### On Your Device:
- ✅ Can open ngrok URL
- ✅ See game interface
- ✅ Console: "Connected to server"
- ✅ Can create room
- ✅ Can play cards

### On Friend's Device:
- ✅ Can open ngrok URL
- ✅ See game interface
- ✅ Console: "Connected to server" (check this!)
- ✅ Can see public rooms OR join with code
- ✅ Can play cards
- ✅ Real-time updates work

---

## 🔄 If Still Not Working

### Option 1: Try Same WiFi Instead
```bash
./start-network.sh
```
This is simpler and doesn't have proxy issues.

### Option 2: Use 2 ngrok Tunnels (ngrok Pro)
Upgrade to ngrok Pro ($8/month):
- Tunnel 1: Frontend
- Tunnel 2: Backend
- No proxy needed

### Option 3: Deploy to Cloud
Railway.app or Vercel (free):
- No ngrok needed
- Permanent URL
- See `NETWORK_PLAY_GUIDE.md`

---

## 📞 Share These Details

If still not working, share:

1. **Output of test script:**
   ```bash
   ./test-ngrok.sh
   ```

2. **Browser console errors** (F12 → Console tab)
   - Screenshot if possible
   - Copy error messages

3. **Network tab** (F12 → Network → WS filter)
   - WebSocket status
   - Connection URL

4. **From friend's device:**
   - What do they see?
   - Any error messages?
   - Can they load the page?

---

## 🎯 Key Points

1. ✅ Socket.IO URL is `''` (empty string = same origin)
2. ✅ Explicit `path: '/socket.io'` for Vite proxy
3. ✅ Vite proxy forwards to localhost:3001
4. ✅ Only 1 ngrok tunnel needed (frontend)
5. ✅ Backend stays local (faster)

---

**Last Updated:** November 8, 2025  
**Status:** Final comprehensive fix  
**Test:** Run `./test-ngrok.sh` to verify


---

# Socket.IO Fixes


## Problem Identified
Remote devices were trying to connect to `ws://localhost:3001/socket.io/` instead of connecting through the ngrok URL.

## Root Cause
The `start-ngrok.sh` script was creating a `frontend/.env` file with:
```
VITE_SOCKET_URL=http://localhost:3001
```

This caused Socket.IO on remote browsers to try connecting to their own localhost instead of the ngrok URL.

## Solution Applied
1. **Updated `start-ngrok.sh`** to NOT create `.env` file
2. **Removed existing `frontend/.env`** file
3. Socket.IO now uses empty `VITE_SOCKET_URL`, which means:
   - Connects to same origin (the ngrok URL when accessed remotely)
   - Vite proxy forwards `/socket.io` to `localhost:3001` backend
   - Works correctly for both local and remote devices

## How It Works Now
```
Remote Device Browser (https://xxx.ngrok-free.dev)
  ↓ Socket.IO connects to same origin
  ↓ wss://xxx.ngrok-free.dev/socket.io
  ↓ ngrok tunnel forwards to
  ↓ http://localhost:3000 (Vite dev server)
  ↓ Vite proxy forwards /socket.io to
  ↓ http://localhost:3001 (Backend)
  ✅ Connected!
```

## Testing
1. Start services: `./start-ngrok.sh`
2. Share the ngrok URL with your friend
3. Friend opens URL in browser
4. Socket.IO should connect successfully via same-origin

## Status
✅ Fixed
✅ Ready to test with remote device


---

# Testing Guide


## ✅ What Was Fixed

### Problem
Remote devices were seeing this error:
```
WebSocket connection to 'ws://localhost:3001/socket.io/' failed
```

### Root Cause
The `start-ngrok.sh` script was creating a `frontend/.env` file with:
```
VITE_SOCKET_URL=http://localhost:3001
```

This made Socket.IO on **remote browsers** try to connect to their own localhost instead of your server.

### Solution
1. ✅ Removed `frontend/.env` file
2. ✅ Updated `start-ngrok.sh` to not create .env
3. ✅ Socket.IO now uses **same-origin** connection
4. ✅ Created `quick-start.sh` for easier testing

## 🚀 How to Test (Step by Step)

### 1. Start Services
```bash
./quick-start.sh
```

You should see:
```
✅ Backend running on http://localhost:3001
✅ Frontend running on http://localhost:3000
✅ ngrok tunnel: https://mussier-kylah-medullary.ngrok-free.dev
```

### 2. Test Locally First
1. Open http://localhost:3000 in YOUR browser
2. Click "Quick Play"
3. You should see "Waiting for players..."
4. ✅ If this works, local setup is correct

### 3. Test with Friend's Device
1. **Share the ngrok URL** with your friend:
   ```
   https://mussier-kylah-medullary.ngrok-free.dev
   ```

2. Friend opens it in their browser

3. **Check browser console** (F12 → Console):
   - ✅ Should see: `Connected to server`
   - ❌ Should NOT see: `WebSocket connection to 'ws://localhost:3001' failed`

4. Friend clicks "Quick Play"

5. **Both should connect** to the same room!

## 🔍 How It Works Now

```
Friend's Browser (https://xxx.ngrok-free.dev)
  ↓
  Opens frontend HTML/JS from ngrok
  ↓
  Socket.IO connects to SAME ORIGIN (ngrok URL)
  ↓
  wss://xxx.ngrok-free.dev/socket.io
  ↓
  ngrok tunnel forwards to → http://localhost:3000
  ↓
  Vite proxy forwards /socket.io → http://localhost:3001
  ↓
  ✅ Backend receives connection!
```

## 🐛 Debugging

### If friend sees "localhost" error again:
```bash
# Check if .env file exists (it shouldn't!)
ls frontend/.env

# If it exists, remove it:
rm frontend/.env

# Restart services:
pkill -f ngrok; pkill -f vite; pkill -f nodemon
./quick-start.sh
```

### Check Socket Configuration:
```bash
# This should be empty or not exist:
cat frontend/.env
```

### Monitor Real-Time Logs:
```bash
# Backend logs:
tail -f logs/backend.log

# Frontend logs:
tail -f logs/frontend.log

# ngrok logs:
tail -f logs/ngrok.log
```

### Test Backend Health:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","timestamp":"...","rooms":0}
```

## 📝 Important Notes

1. **ngrok URL Changes**: The URL changes every time you restart ngrok (free tier)
2. **2 Hour Limit**: ngrok free tier has 2-hour sessions
3. **Keep Terminal Open**: Don't close the terminal running quick-start.sh
4. **Same-Origin is Key**: Socket.IO must connect to same origin (ngrok URL), not localhost

## 🎯 Expected Behavior

### ✅ Success Signs:
- Friend sees the game interface
- Browser console shows "Connected to server"
- WebSocket connects to `wss://xxx.ngrok-free.dev/socket.io`
- Both players can create/join rooms

### ❌ Failure Signs:
- Browser console shows "ws://localhost:3001" error
- WebSocket fails to connect
- Friend can't create or join rooms

## 🆘 If Still Not Working

1. **Verify .env is gone**:
   ```bash
   rm -f frontend/.env
   ```

2. **Check Socket.IO config** in `frontend/src/services/socket.ts`:
   ```typescript
   const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';  // Should be empty!
   ```

3. **Hard refresh** on friend's browser: `Ctrl+F5` or `Cmd+Shift+R`

4. **Check ngrok logs**:
   ```bash
   tail -f logs/ngrok.log
   ```
   Look for "started tunnel" message

5. **Test ngrok endpoint**:
   ```bash
   curl -I https://mussier-kylah-medullary.ngrok-free.dev
   ```
   Should return HTTP 200

## 🎮 Ready to Play!

Once you see:
- ✅ Backend running
- ✅ Frontend running  
- ✅ ngrok tunnel active
- ✅ No .env file in frontend/

**Share the ngrok URL and start playing!** 🎉
