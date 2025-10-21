// contratanteCotizaciones.js
import BaseModel from "mi-libreria-compartida/models/base/BaseModelPg.js";

export class ContratanteCotizaciones extends BaseModel {
  constructor() {
    super({
      tableName: "contratante_cotizaciones",
      primaryKey: "id",
    });
  }

  // Aquí podés agregar métodos específicos luego
}
