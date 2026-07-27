export class ActivePlanRequiredError extends Error {
  constructor() {
    super(
      'An active plan is required to analyze weight trends or apply adjustments.',
    );
  }
}
