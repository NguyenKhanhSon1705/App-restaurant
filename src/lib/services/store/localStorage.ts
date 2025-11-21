// import createWebStorage from "redux-persist/lib/storage/createWebStorage";

// interface NoopStorageReturnType {
//   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
//   getItem: (_key: any) => Promise<null>;
//   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
//   setItem: (_key: any, value: any) => Promise<any>;
//   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
//   removeItem: (_key: any) => Promise<void>;
// }

// const createNoopStorage = (): NoopStorageReturnType => {

//   return {
//     // biome-ignore lint/suspicious/noExplicitAny: <explanation>
//     getItem(_key: any): Promise<null> {
//       return Promise.resolve(null);
//     },
//     // biome-ignore lint/suspicious/noExplicitAny: <explanation>
//     setItem(_key: any, value: any): Promise<any> {
//       return Promise.resolve(value);
//     },
//     // biome-ignore lint/suspicious/noExplicitAny: <explanation>
//     removeItem(_key: any): Promise<void> {
//       return Promise.resolve();
//     },
//   };
// };

// const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

// export default storage;
