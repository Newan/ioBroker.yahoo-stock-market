![Logo](admin/yahoo-stock-market.png)

# ioBroker.yahoo-stock-market (Community Fork)

⚠️ **This is a community fork with bugfixes.**

The original project has not been updated since 2024. This fork addresses the following issues:
- Fixes the error: `SyntaxError: Unexpected token 'T', "Too Many Requests"`
- Migrates to the new Yahoo Finance API v2/v3

## Installation

### Method 1: Via ioBroker Admin Interface (Custom URL)

1. Open ioBroker Admin
2. Go to **"Adapters"**
3. Click on the **GitHub icon**
4. "Install from custom URL"
5. Enter:
```
   https://github.com/4eversr/ioBroker.yahoo-stock-market
```


### Method 2: Via Command Line (SSH/Terminal)

Connect to your ioBroker server via SSH and execute:
```bash
cd /opt/iobroker
npm install 4eversr/ioBroker.yahoo-stock-market
iobroker upload yahoo-stock-market
```

### Method 3: Via ioBroker CLI
```bash
iob install 4eversr/ioBroker.yahoo-stock-market
```

---

**Note:** This is a community fork with bugfixes. The original project has not been maintained since 2 years.

## yahoo-stock-market adapter for ioBroker

Check the current stock value

## Changelog
<!--
    Placeholder for the next version (at the beginning of the line):
    ### **WORK IN PROGRESS**
-->
### 0.0.8 (2026-01-07)
* (4eversr) change to yahoo api2-v3; fix SyntaxError: Unexpected token 'T', "Too Many Requests"

### 0.0.7 (2024-06-10)
* fox #14, update yahoo-api

### 0.0.6 (2024-04-24)
* fix #9, update yahoo-api

### 0.0.5 (2023-08-07)
* fix for Cookiebug #6

### 0.0.4 (2022-10-14)
* update for latest-repository

### 0.0.3 (2022-09-12)
* (Newan) rename adapter for npm

### 0.0.2 (2022-09-12)
* (Newan) change to yahoo api

### 0.0.1 (2022-09-12)
* (Newan) initial release

## License
MIT License

Copyright (c) 2024 Newan <info@newan.de>

Fork with API Fix by 4eversr 01/2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
