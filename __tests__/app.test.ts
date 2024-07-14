import request from "supertest";
import app from '../src/app'; // Ajuste o caminho conforme necessário
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Survey API', () => {  
  afterAll(async () => {
    await prisma.$disconnect(); // Desconecta do banco de dados após os testes
  });

  describe('POST /survey', () => {
    it('should create a survey', async () => {
      const response = await request(app)
        .post('/survey')
        .send({
          title: 'Nova Pesquisa',
          target_audience: 'Clientes',
          email: 'cliente@example.com',
          questions: ['Qual sua satisfação?', 'Recomendaria nosso serviço?'],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Nova Pesquisa');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/survey')
        .send({
          target_audience: 'Clientes',
          email: 'cliente@example.com',
          questions: [],
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /survey/:id', () => {
    let surveyId: number;

    beforeAll(async () => {
      const survey = await prisma.survey.create({
        data: {
          title: 'Pesquisa Existente',
          targetAudience: 'Clientes',
          email: 'cliente@example.com',
          questions: {
            create: [
              { questionText: 'Qual sua satisfação?' },
            ],
          },
        },
      });
      surveyId = survey.id;
    });

    it('should update an existing survey', async () => {
      const response = await request(app)
        .put(`/survey/${surveyId}`)
        .send({
          title: 'Pesquisa Atualizada',
          target_audience: 'Clientes',
          email: 'cliente@atualizado.com',
          questions: [
            { id: 1, question_text: 'Qual sua nova satisfação?' },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Pesquisa Atualizada');
    });

    it('should return 404 if survey does not exist', async () => {
      const response = await request(app)
        .put('/survey/99999')
        .send({
          title: 'Pesquisa Atualizada',
          target_audience: 'Clientes',
          email: 'cliente@atualizado.com',
          questions: [
            { id: 1, question_text: 'Qual sua nova satisfação?' },
          ],
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Pesquisa não encontrada');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .put(`/survey/${surveyId}`)
        .send({
          target_audience: 'Clientes',
          email: 'cliente@atualizado.com',
          questions: [], // Faltando título
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /survey/:id/responses', () => {
    let surveyId: number;
    let questionIds: number[];

    beforeAll(async () => {
      const survey = await prisma.survey.create({
        data: {
          title: 'Pesquisa de Satisfação',
          targetAudience: 'Clientes',
          email: 'cliente@example.com',
          questions: {
            create: [
              { questionText: 'Qual a sua satisfação?' },
              { questionText: 'Recomendaria nosso serviço?' },
            ],
          },
        },
      });
      const questions = await prisma.question.findMany({
        where: { surveyId: survey.id }, // Adicione o filtro para pegar as perguntas da pesquisa
      });
      surveyId = survey.id;
      questionIds = questions.map(q => q.id);
    });

    it('should create a response', async () => {
      const response = await request(app)
        .post(`/survey/${surveyId}/responses`)
        .send({
          target_audience: 'Clientes',
          stars: 5,
          email: 'cliente@example.com',
          answers: [
            { question_id: questionIds[0], answer_text: 'Muito Satisfeito' },
            { question_id: questionIds[1], answer_text: 'Sim' },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.stars).toBe(5);
    });

    it('should return 404 if survey does not exist', async () => {
      const response = await request(app)
        .post('/survey/99999/responses')
        .send({
          target_audience: 'Clientes',
          stars: 5,
          email: 'cliente@example.com',
          answers: [
            { question_id: 1, answer_text: 'Muito Satisfeito' },
          ],
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Pesquisa não encontrada');
    });

    it('should return 400 if question does not belong to the survey', async () => {
      const response = await request(app)
        .post(`/survey/${surveyId}/responses`)
        .send({
          target_audience: 'Clientes',
          stars: 5,
          email: 'cliente@example.com',
          answers: [
            { question_id: 999, answer_text: 'Não Satisfeito' }, // ID inválido
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Uma ou mais perguntas não pertencem a esta pesquisa.');
    });
  });

  describe('GET /survey/responses', () => {
    beforeAll(async () => {
      const survey = await prisma.survey.create({
        data: {
          title: 'Pesquisa de Satisfação',
          targetAudience: 'Clientes',
          email: 'cliente@example.com',
          questions: {
            create: [
              { questionText: 'Qual a sua satisfação?' },
            ],
          },
        },
      });

      await prisma.response.create({
        data: {
          surveyId: survey.id,
          targetAudience: 'Clientes',
          stars: 5,
          email: 'cliente@example.com',
          answers: {
            create: [
              { questionId: 1, answerText: 'Muito Satisfeito' },
            ],
          },
        },
      });
    });

    it('should list responses by target audience', async () => {
      const response = await request(app)
        .get('/survey/responses')
        .query({ target_audience: 'Clientes' });

      expect(response.status).toBe(200);
    });
  });
});