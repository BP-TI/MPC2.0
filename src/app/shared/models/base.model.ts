export abstract class BaseModel {
 [key: string]: any;

  constructor() {
  }

  public setAll(_params: any) {
    for (const param in _params) {
      if (_params.hasOwnProperty(param)) {
        this[param] = _params[param];
      }
    }
  }
}
