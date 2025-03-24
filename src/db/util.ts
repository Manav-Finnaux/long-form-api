import { toSnakeCase } from "drizzle-orm/casing"
import { pgEnum } from "drizzle-orm/pg-core"

type EnumConfig<T extends string> = {
    name: string
    values: readonly T[]
}


export function createEnum<T extends string>({ name, values }: EnumConfig<T>) {
    const enumObject = Object.freeze(
        values.reduce((acc, value) => ({ ...acc, [value]: value }), {})
    ) as { [K in T]: K }


    const pgEnumObject = pgEnum(toSnakeCase(name), values as [T, ...T[]])

    return {
        enum: enumObject,
        values,
        pgEnum: pgEnumObject
    }
}