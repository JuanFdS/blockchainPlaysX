const {getRunInstanceClient} =  require("./main.js");
const {PlayerClient} =  require("./playerClient.js");

pc = new PlayerClient(getRunInstanceClient());