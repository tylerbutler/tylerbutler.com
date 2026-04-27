/// <reference types="astro/client" />

declare module "*.astro" {
  const Component: (...args: any[]) => any;
  export default Component;
}
