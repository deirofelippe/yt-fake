import { XMLParser } from '../../domain/libs/XMLParser';
import xml2js from 'xml2js';

export class Xml2jsParser implements XMLParser {
  public async parseJS(xml: string): Promise<object> {
    return await xml2js.parseStringPromise(xml);
  }
}
