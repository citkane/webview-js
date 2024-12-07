#! /bin/bash

cd "$(dirname "$0")" || exit
mkdir -p cmake/libs
cd cmake/libs

## Get the node-api headers if not there
if [ ! -d "node-api" ]; then
    mkdir node-api
    git clone --filter=blob:none --no-checkout -b main --single-branch --depth 1 --sparse https://github.com/nodejs/node-api-headers.git
    cd node-api-headers
    git sparse-checkout add include
    git checkout
    cp -r include/* ../node-api
    cd ../
    rm -rf node-api-headers
fi

## Get the v8 engine headers if not there
if [ ! -d "v8" ]; then
    mkdir v8
    git clone --filter=blob:none --no-checkout -b v20.x --single-branch --depth 1 --sparse https://github.com/nodejs/node.git
    cd node
    git sparse-checkout add deps/v8/include
    git checkout
    cp -r deps/v8/include/* ../v8
    cd ../
    rm -rf node
fi

## Get the JavaScriptCore engine headers if not there
if [ ! -d "JavaScriptCore" ]; then
    mkdir JavaScriptCore
    git clone --filter=blob:none --no-checkout -b autobuild-8bbd4ed494f66395f9ae42aed1beb57e998265ca --single-branch --depth 1 --sparse https://github.com/oven-sh/WebKit.git
    cd WebKit
    git sparse-checkout add Source/JavaScriptCore/API
    git checkout
    #cp -r Source/JavaScriptCore/API/*/**/*.h ../JavaScriptCore
    cd Source/JavaScriptCore/API
    find . -name "*.h" -exec cp --parents {} ../../../../JavaScriptCore \;
    cd ../../../../
    rm -rf WebKit
fi

## Get the webview libraries if not there
if [ -d "webview" ]; then
    cd webview || exit
else
    git clone -b 0.12.0 --single-branch https://github.com/webview/webview.git
    cd webview || exit
fi

# make the amalgamated headers for webview
#if [ ! -f "../webview.h" ]; then
#    python3 scripts/amalgamate.py --output ../webview.h core/include/webview/webview.h
#fi

## make the c++ wrapper for webview (javascript node)
swig -c++ -javascript -node -outdir ../ -o ../node.webviewWrapper.cc webview.i

## make the c++ wrapper for webview (javascript v8)
#swig -c++ -javascript -jsc -outdir ../ -o ../webview-js-jsc.cc webview.i
cd ../../

export TARGET_KIND=node
export TARGET_NAME=libwebview

echo $(node -v)
npx cmake-js build -G Ninja -S ./cmake --CDTARGET_NAME="$TARGET_NAME" --CDTARGET_KIND="$TARGET_KIND"

TARGET_DIR=../../bin
TARGET_FILE="$TARGET_DIR/$TARGET_KIND.$TARGET_NAME-$(arch).node"
SOURCE_FILE="build/lib/${TARGET_NAME}.${TARGET_KIND}"

#npm config set cmake_CMAKE_BUILD_TYPE Release
#npm config set cmake_TARGET_NAME Release $TARGET_NAME
#npm config set cmake_TARGET_KIND Release $TARGET_KIND
#npx cmake-js -G Ninja -B build -S . -Wno-dev
#
#cmake --build build

cp "$SOURCE_FILE" "$TARGET_FILE"
rm -rf build

#-D WEBVIEW_BUILD_DOCS=false -D WEBVIEW_BUILD_EXAMPLES=false -D WEBVIEW_BUILD_TESTS=false \
#-D WEBVIEW_BUILD_STATIC_LIBRARY=false -D WEBVIEW_BUILD_AMALGAMATION=false \
#-D WEBVIEW_ENABLE_CLANG_TIDY=false -D WEBVIEW_ENABLE_CLANG_FORMAT=false \
#-D WEBVIEW_WEBKITGTK_API=4.1

#cmake --build build
