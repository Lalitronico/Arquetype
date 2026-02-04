import { z } from "zod";

export type ValidationResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string; details?: z.ZodIssue[] };

/**
 * Validate request body against a Zod schema.
 * Returns { success, data, error } — never throws.
 */
export function validateBody<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: formatZodErrors(result.error),
    details: result.error.issues,
  };
}

/**
 * Validate URL search params against a Zod schema.
 * Converts URLSearchParams to a plain object first.
 */
export function validateSearchParams<T extends z.ZodTypeAny>(
  schema: T,
  params: URLSearchParams
): ValidationResult<z.infer<T>> {
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return validateBody(schema, obj);
}

/**
 * Format Zod errors into a human-readable string.
 */
function formatZodErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    })
    .join("; ");
}
