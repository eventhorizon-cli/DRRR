/**
 * 防范多次导入CoreModule，并通过添加守卫逻辑来尽快失败
 * @param parentModule
 * @param moduleName
 */
export function throwIfAlreadyLoaded(parentModule: any, moduleName: string) {
  if (parentModule) {
    throw new Error(`${moduleName} has already been loaded. Import Core modules in the AppModule only.`);
  }
}
