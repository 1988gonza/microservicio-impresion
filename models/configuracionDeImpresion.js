// configuracionDeImpresion.js
import BaseModel from "mi-libreria-compartida/models/base/BaseModelPg.js";

export class ConfiguracionDeImpresion extends BaseModel {
  constructor() {
    super({
      tableName: "configuracion_de_impresion",
      primaryKey: "id",
    });
  }

  // Aquí podés agregar métodos específicos luego

  async obtenerConfiguracion({ contratante_id }) {
    const sql = `
      SELECT
          c.id AS configuracion_id,
          c.tipo,
          p.clave,
          p.valor
      FROM configuracion_de_impresion c
      LEFT JOIN configuracion_de_impresion_parametros p
          ON p.configuracion_id = c.id
      WHERE c.contratante_id = $1
      ORDER BY c.id;
    `;

    const rows = await this.raw(sql, [contratante_id]);

    // Reorganizar en cache por tipo
    const result = {};
    for (const row of rows) {
      if (!result[row.tipo]) {
        result[row.tipo] = {};
      }
      result[row.tipo][row.clave] = row.valor;
    }

    return result;
  }
}
