
import { TiTickOutline } from 'react-icons/ti';
import { MouseEvent } from 'react';

export enum QuizTopic {
    Econ = "Economics",
    Comp = "Computer Engineering"
}

export enum QuizDifficulty {
    Easy = "easy",
    Medium = "intermediate",
    Hard = "advanced"
}

export interface QuizQuestion {
    _id: string;
    quizId: string;
    question: string;
    options: { a: string; b: string; c: string; }
    answer: Answer;
    dateAdded: Date;
}

type QuestionOptionKeys = 'a' | 'b' | 'c';

export type Answer = {
    [key in QuestionOptionKeys]: string
}



export interface QuizModel {
    _id: string;
    topic: QuizTopic;
    name: string;
    difficultyLevel: QuizDifficulty;
    questions: QuizQuestion[];
}

interface QuizSelectButtonProps {
    clickHandler: ((event: MouseEvent) =>  JSX.Element) | (() => Promise<boolean>)
}

interface QuizQuestionScreenProps {
    quizQuestions: QuizQuestion[]
}

interface QuestionEditProps {
    quizId: string;
    question: string;
    isEdit?: boolean;
}



export const AddUpdateQuestion = ({quizId, question, isEdit}: QuestionEditProps) => {

    const sendQuestion = () => {
        isEdit ? 
    }

    return (
        <section>
        </section>
    )
}

export const QuizSelectButton = ({clickHandler}: QuizSelectButtonProps): JSX.Element => {
    return (
        <button onClick={clickHandler}>
            <TiTickOutline />
        </button>
    )
}