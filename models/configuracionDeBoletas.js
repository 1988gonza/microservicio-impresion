// configuracionDeBoletas.js
import BaseModel from './BaseModelPg.js';

export default class ConfiguracionDeBoletas extends BaseModel {
  constructor() {
    super({
      tableName: 'configuracion_de_boletas',
      primaryKey: 'id'
    });
  }

  // Aquí podés agregar métodos específicos luego
}
