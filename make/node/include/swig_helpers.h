#ifndef SWIG_HELPERS_H
#define SWIG_HELPERS_H

#include "webview.h"
#include <stdint.h>

// Function to convert a pointer to a BigInt representation
static inline uint64_t swig_value(void *pointer) { return (uint64_t)pointer; }

// Function to convert a BigInt representation back to a pointer
static inline void *swig_create(uint64_t number) { return (void *)number; }

// Function to wrap a jsCallback
/*
static inline void *swig_jsCallback(void (*callback)(webview_t, void *)) {
  return (void *)callback;
}
*/

#endif // SWIG_HELPERS_H