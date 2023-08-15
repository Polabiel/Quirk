import { general } from "../configuration/general";

module.exports = {
  name: "comando",
  description: "Descrição do comando",
  commands: ["comando1", "comando2"],
  usage: `${general.PREFIX}comando`,
  handle: async ({}) => {
    // código do comando
  },
};
