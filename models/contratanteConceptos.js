// contratanteConceptos.js
import BaseModel from "@1988gonza/mi-libreria-compartida/models/base/BaseModelPg.js";

export class ContratanteConceptos extends BaseModel {
  constructor() {
    super({
      tableName: "contratante_conceptos",
      primaryKey: "id",
    });
  }

  // Aquí podés agregar métodos específicos luego
}
