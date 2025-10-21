// conceptos.js
import BaseModel from './BaseModelPg.js';

export default class Conceptos extends BaseModel {
  constructor() {
    super({
      tableName: 'conceptos',
      primaryKey: 'id'
    });
  }

  // Aquí podés agregar métodos específicos luego
}
