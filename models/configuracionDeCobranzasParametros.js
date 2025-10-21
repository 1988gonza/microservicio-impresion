// configuracionDeCobranzasParametros.js
import BaseModel from './BaseModelPg.js';

export default class ConfiguracionDeCobranzasParametros extends BaseModel {
  constructor() {
    super({
      tableName: 'configuracion_de_cobranzas_parametros',
      primaryKey: 'id'
    });
  }

  // Aquí podés agregar métodos específicos luego
}
