# pylint: disable=missing-module-docstring
# pylint: disable=pointless-statement
{
    'targets': [
        {
            'target_name': 'webview',
            'sources': ['src/napi.webview.cc'],
            'include_dirs': [
                "<!@(node -p \"require('node-addon-api').include\")",
                " <!(pkg-config --cflags gtk4 webkitgtk-6.0)",
                "include"
            ],
            'dependencies': ["<!(node -p \"require('node-addon-api').gyp\")"],
            "libraries": [" <!(pkg-config --libs gtk4 webkitgtk-6.0)", "-ldl"],
            "cflags": ["-O2", "-std=c++11"],
            'cflags!': ['-fno-exceptions'],
            'cflags_cc!': ['-fno-exceptions'],
            'xcode_settings': {
                'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                'CLANG_CXX_LIBRARY': 'libc++',
                'MACOSX_DEPLOYMENT_TARGET': '10.7'
            },
            'msvs_settings': {
                'VCCLCompilerTool': {'ExceptionHandling': 1},
            }
        }
    ]
}
