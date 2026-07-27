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

describe('WeightLogController (e2e)', () => {
  let app: INestApplication<App>;
  const userId = 'weight-e2e-user';

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

  async function setupProfileAndPlan(): Promise<PlanOption> {
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
        healthDisclaimerAcknowledged: true,
      })
      .expect(201);

    const optionsResponse = await request(app.getHttpServer())
      .post('/onboarding/plan-options')
      .set('x-user-id', userId)
      .expect(201);

    const options = optionsResponse.body.options as PlanOption[];
    const moderatePlan = options.find((o) => o.rate === 'moderate')!;

    await request(app.getHttpServer())
      .post('/onboarding/activate-plan')
      .set('x-user-id', userId)
      .send({ rate: moderatePlan.rate })
      .expect(201);

    return moderatePlan;
  }

  it('supports full weight logging CRUD and trend analysis', async () => {
    await setupProfileAndPlan();

    const createResponse = await request(app.getHttpServer())
      .post('/weight-logs')
      .set('x-user-id', userId)
      .send({ weightKg: 99.5 })
      .expect(201);

    const entryId = createResponse.body.id;
    expect(createResponse.body.weightKg).toBe(99.5);

    const listResponse = await request(app.getHttpServer())
      .get('/weight-logs')
      .set('x-user-id', userId)
      .expect(200);

    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].id).toBe(entryId);

    const trendResponse = await request(app.getHttpServer())
      .get('/weight-logs/trend')
      .set('x-user-id', userId)
      .expect(200);

    expect(trendResponse.body.trend).toBe('insufficientData');

    const suggestionResponse = await request(app.getHttpServer())
      .get('/weight-logs/adjustment-suggestion')
      .set('x-user-id', userId)
      .expect(200);

    expect(suggestionResponse.body.suggestedPlan).toBeNull();

    const updateResponse = await request(app.getHttpServer())
      .patch(`/weight-logs/${entryId}`)
      .set('x-user-id', userId)
      .send({ weightKg: 99.2 })
      .expect(200);

    expect(updateResponse.body.weightKg).toBe(99.2);

    await request(app.getHttpServer())
      .delete(`/weight-logs/${entryId}`)
      .set('x-user-id', userId)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/weight-logs/${entryId}`)
      .set('x-user-id', userId)
      .expect(404);
  });

  it('suggests and applies an adjustment when behind planned loss', async () => {
    await setupProfileAndPlan();

    await request(app.getHttpServer())
      .post('/weight-logs')
      .set('x-user-id', userId)
      .send({
        weightKg: 100,
        loggedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/weight-logs')
      .set('x-user-id', userId)
      .send({ weightKg: 99.4 })
      .expect(201);

    const trendResponse = await request(app.getHttpServer())
      .get('/weight-logs/trend')
      .set('x-user-id', userId)
      .expect(200);

    expect(trendResponse.body.trend).toBe('behind');

    const suggestionResponse = await request(app.getHttpServer())
      .get('/weight-logs/adjustment-suggestion')
      .set('x-user-id', userId)
      .expect(200);

    expect(suggestionResponse.body.currentPlan.rate).toBe('moderate');
    expect(suggestionResponse.body.suggestedPlan.rate).toBe('aggressive');
    expect(suggestionResponse.body.requiresApproval).toBe(true);

    const applyResponse = await request(app.getHttpServer())
      .post('/weight-logs/apply-adjustment')
      .set('x-user-id', userId)
      .send({ rate: suggestionResponse.body.suggestedPlan.rate })
      .expect(201);

    expect(applyResponse.body.rate).toBe('aggressive');
    expect(applyResponse.body.active).toBe(true);

    const activePlanResponse = await request(app.getHttpServer())
      .get('/onboarding/active-plan')
      .set('x-user-id', userId)
      .expect(200);

    expect(activePlanResponse.body.rate).toBe('aggressive');
  });

  it('isolates weight logs between users', async () => {
    await setupProfileAndPlan();

    const createResponse = await request(app.getHttpServer())
      .post('/weight-logs')
      .set('x-user-id', userId)
      .send({ weightKg: 98 })
      .expect(201);

    const entryId = createResponse.body.id;

    await request(app.getHttpServer())
      .get(`/weight-logs/${entryId}`)
      .set('x-user-id', 'other-user')
      .expect(404);

    const listResponse = await request(app.getHttpServer())
      .get('/weight-logs')
      .set('x-user-id', 'other-user')
      .expect(200);

    expect(listResponse.body).toEqual([]);
  });

  it('returns 400 when adjusting without an active plan', async () => {
    await request(app.getHttpServer())
      .post('/weight-logs')
      .set('x-user-id', 'no-plan-user')
      .send({ weightKg: 80 })
      .expect(201);

    await request(app.getHttpServer())
      .get('/weight-logs/adjustment-suggestion')
      .set('x-user-id', 'no-plan-user')
      .expect(400);

    await request(app.getHttpServer())
      .post('/weight-logs/apply-adjustment')
      .set('x-user-id', 'no-plan-user')
      .send({ rate: 'moderate' })
      .expect(400);
  });
});
