// comprobantesImpresos.js
import BaseModel from "mi-libreria-compartida/models/base/BaseModelPg.js";

export class ComprobantesImpresos extends BaseModel {
  constructor() {
    super({
      tableName: "comprobantes_impresos",
      primaryKey: "hash",
    });
  }

  // Aquí podés agregar métodos específicos luego

  async updateStateByHash({ nombre_archivo, ruta_archivo, hash } = {}) {
    return await this.update(
      { nombre_archivo, ruta_archivo, estado: "IMPRESO" },
      { hash }
    );
  }
}
