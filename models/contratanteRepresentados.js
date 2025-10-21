// contratanteRepresentados.js
import BaseModel from "mi-libreria-compartida/models/base/BaseModelPg.js";

export class ContratanteRepresentados extends BaseModel {
  constructor() {
    super({
      tableName: "contratante_representados",
      primaryKey: "id",
    });
  }

  // Aquí podés agregar métodos específicos luego
}
