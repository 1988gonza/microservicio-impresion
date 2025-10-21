// contratanteIbPercepciones.js
import BaseModel from "mi-libreria-compartida/models/base/BaseModelPg.js";

export class ContratanteIbPercepciones extends BaseModel {
  constructor() {
    super({
      tableName: "contratante_ib_percepciones",
      primaryKey: "id",
    });
  }

  // Aquí podés agregar métodos específicos luego
}
