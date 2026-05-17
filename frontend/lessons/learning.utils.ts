export type AppPartialMapping<T> = {
  [K in keyof T]?: T[K];
};

export type ReplaceDateFields<T, TDateReplacement> = {
  [K in keyof T]: T[K] extends Date ? TDateReplacement : T[K];
};

export type RemoveSensitiveFields<T> = {
  [K in keyof T as K extends `${string}password${string}`
    ? never
    : K extends `${string}secret${string}`
      ? never
      : K extends `${string}token${string}`
        ? never
        : K extends `${string}refresh${string}`
          ? never
          : K]: T[K];
};
