// import Run from "run-sdk";

const Run = require("run-sdk");

function getRunInstanceServer() {
    const run = new Run({
        network: 'test',
        owner: "cQZf1yoM4SiGaAQHZUTk61bJBqCkraA1eLVcJXUxEwWq71oQya6R",
        purse: "cTiNSSXNiLnMC1G5py8dcfQHeeikU62RsLtFoC7f9L6MMDYe1kp5",
        networkTimeout: 1000000,
    });
    run.trust("*");
    return run;
}

module.exports = {
    getRunInstanceServer
}