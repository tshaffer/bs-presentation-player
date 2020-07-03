export default class Registry {

  read(sectionName?: string, key?: string): Promise <string | object> {
    return Promise.resolve({});
  }
  write(sectionName?: string, key?: string, value?: string): Promise <void> {
    return Promise.resolve();
  }
}