/**
 * Validacao de dados orientados por conteudo.
 * Sem dependencias externas nesta fase.
 */

export interface ValidationIssue {
  readonly path: string;
  readonly message: string;
}

export class ValidationResult {
  private readonly issues: ValidationIssue[] = [];

  add(path: string, message: string): void {
    this.issues.push({ path, message });
  }

  get valid(): boolean {
    return this.issues.length === 0;
  }

  get all(): readonly ValidationIssue[] {
    return this.issues;
  }

  throwIfInvalid(): void {
    if (this.issues.length === 0) return;
    const summary = this.issues.map((i) => `  - ${i.path}: ${i.message}`).join('\n');
    throw new Error(`Falha de validacao de conteudo:\n${summary}`);
  }
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isPositiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function isNonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

export function isUnitInterval(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}