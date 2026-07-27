export class ActivePlanRequiredError extends Error {
  constructor() {
    super(
      'An active plan is required to analyze weight trends or apply adjustments.',
    );
  }
}

export class InsufficientDataForAdjustmentError extends Error {
  constructor() {
    super(
      'Log weight at least twice, a few days apart, before applying an adjustment.',
    );
  }
}

export class AdjustmentRateMismatchError extends Error {
  constructor(rate: string) {
    super(
      `The requested rate (${rate}) does not match the current adjustment suggestion.`,
    );
  }
}
