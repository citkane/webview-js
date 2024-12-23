%module(directors="1") webview_js

%{
#include "swig_helpers.h"

int swig_jsCallback(int a, int b, int (*op)(int, int)) {
    return op(a, b);
}
%}

%feature("director") swigJsCallback;

%inline %{
struct swigJsCallback {
  virtual int handle(int a, int b) = 0;
  virtual ~swigJsCallback() {}
};
%}

%{
static swigJsCallback *handler_ptr = NULL;
static int handler_helper(int a, int b) {
  // Make the call up to the target language when handler_ptr
  // is an instance of a target language director class
  return handler_ptr->handle(a, b);
}
// If desired, handler_ptr above could be changed to a thread-local variable in order to make thread-safe
%}

%inline %{
int swig_jsCallback(int a, int b, swigJsCallback *handler) {
  handler_ptr = handler;
  int result = swig_jsCallback(a, b, &handler_helper);
  handler = NULL;
  return result;
}
%}


%include "stdint.i" // Ensure uint64_t is recognized in SWIG
%include "webview.i" // The full webview interface

%include "../include/swig_helpers.h"

/*
extern uint64_t swig_value(webview_t w);
extern webview_t swig_create(uint64_t bigint);
extern void *swig_jsCallback(void (*fn)(webview_t w, void *arg));

*/