#! /bin/bash

cd "$(dirname "$0")"/.. || exit
mkdir -p libs
cd libs

## Get the webview libraries if not there
if [ ! -d "webview" ]; then
    git clone --filter=blob:none --no-checkout --single-branch --depth 1 https://github.com/webview/webview.git
    cd webview || exit
    git checkout 83a4b4a
    cd ../
fi
cd ../

## make the c++ wrapper for webview (javascript node)
swig -c++ -javascript -node -outdir ./cmake/node -o ./cmake/node/node.webviewWrapper.cc ./libs/webview/webview.i

## make the amalgamated headers for webview
if [ ! -f "libs/webview.h" ]; then
    python3 libs/webview/scripts/amalgamate.py --output libs/webview.h libs/webview/core/include/webview/webview.h
fi

# cp ./libs/webview.h ../packages/node/cmake/webview.h
