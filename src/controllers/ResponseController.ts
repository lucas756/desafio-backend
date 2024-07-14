import { Request, Response } from "express";
import * as Yup from 'yup';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

interface createBodyResponse {
    target_audience: string;
    stars: number;
    email: string;
    answers: { question_id: number; answer_text: string }[]
}

class ResponseController {
    async create(req: Request, res: Response): Promise<void> {
        const responseSchema = Yup.object().shape({
            target_audience: Yup.string().required('Público-alvo é obrigatório'),
            stars: Yup.number().min(1).max(5).required('Classificação é obrigatória'),
            email: Yup.string().email('Email inválido').required('Email é obrigatório'),
            answers: Yup.array().of(
                Yup.object().shape({
                    question_id: Yup.number().required('ID da pergunta é obrigatório'),
                    answer_text: Yup.string().required('Resposta é obrigatória'),
                })
            ).required('Respostas são obrigatórias'),
        });
        await responseSchema.validate(req.body);

        const { id } = req.params;
        const { target_audience, stars, email, answers }: createBodyResponse = req.body;

        const existingSurvey = await prisma.survey.findUnique({
            where: { id: parseInt(id) },
            include: {
                questions: true, // Inclui as perguntas da pesquisa
            },
        });

        if (!existingSurvey) {
            res.status(404).json({ error: 'Pesquisa não encontrada' });
            return;
        }

        const validQuestionIds = existingSurvey.questions.map(q => q.id);
        const invalidAnswers = answers.filter(answer => !validQuestionIds.includes(answer.question_id));

        if (invalidAnswers.length > 0) {
            res.status(400).json({ error: 'Uma ou mais perguntas não pertencem a esta pesquisa.', invalidAnswers });
            return;
        }

        const response = await prisma.response.create({
            data: {
                surveyId: parseInt(id),
                targetAudience: target_audience,
                stars,
                email,
                answers: {
                    create: answers.map(answer => ({
                        questionId: answer.question_id,
                        answerText: answer.answer_text
                    }))
                }
            }
        });

        res.json(response);
    }

    async index(req: Request, res: Response): Promise<void> {
        const { target_audience, sort_by_stars } = req.query;

        const orderBy: { stars?: 'asc' | 'desc' } | undefined = sort_by_stars
            ? { stars: sort_by_stars === 'asc' ? 'asc' : 'desc' }
            : undefined;

        try {
            const responses = await prisma.response.findMany({
                where: { targetAudience: target_audience as string },
                orderBy
            });

            res.json(responses);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar as respostas.' });
        }
    }
}

export default new ResponseController();