cmake_minimum_required(VERSION 3.16)

set(CMAKE_LIBRARY_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/../../../.bin")
set(CMAKE_BUILD_TYPE Release)
set(WEBVIEW_ENABLE_CLANG_TIDY false)
set(WEBVIEW_ENABLE_CLANG_FORMAT false)
set(WEBVIEW_WEBKITGTK_API 6.0)
set(webview_gitHash 83a4b4a)
set(webview_url https://github.com/webview/webview)

project(libWebview LANGUAGES C CXX)

include(FetchContent)
FetchContent_Declare(
    webview
    GIT_REPOSITORY ${webview_url}
    GIT_TAG ${webview_gitHash})
FetchContent_MakeAvailable(webview)







