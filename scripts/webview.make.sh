#! /bin/bash

cd "$(dirname "$0")"/.. || exit

swig_target=make/node/src/napi.webview.cc
webview_interface_copy=make/node/src/webview.i
webview_interface_src=webview/webview.i
webview_interface_expanded=make/node/src/webview_js.i
amalgamate_py=webview/scripts/amalgamate.py
webview_h_target=make/node/include/webview.h
webview_h_src=webview/core/include/webview/webview.h
bin_dir=.bin
rebuild=false

clean() {
    if [ -f $webview_interface_copy ]; then
        rm $webview_interface_copy
    fi
    if [ -f $swig_target ]; then
        rm $swig_target
    fi
    if [ -f $webview_h_target ]; then
        rm $webview_h_target
    fi
    if [ -d $bin_dir ]; then
        rm -rf $bin_dir
    fi
}
if [ "$1" = "clean" ]; then
    clean
    exit
fi

## copy webview.i to the make directory
if [ ! -f $webview_interface_copy ]; then
    cp $webview_interface_src $webview_interface_copy
    printf "\n\x1b[92mCopied: %s$webview_interface_src to $webview_interface_copy\x1b[0m\n"
    rebuild=true
else
    printf "Already exists: %s$webview_interface_copy\n"
fi

## make the c++ swig wrapper for webview (javascript napi)
if [ ! -f $swig_target ]; then
    printf "\n\x1b[36mCreating the Swig c++ wrapper at: %s$swig_target\x1b[0m\n"
    swig -copyright
    swig -c++ -javascript -napi -o $swig_target -l $webview_interface_expanded
    printf "\n\x1b[92mCreated: %s$swig_target\x1b[0m\\n"
    rebuild=true
else
    printf "Already exists: %s$swig_target\n"
fi

## make the amalgamated headers for webview
if [ ! -f $webview_h_target ]; then
    printf "\n\x1b[36mAmalgamating $webview_h_src to: %s$webview_h_target\x1b[0m\nMay take a while...\n"
    python3 $amalgamate_py --output $webview_h_target $webview_h_src >/dev/null
    printf "\x1b[92mAmalgamated $webview_h_src to: %s$webview_h_target\x1b[0m\\n"
    rebuild=true
else
    printf "Already exists: %s$webview_h_target\n"
fi

if [ "$rebuild" = true ]; then
    printf "\n\x1b[36mRebuilding the dist...\x1b[0m\\n"
    bun run build.dist >/dev/null
fi

printf "\n\x1b[92mDone!\x1b[0m\\n"

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

#swig -c++ -javascript -jsc -o $swig_target ./libs/webview/webview.i
#printf "\nMade: %s$swig_target\n"
## make the c++ wrapper for webview (javascript v8)
#swig -c++ -javascript -v8 -o ./cmake/deno/deno.swigWrapper.cc -l ./libs/webview/webview.i

# cp ./libs/webview.h ../packages/node/cmake/webview.h
