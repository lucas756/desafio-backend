import { Request, Response } from "express";
import * as Yup from 'yup';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

interface createBodySurvey {
  title: string;
  target_audience: string;
  email: string;
  questions: string[];
}

interface updateBodySurvey {
  title: string;
  target_audience: string;
  email: string;
  questions: { id: number; question_text: string }[]
}

class SurveyController {
  async create(req: Request, res: Response): Promise<void> {
    const surveySchema = Yup.object().shape({
      title: Yup.string().required('Título é obrigatório'),
      target_audience: Yup.string().required('Público-alvo é obrigatório'),
      email: Yup.string().email('Email inválido').required('Email é obrigatório'),
      questions: Yup.array().of(Yup.string().required('Pergunta é obrigatória')).required('Perguntas são obrigatórias'),
    });

    try {
      await surveySchema.validate(req.body);
    } catch (err) {
      res.status(400).json({});
      return 
    }


    const { title, target_audience, email, questions }: createBodySurvey = req.body;
    const survey = await prisma.survey.create({
      data: {
        title,
        targetAudience: target_audience,
        email,
        questions: {
          create: questions.map(question => ({ questionText: question }))
        }
      }
    });
    res.json(survey);
  }

  async update(req: Request, res: Response): Promise<void> {
    const updateSurveySchema = Yup.object().shape({
      title: Yup.string().required('Título é obrigatório'),
      target_audience: Yup.string().required('Público-alvo é obrigatório'),
      email: Yup.string().email('Email inválido').required('Email é obrigatório'),
      questions: Yup.array().of(
        Yup.object().shape({
          id: Yup.number().required('ID da pergunta é obrigatório'),
          question_text: Yup.string().required('Texto da pergunta é obrigatório'),
        })
      ).required('Perguntas são obrigatórias'),
    });

    try {
      await updateSurveySchema.validate(req.body);
    } catch (err) {
      res.status(400).json({});
      return 
    }

    const { id } = req.params;
    const { title, target_audience, email, questions }: updateBodySurvey = req.body;

    try {
      const existingSurvey = await prisma.survey.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!existingSurvey) {
        res.status(404).json({ error: 'Pesquisa não encontrada' });
        return
      }
      // Atualiza a pesquisa
      const survey = await prisma.survey.update({
        where: { id: parseInt(id) },
        data: {
          title,
          targetAudience: target_audience,
          email,
          updatedAt: new Date(),
        }
      });

      // Atualiza as perguntas
      await Promise.all(
        questions.map(async (question) => {
          await prisma.question.update({
            where: { id: question.id },
            data: { questionText: question.question_text }
          });
        })
      );

      res.json(survey);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar a pesquisa ou as perguntas.' });
    }
  }
}

export default new SurveyController();