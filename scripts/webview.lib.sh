#! /bin/bash

cd "$(dirname "$0")"/.. || exit

## make the c++ swig wrapper for webview (javascript node)
outfile=make/node/node.swigWrapper.cc
if [ ! -f $outfile ]; then
    swig -copyright
    swig -c++ -javascript -node -o $outfile -l webview/webview.i
    printf "\nMade: %s$outfile\n"
fi

## make the amalgamated headers for webview
if [ ! -f "make/node/include/webview.h" ]; then
    python3 webview/scripts/amalgamate.py --output make/node/include/webview.h webview/core/include/webview/webview.h
fi

#webview_gitHash=83a4b4a
#webview_i=https://raw.githubusercontent.com/webview/webview/$webview_gitHash/webview.i

## Get the webview swig header if not there
#if [ ! -f "libs/webview.i" ]; then
#    cd make/node || exit
#    wget $webview_i
#    cd ../../
#fi

#git clone --filter=blob:none --no-checkout --single-branch --depth 1 https://github.com/webview/webview.git
#cd webview || exit
#git checkout $webview_gitHash

## make the amalgamated headers for webview
#if [ ! -f "libs/webview.h" ]; then
#    python3 libs/webview/scripts/amalgamate.py --output libs/webview.h libs/webview/core/include/webview/webview.h
#fi

## make the c++ wrapper for webview (javascript jsc)

#swig -c++ -javascript -jsc -o $outfile ./libs/webview/webview.i
#printf "\nMade: %s$outfile\n"
## make the c++ wrapper for webview (javascript v8)
#swig -c++ -javascript -v8 -o ./cmake/deno/deno.swigWrapper.cc -l ./libs/webview/webview.i

# cp ./libs/webview.h ../packages/node/cmake/webview.h
