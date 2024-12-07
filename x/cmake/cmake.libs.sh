#! /bin/bash

cd "$(dirname "$0")" || exit
mkdir libs
cd libs

## Get the webview libraries if not there
if [ ! -d "webview" ]; then
    git clone -b 0.12.0 --single-branch https://github.com/webview/webview.git
fi
