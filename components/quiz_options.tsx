import { Router, useRouter } from "next/router"
import React, { useState, MouseEvent, SetStateAction, Dispatch } from "react"
import { QuizDifficulty, QuizQuestion, QuizSelectButton } from "./quiz_forms"
import css from '../styles/quiz.module.scss';
import { TiTickOutline } from "react-icons/ti";
import { ImCheckmark, ImCross } from "react-icons/im";

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


export const QuizOption = ({answer, choiceSelector, editAccess, viewAnswers, selectFn, selectNumber, tickSetter, setAnswerState, setQuestionsAnswered}: QuizOptionsProps): JSX.Element => {
    const [quizId, setQuizId] = useState<null>();
    const [optionSelected, setOptionSelected] = useState<boolean>(false);
    const router = useRouter();
 
    const onClickHandler = (event: MouseEvent, chosenAnswer: string) => {
        event.preventDefault();
        // console.log(chosenAnswer);
        // console.log(answer)

        if (selectNumber == 0 && optionSelected == false) {
            // console.log('selectNumber == 0 && optionSelected == false')
            setOptionSelected(prevState => !prevState)
            selectFn(prevState => prevState += 1);
         
        } else if (selectNumber == 1 && optionSelected == true) {
            // console.log('selectNumber == 1 && optionSelected == true')
            setOptionSelected(prevState => !prevState)
            selectFn(prevState => prevState -= 1);
        }
        const answerCorrect = answer == choiceSelector;
        setQuestionsAnswered(prevState => prevState += 1);
        if (answerCorrect) {
                    console.log('answerCorrect')

            setAnswerState(() => AnswerState.Correct)
            tickSetter(prevState => prevState += 1);
            return
        }
        setAnswerState(() => AnswerState.Incorrect);
        
    }

    return (
  
        <button onClick={(e) => onClickHandler(e, choiceSelector)}>{choiceSelector}{optionSelected &&<TiTickOutline/>}</button>

        
)}

interface QuizOptionUnitProps {
    choiceSelectors: string[];
    answer: string;
    editAccess: boolean; 
    viewAnswers: boolean;
    tickSetter: Dispatch<SetStateAction<number>>;
    tickCount: number;
    setQuestionsAnswered: Dispatch<SetStateAction<number>>;
}

enum AnswerState {
    Incorrect = "incorrect",
    Correct = "correct",
    Pending = "unanswered"

}

export const QuizOptionUnit = ({choiceSelectors, answer, editAccess, viewAnswers, tickSetter, tickCount, setQuestionsAnswered}: QuizOptionUnitProps) => {
    const [answersSelected, setAnswersSelected] = useState<number>(0)
    const [answerState, setAnswerState] = useState<AnswerState>(AnswerState.Pending);
    
    return (
      <p className={css.options}>
          {Object.entries(choiceSelectors).map(([key, value]) =>
            <ol type='A'>
                <QuizOption answer={answer} choiceSelector={value} editAccess={editAccess} viewAnswers={viewAnswers} 
                    selectFn={setAnswersSelected} selectNumber={answersSelected} tickSetter={tickSetter} setAnswerState={setAnswerState} setQuestionsAnswered={setQuestionsAnswered}/>
            </ol>
          )}
        {answerState == AnswerState.Correct && <ImCheckmark size={100} color="green"/>}
        {answerState == AnswerState.Incorrect && 
            <>
                <ImCross size={50} color="red" />
                <span>{answer}</span>
            </>}

    </p>
    )
}
    

