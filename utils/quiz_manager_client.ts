import axios, { AxiosResponse } from "axios";
import { Answer, EditQuestionEntity, QuestionRequiredFields, QuizDifficulty, QuizModel, QuizQuestion, QuizTopic } from "../components/quiz_forms";
import { quizIdPath, quizPath, quizTopicLevels, quizTopicPath, scorePath, singleQuestionIdPath, singleQuizIdPath } from "./constants";

type UpdateQuizPropertyKey = 'name' | 'topic' | 'difficultyLevel';

export enum EditMethods {
    POST,
    PATCH,
    DELETE
}
export enum EditQuizEntity {
    Name = 'name',
    Topic = 'topic',
    Level = 'level'
}
export interface PostQuestionProps {
    quizId: string;
    question: string;
    options: { A: string; B: string; C: string; }
    answer: {};
}
export interface EditQuestionProps {
    _id: string;
    quizId: string;
    question?: string;
    options?: { A: string; B: string; C: string; }
    answer?: Answer;
}

export interface EditQuizProps {
    _id: string;
    topic?: string;
    name?: string;
    difficultyLevel?: QuizDifficulty;
    questions?: QuizQuestion[];
}

export interface PostQuizProps {
    topic: string;
    name: string;
    difficultyLevel: QuizDifficulty;
    questions: QuestionRequiredFields[];
}

export default class QuizManagerClient {
    static getAllQuizzes = async (): Promise<AxiosResponse<any, any>> => axios.get(quizPath);
    
    static getQuizTopics = async (): Promise<AxiosResponse<any, any>> => axios.get(quizTopicPath);
    
    static getQuizLevels = async (topicName: string): Promise<AxiosResponse<any, any>> => {
        return axios.get(quizTopicLevels(topicName), {params: {topic: topicName}});
    }
    static getQuizNames = async (topicName: string, topicLevel: string): Promise<AxiosResponse<any, any>> => {
        return axios.get(quizIdPath(topicName, topicLevel), {params: {topic: topicName, level: topicLevel}});
    }

    static getQuizById = async (id: string): Promise<AxiosResponse<any, any>> => {
        return axios.get(singleQuizIdPath(id), {params: {id: id}})
    }

    static postScore = async (username: string, score: number, quizId: string): Promise<AxiosResponse<any, any>> => {
        return axios.patch(scorePath(username), {score: score, quizId: quizId}, {params: {username: username}})
    }


    /** HTTP client methods to edit, add, or delete a question unit / a key-property in a question unit  */
    static postQuestionUnit = async(postUnit: PostQuestionProps) => axios.post(singleQuizIdPath(postUnit.quizId), postUnit);

    static deleteQuestionUnit = async (quizId: string, questionId: string) => {
        return axios.delete(singleQuestionIdPath(quizId, questionId), { params: { _id: quizId, questionId: questionId }})
    }

    static editQuestionOrAnswerString = async (quizId: string, questionId: string, newString: string, entityType: EditQuestionEntity) => {
        const requestPath = singleQuestionIdPath(quizId, questionId) + '/' + entityType;
        return await axios.patch(requestPath, { newValue: newString }, { params: { id: quizId, questionId: questionId }})
    }

 
    /** HTTP client methods to edit, add, or delete a quiz / a key-property in a quiz  */
    static postQuiz = async (quizProps: PostQuizProps) => axios.post(quizPath, quizProps);
    static deleteQuiz = async (quizId: string) => axios.delete(singleQuizIdPath(quizId), { params: { id: quizId }});

    static editQuiz = async(id: string, newValue: string, editQuizEntity: EditQuizEntity) => {
        const quizEditEndpoint = `${singleQuizIdPath(id)}/${editQuizEntity}`
        return axios.patch(quizEditEndpoint, { newValue: newValue }, { params: { id: id }});
    }
}



