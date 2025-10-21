// utils/autoRoutes.js
import { controllerWrapper } from "./controllerWrapper.js";

export function mountRoutes(app, controllers) {
  Object.entries(controllers).forEach(([ctrlName, controller]) => {
    const proto = Object.getPrototypeOf(controller);
    const customRoutes = controller.constructor.routes || {};

    Object.entries(customRoutes).forEach(([routeMethodName, routeDef]) => {
      let path, verbs, builderName;

      // Extraemos info del static route
      if (typeof routeDef === "string") {
        path = routeDef;
        verbs = ["get"];
      } else if (typeof routeDef === "object") {
        path = routeDef.path;
        verbs = Array.isArray(routeDef.verb)
          ? routeDef.verb.map((v) => v.toLowerCase())
          : [routeDef.verb?.toLowerCase() || "get"];
        builderName = routeDef.builder; // NUEVO: builder opcional
      }

      verbs.forEach((verb) => {
        let handler;

        if (builderName && typeof controller.handleProcesar === "function") {
          // Si definimos un builder, usamos el handler genérico

          handler = controller.handleProcesar(builderName);
        } else if (typeof controller[routeMethodName] === "function") {
          // Si existe un método explícito, usamos ese
          handler = controller[routeMethodName].bind(controller);
        } else {
          console.warn(
            `[mountRoutes] No se encontró handler para ${ctrlName}.${routeMethodName}`
          );
          return;
        }

        app[verb](path, controllerWrapper(handler));
        console.log(
          `RUTA: [${verb.toUpperCase()}] ${path} -> ${ctrlName}.${routeMethodName}`
        );
      });
    });
  });
}
