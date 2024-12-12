export const cmakeStrings = {
    node: `npx cmake-js compile -G Ninja -d ./cmake/node --CDCMAKE_BUILD_TYPE="Release"`,
    bun: bunAndDeno("bun"),
    deno: bunAndDeno("deno")
}

function bunAndDeno(platform){
return `
        mkdir -p bin
        cmake -G Ninja -B build -S ./cmake/${platform}
        cmake --build build
        
`
}