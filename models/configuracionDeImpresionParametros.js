// configuracionDeImpresionParametros.js
import BaseModel from './BaseModelPg.js';

export default class ConfiguracionDeImpresionParametros extends BaseModel {
  constructor() {
    super({
      tableName: 'configuracion_de_impresion_parametros',
      primaryKey: 'id'
    });
  }

  // Aquí podés agregar métodos específicos luego
}
