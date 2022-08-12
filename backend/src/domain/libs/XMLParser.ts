export interface XMLParser {
  parseJS(xml: string): Promise<object>;
}
