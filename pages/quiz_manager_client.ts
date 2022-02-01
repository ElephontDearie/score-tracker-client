import axios, { AxiosResponse } from "axios";
import { Answer, QuizDifficulty, QuizModel, QuizQuestion, QuizTopic } from "../components/quiz_forms";
import { quizIdPath, quizPath, quizTopicLevels, quizTopicPath, scorePath, singleQuestionIdPath, singleQuizIdPath } from "../constants";

type UpdateQuizPropertyKey = 'name' | 'topic' | 'difficultyLevel';

export enum EditMethods {
    POST,
    PATCH,
    DELETE
}

export interface EditQuestionProps {
    _id: string;
    quizId: string;
    question?: string;
    options?: { a: string; b: string; c: string; }
    answer?: Answer;
}
export interface EditQuizProps {
    _id: string;
    topic?: QuizTopic;
    name?: string;
    difficultyLevel?: QuizDifficulty;
    questions?: QuizQuestion[];
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
    static editQuestionString = async (quizId: string, questionId: string, newQuestion: string) => 
        axios.patch(`${singleQuestionIdPath(quizId, questionId)}/question`, { newValue: newQuestion }, { params: { id: quizId, questionId: questionId }})

    static editQuestionAnswer = async (quizId: string, questionId: string, newAnswer: string) => 
            axios.patch(`${singleQuestionIdPath(quizId, questionId)}/answer`, { newValue: newAnswer }, { params: { id: quizId, questionId: questionId }})


    static postOrDeleteQuestionUnit = async (httpMethod: EditMethods, questionUnit: EditQuestionProps, updateMap?: {[key: string]: string}) => {
        const { _id, quizId, question, options, answer } = questionUnit;

        switch (httpMethod) {
            case EditMethods.POST:
                return axios.post(singleQuizIdPath(_id), questionUnit);
            case EditMethods.DELETE:
                return axios.delete(singleQuestionIdPath(quizId, _id), { params: { _id: quizId, questionId: _id }})
        }
    }

    /** HTTP client methods to edit, add, or delete a quiz / a key-property in a quiz  */
    static postOrDeleteQuiz = async (httpMethod: EditMethods, id: string, quizProps?: EditQuizProps) => {
        switch (httpMethod) {
            case EditMethods.POST:
                return axios.post(quizPath, quizProps);
            case EditMethods.DELETE:
                return axios.delete(singleQuizIdPath(id), { params: { id: id }})
        }
    }
    static editQuizName = async (id: string, newName: string) =>  axios.patch(`${singleQuizIdPath(id)}/name`, { newValue: newName }, { params: { id: id }})
    static editQuizTopic = async (id: string, newTopic: string) =>  axios.patch(`${singleQuizIdPath(id)}/topic`, { newValue: newTopic }, { params: { id: id }})
    static editQuizLevel = async (id: string, newLevel: string) =>  axios.patch(`${singleQuizIdPath(id)}/level`, { newValue: newLevel }, { params: { id: id }})



}



