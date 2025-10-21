import { SignJWT, jwtVerify } from "jose";
import { readFile } from "fs/promises";
import { importPKCS8, importSPKI } from "jose";

export class TokenService {
  constructor(privateKeyPem, publicKeyPem) {
    this.privateKeyPem = privateKeyPem;
    this.publicKeyPem = publicKeyPem;
    this.privateKey = null;
    this.publicKey = null;
  }

  async initKeys() {
    this.privateKey = await importPKCS8(
      await readFile(this.privateKeyPem, "utf-8"),
      "RS256"
    );
    this.publicKey = await importSPKI(
      await readFile(this.publicKeyPem, "utf-8"),
      "RS256"
    );
  }

  async generarToken(uuid) {
    return await new SignJWT({ id: uuid })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuer("microservicio-impresion")
      .setExpirationTime("10m")
      .sign(this.privateKey);
  }

  async verificarToken(token) {
    const { payload } = await jwtVerify(token, this.publicKey, {
      issuer: "microservicio-impresion",
    });
    return payload.id;
  }
}
