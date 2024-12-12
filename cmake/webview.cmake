set(CMAKE_LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/../../.bin")
set(CMAKE_BUILD_TYPE Release)

set(webview_gitHash 83a4b4a)
set(WEBVIEW_ENABLE_CLANG_TIDY false)
set(WEBVIEW_ENABLE_CLANG_FORMAT false)
set(WEBVIEW_WEBKITGTK_API 6.0)

include(FetchContent)
FetchContent_Declare(
    webview
    GIT_REPOSITORY https://github.com/webview/webview
    GIT_TAG ${webview_gitHash})
FetchContent_MakeAvailable(webview)