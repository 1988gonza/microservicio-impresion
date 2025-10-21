// contratanteNavegacion.js
import BaseModel from './BaseModelPg.js';

export default class ContratanteNavegacion extends BaseModel {
  constructor() {
    super({
      tableName: 'contratante_navegacion',
      primaryKey: 'id'
    });
  }

  // Aquí podés agregar métodos específicos luego
}
