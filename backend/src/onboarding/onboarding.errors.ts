export class ProfileNotFoundError extends Error {
  constructor(public readonly userId: string) {
    super(`Profile not found for user ${userId}`);
  }
}

export class UnsafePlanError extends Error {
  constructor(
    message: string,
    public readonly minimumSafeDays?: number,
  ) {
    super(message);
  }
}

export class HealthDisclaimerRequiredError extends Error {
  constructor() {
    super('Health disclaimer must be acknowledged before activating a plan.');
  }
}
