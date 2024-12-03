import { $ } from "bun";

await $`
    mkdir ./build
    cp -R ./bin ./build
    cp -R ./docs ./build
    cp ./package.json ./build
    cp ./LICENSE ./build
    cp ./README.md ./build
`;
