import { useRouter } from "next/router"
import React, { useState, MouseEvent, SetStateAction, Dispatch } from "react"
import { DeleteButton, EditQuestionEntity, EditSingleEntity, QuizQuestion } from "./quiz_forms"
import css from '../styles/quiz.module.scss';
import { TiTickOutline } from "react-icons/ti";
import { ImCheckmark, ImCross } from "react-icons/im";

enum AnswerState {
    Incorrect = "incorrect",
    Correct = "correct",
    Pending = "unanswered"
}

interface QuizChoiceUnit { id: string, name: string }

interface QuizOptionsProps {
    answer: string;
    choiceSelector: string;
    editAccess: boolean; 
    viewAnswers: boolean;
    selectFn: Dispatch<SetStateAction<number>>;
    selectNumber: number;
    tickSetter: Dispatch<SetStateAction<number>>;
    setAnswerState: Dispatch<SetStateAction<AnswerState>>;
    setQuestionsAnswered: Dispatch<SetStateAction<number>>;
}

interface BaseQuestionUnitProps {
    editAccess: boolean; 
    viewAnswers: boolean;
    tickSetter: Dispatch<SetStateAction<number>>;
    setQuestionsAnswered: Dispatch<SetStateAction<number>>;
}
interface QuestionUnitComponentProps extends BaseQuestionUnitProps  {
    quizId: string;
    questionUnit: QuizQuestion;
    refreshQuestionsFn: () => void
}

interface QuestionOptionsProps extends BaseQuestionUnitProps {
    questionId: string
    quizId: string;
    choiceSelectors: string[];
    answer: string;
    refreshQuestionsFn: () => void
}

export const QuizUnitComponent = ({quizId, questionUnit, viewAnswers, editAccess, tickSetter, setQuestionsAnswered, refreshQuestionsFn}: QuestionUnitComponentProps) => {
    const answerEditProps = {quizId, questionUnit, refreshQuestionsFn};
    return (
        <section>
            <li className={css.question}>{questionUnit.question} 

            {editAccess && <div className={css.questionEdit}>
                <EditSingleEntity quizId={quizId} questionId={questionUnit._id} refreshPageFn={refreshQuestionsFn} entityType={EditQuestionEntity.Question}/>
                <DeleteButton questionId={questionUnit._id} quizId={quizId} refreshQuestionsFn={refreshQuestionsFn}/>
            </div>}

            </li> 
            {viewAnswers && <div className={css.options}>

            <QuizOptionUnit questionId={questionUnit._id} quizId={quizId} 
                refreshQuestionsFn={refreshQuestionsFn} answer={Object.values(questionUnit.answer)[0]} 
                choiceSelectors={questionUnit.options[0]} editAccess={editAccess} viewAnswers={viewAnswers} 
                tickSetter={tickSetter} setQuestionsAnswered={setQuestionsAnswered}/>
            </div>}
        </section>
    )

}

export const QuizOptionUnit = ({questionId, quizId, refreshQuestionsFn, choiceSelectors, answer, editAccess, 
                                viewAnswers, tickSetter, setQuestionsAnswered}: QuestionOptionsProps) => {
    const [answersSelected, setAnswersSelected] = useState<number>(0)
    const [answerState, setAnswerState] = useState<AnswerState>(AnswerState.Pending);
    return (
      <div className={css.options}>
        <ol >

          {Object.entries(choiceSelectors).map(([key, value]) =>
                <li key={key}>
                <QuizOption answer={answer} choiceSelector={value} editAccess={editAccess} viewAnswers={viewAnswers} 
                    selectFn={setAnswersSelected} selectNumber={answersSelected} tickSetter={tickSetter} 
                    setAnswerState={setAnswerState} setQuestionsAnswered={setQuestionsAnswered} key={key}/>
                </li>
          )}
        </ol>

        {answerState == AnswerState.Correct && <ImCheckmark size={100} color="green"/>}
        {answerState == AnswerState.Incorrect && 
            <>
                <ImCross size={50} color="red" />
                <div className={css.answerArea}>
                    <span className={css.optionAnswer}>{answer}</span>
                    {editAccess && <EditSingleEntity questionId={questionId} quizId={quizId} refreshPageFn={refreshQuestionsFn} 
                    entityType={EditQuestionEntity.Answer} />}
                </div>
            </>}

    </div>
    )
}
    
export const QuizOption = ({answer, choiceSelector, editAccess, viewAnswers, selectFn, selectNumber, tickSetter, setAnswerState, 
                                            setQuestionsAnswered}: QuizOptionsProps): JSX.Element => {
    const [quizId, setQuizId] = useState<null>();
    const [optionSelected, setOptionSelected] = useState<boolean>(false);
    const router = useRouter();
    const onClickHandler = (event: MouseEvent, chosenAnswer: string) => {
        event.preventDefault();

        if (selectNumber == 0 && optionSelected == false) {
            setOptionSelected(prevState => !prevState)
            selectFn(prevState => prevState += 1);
         
        } else if (selectNumber == 1 && optionSelected == true) {
            setOptionSelected(prevState => !prevState)
            selectFn(prevState => prevState -= 1);
        }
        const answerCorrect = answer == choiceSelector;
        setQuestionsAnswered(prevState => prevState += 1);
        if (answerCorrect) {
            setAnswerState(() => AnswerState.Correct)
            tickSetter(prevState => prevState += 1);
            return
        }
        setAnswerState(() => AnswerState.Incorrect);
    }
    return (
        <button onClick={(e) => onClickHandler(e, choiceSelector)}>
            {choiceSelector}{optionSelected &&<TiTickOutline/>}
        </button>
    )
}
