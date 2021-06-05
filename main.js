import Run from "run-sdk";

export function getRunInstance(owner) {
    const run = new Run({network: 'mock', owner});
    run.trust("*");
    return run;
}

export function newRandomOwner() {
    return new Run({network: 'mock'}).owner;
}