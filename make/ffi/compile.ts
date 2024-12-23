export const compileString = `
    cmake -G Ninja -S make/ffi -B make/build
    cmake --build make/build
`;
