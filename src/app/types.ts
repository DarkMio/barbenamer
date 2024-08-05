import type names from "#assets/names.json";

export type PhoneticName = keyof typeof names;
export type WrittenName = string & { __writtenNameBrand: never };
