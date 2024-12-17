# pylint: disable=missing-module-docstring
# pylint: disable=pointless-statement
{
    "targets": [
        {
            "target_name": "webview",
            "cflags": ["-O2", "-std=c++11"],
            "cflags_cc": ["-fexceptions", "-fpermissive"],
            "sources": [
                "src/node.swigWrapper.cc"
            ],
            "include_dirs": [
                " <!(pkg-config --cflags gtk4 webkitgtk-6.0)",
                "include"
            ],
            "libraries": ["<!(pkg-config --libs gtk4 webkitgtk-6.0)", "-ldl"],
            # "actions": [
            #    {
            #        "action_name": "fetch_webview",
            #        "inputs": ["./cmake/node/fetchWebview.py"],
            #        "outputs": ["webview_src"],
            #        "action": ["python3", "./cmake/node/fetchWebview.py"]
            #    }
            # ]
        }
    ]
}
