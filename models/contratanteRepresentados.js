// contratanteRepresentados.js
import BaseModel from "@1988gonza/mi-libreria-compartida/models/base/BaseModelPg.js";

export class ContratanteRepresentados extends BaseModel {
  constructor() {
    super({
      tableName: "contratante_representados",
      primaryKey: "id",
    });
  }

  // Aquí podés agregar métodos específicos luego
}
