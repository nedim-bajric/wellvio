import '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import type { PlanOption } from './../src/onboarding/onboarding.types';

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

describe('OnboardingController (e2e)', () => {
  let app: INestApplication<App>;
  const userId = 'e2e-user';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('supports the full onboarding and activation flow', async () => {
    const profileResponse = await request(app.getHttpServer())
      .post('/onboarding/profile')
      .set('x-user-id', userId)
      .send({
        gender: 'male',
        age: 30,
        heightCm: 180,
        currentWeightKg: 100,
        goalWeightKg: 90,
        activityLevel: 'sedentary',
        targetDate: daysFromNow(180),
        healthDisclaimerAcknowledged: true,
      })
      .expect(201);

    expect(profileResponse.body.userId).toBe(userId);
    expect(profileResponse.body.healthDisclaimerAcknowledged).toBe(true);

    const optionsResponse = await request(app.getHttpServer())
      .post('/onboarding/plan-options')
      .set('x-user-id', userId)
      .expect(201);

    const options = optionsResponse.body.options as PlanOption[];

    expect(options).toHaveLength(3);
    expect(options.map((o) => o.rate)).toEqual([
      'mild',
      'moderate',
      'aggressive',
    ]);

    const moderatePlan = options.find((o) => o.rate === 'moderate');
    expect(moderatePlan).toBeDefined();

    const activationResponse = await request(app.getHttpServer())
      .post('/onboarding/activate-plan')
      .set('x-user-id', userId)
      .send({ rate: moderatePlan!.rate })
      .expect(201);

    expect(activationResponse.body.userId).toBe(userId);
    expect(activationResponse.body.active).toBe(true);
    expect(activationResponse.body.rate).toBe('moderate');
    expect(activationResponse.body.safe).toBe(true);

    const activePlanResponse = await request(app.getHttpServer())
      .get('/onboarding/active-plan')
      .set('x-user-id', userId)
      .expect(200);

    expect(activePlanResponse.body.id).toBe(activationResponse.body.id);
    expect(activePlanResponse.body.active).toBe(true);
  });

  it('rejects plan options for an unsafe target date', async () => {
    await request(app.getHttpServer())
      .post('/onboarding/profile')
      .set('x-user-id', userId)
      .send({
        gender: 'male',
        age: 30,
        heightCm: 180,
        currentWeightKg: 100,
        goalWeightKg: 70,
        activityLevel: 'sedentary',
        targetDate: daysFromNow(30),
        healthDisclaimerAcknowledged: true,
      })
      .expect(201);

    const optionsResponse = await request(app.getHttpServer())
      .post('/onboarding/plan-options')
      .set('x-user-id', userId)
      .expect(400);

    expect(optionsResponse.body.statusCode).toBe(400);
    expect(optionsResponse.body.minimumSafeDays).toBeGreaterThan(30);
  });

  it('rejects activation when the health disclaimer is not acknowledged', async () => {
    await request(app.getHttpServer())
      .post('/onboarding/profile')
      .set('x-user-id', userId)
      .send({
        gender: 'male',
        age: 30,
        heightCm: 180,
        currentWeightKg: 100,
        goalWeightKg: 90,
        activityLevel: 'sedentary',
        targetDate: daysFromNow(180),
        healthDisclaimerAcknowledged: false,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/onboarding/activate-plan')
      .set('x-user-id', userId)
      .send({ rate: 'moderate' })
      .expect(400);
  });

  it('returns 404 when the profile is missing', async () => {
    await request(app.getHttpServer())
      .get('/onboarding/profile')
      .set('x-user-id', 'no-profile-user')
      .expect(404);
  });

  it('rejects a profile with invalid data', async () => {
    await request(app.getHttpServer())
      .post('/onboarding/profile')
      .set('x-user-id', userId)
      .send({
        gender: 'male',
        age: 30,
        heightCm: 180,
        currentWeightKg: -5,
        goalWeightKg: 90,
        activityLevel: 'sedentary',
        targetDate: daysFromNow(180),
        healthDisclaimerAcknowledged: true,
      })
      .expect(400);
  });
});
