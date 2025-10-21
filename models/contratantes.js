// contratantes.js
import BaseModel from "mi-libreria-compartida/models/base/BaseModelPg.js";

export class Contratantes extends BaseModel {
  constructor() {
    super({
      tableName: "contratantes",
      primaryKey: "id",
    });
  }

  // Aquí podés agregar métodos específicos luego
}
