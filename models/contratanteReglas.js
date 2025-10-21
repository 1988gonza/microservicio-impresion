// contratanteReglas.js
import BaseModel from './BaseModelPg.js';

export default class ContratanteReglas extends BaseModel {
  constructor() {
    super({
      tableName: 'contratante_reglas',
      primaryKey: 'id'
    });
  }

  // Aquí podés agregar métodos específicos luego
}
