import type { FieldErrors, FieldValues, ResolverOptions, ResolverResult } from "react-hook-form";
import { z } from "zod";

function toFieldErrors(issues: z.ZodIssue[]): FieldErrors {
  const flat: Record<string, { message: string; type: string }> = {};

  for (const issue of issues) {
    const path = issue.path.join(".");
    if (!flat[path]) {
      flat[path] = { message: issue.message, type: issue.code };
    }
  }

  const result: Record<string, unknown> = {};
  for (const [path, error] of Object.entries(flat)) {
    const parts = path.split(".");
    let node = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]] || typeof node[parts[i]] !== "object") {
        node[parts[i]] = {};
      }
      node = node[parts[i]] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = error;
  }

  return result as FieldErrors;
}

export function zodResolver<T extends z.ZodTypeAny>(
  schema: T,
  schemaOptions?: Parameters<T["parseAsync"]>[1],
  resolverOptions: { raw?: boolean } = {}
) {
  return async <TFieldValues extends FieldValues>(
    values: TFieldValues,
    _context: unknown,
    _options: ResolverOptions<TFieldValues>
  ): Promise<ResolverResult<TFieldValues>> => {
    const result = await schema.safeParseAsync(values, schemaOptions);

    if (result.success) {
      return {
        errors: {},
        values: (resolverOptions.raw ? { ...values } : result.data) as TFieldValues,
      };
    }

    return {
      values: {} as never,
      errors: toFieldErrors(result.error.issues) as FieldErrors<TFieldValues>,
    };
  };
}
