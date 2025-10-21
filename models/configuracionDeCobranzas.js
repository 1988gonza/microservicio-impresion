// configuracionDeCobranzas.js
import BaseModel from './BaseModelPg.js';

export default class ConfiguracionDeCobranzas extends BaseModel {
  constructor() {
    super({
      tableName: 'configuracion_de_cobranzas',
      primaryKey: 'id'
    });
  }

  // Aquí podés agregar métodos específicos luego
}
