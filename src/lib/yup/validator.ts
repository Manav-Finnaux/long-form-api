import type {
  Context,
  Env,
  Input,
  MiddlewareHandler,
  TypedResponse,
  ValidationTargets,
} from 'hono'
import { validator } from 'hono/validator'
import * as yup from 'yup'

const parseErrorSchema = (
  error: yup.ValidationError,
  // validateAllFieldCriteria: boolean,
) => {
  return (error.inner || []).reduce<Record<string, any>>((previous, error) => {
    if (!previous[error.path!]) {
      previous[error.path!] = { message: error.message, type: error.type! }
    }

    // if (validateAllFieldCriteria) {
    //   const types = previous[error.path!].types;
    //   const messages = types && types[error.type!];

    //   previous[error.path!] = appendErrors(
    //     error.path!,
    //     validateAllFieldCriteria,
    //     previous,
    //     error.type!,
    //     messages
    //       ? ([] as string[]).concat(messages as string[], error.message)
    //       : error.message,
    //   ) as FieldError;
    // }

    return previous
  }, {})
}

type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: yup.ValidationError }

const safeParseAsync = async <T>(
  schema: yup.Schema<T>,
  value: unknown,
): Promise<SafeParseResult<T>> => {
  try {
    const data = (await schema.validate(value, {
      abortEarly: false,
      stripUnknown: true,
    })) as T

    return { success: true, data }
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { success: false, error }
    }

    throw new Error('Unexpected error during validation')
  }
}

export type Hook<
  T,
  E extends Env,
  P extends string,
  Target extends keyof ValidationTargets = keyof ValidationTargets,
  O = unknown,
> = (
  result: (
    | { success: true; data: T }
    | { success: false; error: yup.ValidationError; data: T }
  ) & {
    target: Target
  },
  c: Context<E, P>,
) =>
    | Response
    | void
    | TypedResponse<O>
    | Promise<Response | void | TypedResponse<O>>

type HasUndefined<T> = undefined extends T ? true : false

export const yupValidator = <
  T extends yup.Schema<unknown>,
  Target extends keyof ValidationTargets,
  E extends Env,
  P extends string,
  In = yup.InferType<T>,
  Out = yup.Asserts<T>,
  I extends Input = {
    in: HasUndefined<In> extends true
    ? {
      [K in Target]?: In extends ValidationTargets[K]
      ? In
      : { [K2 in keyof In]?: ValidationTargets[K][K2] }
    }
    : {
      [K in Target]: In extends ValidationTargets[K]
      ? In
      : { [K2 in keyof In]: ValidationTargets[K][K2] }
    }
    out: { [K in Target]: Out }
  },
  V extends I = I,
>(
  target: Target,
  schema: T,
  hook?: Hook<yup.Schema<T>, E, P, Target>,
): MiddlewareHandler<E, P, V> =>
  // @ts-expect-error not typed well
  validator(target, async (value, c) => {
    const result = await safeParseAsync(schema, value)
    if (!result.success) {
      if (hook) {
        const hookResult = await hook(
          {
            data: value,
            success: result.success,
            error: result.error,
            target,
          },
          c,
        )

        if (hookResult) {
          if (hookResult instanceof Response) {
            return hookResult
          }

          if ('response' in hookResult) {
            return hookResult.response
          }
        }
      }

      return c.json(
        {
          data: null,
          message: result.error.errors,
        },
        400,
      )
    }

    return result.data
  })
