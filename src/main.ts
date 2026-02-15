import openAPI from "../data/openapi.json"
import { parseOpenAPISchema } from "./lib/parser"

function setView(text: string) {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = text;
}

setView(`<pre>${JSON.stringify(parseOpenAPISchema(openAPI), null, 2)}</pre>`);
