// contratanteNavegacionCampos.js
import BaseModel from './BaseModelPg.js';

export default class ContratanteNavegacionCampos extends BaseModel {
  constructor() {
    super({
      tableName: 'contratante_navegacion_campos',
      primaryKey: 'id'
    });
  }

  // Aquí podés agregar métodos específicos luego
}
