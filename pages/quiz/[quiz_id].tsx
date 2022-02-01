import React, { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { NextRouter, useRouter } from "next/router";
import Link from "next/link";
import { QuizModel } from "../../components/quiz_forms";
import { TiTickOutline } from 'react-icons/ti';
import QuizManagerClient from "../quiz_manager_client";
import { UserLevel } from "../../components/login";
import css from '../../styles/quiz.module.scss';
import { QuizOption, QuizOptionUnit } from "../../components/quiz_options";
import axios from "axios";

export interface RawQuizzes {
    quizzes: QuizModel | undefined;
}

export default function QuizPage(): JSX.Element {
    const [quizData, setQuizData] = useState<QuizModel>();

    const router = useRouter();
    const { query: { quiz_id }, } = router;
    const [username, setUsername] = useState<string>();
    const [readAccess, setReadAccess] = useState<boolean>(false);
    const [viewAnswers, setViewAnswers] = useState<boolean>(false);
    const [editAccess, setEditAccess] = useState<boolean>(false);
    
    const [correctCount, setCorrectCount] = useState<number>(0);
    const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);

    const [hasSubmit, setHasSubmit] = useState<boolean>(false);
    const [apiResponse, setApiResponse] = useState<string>();

    

    useEffect(() => {
        // router && quiz_id && console.log('inside useeffect')
        // router && 
        quiz_id && QuizManagerClient.getQuizById(quiz_id.toString()).then(res => {
            // console.log(res)
            setQuizData(res.data[0])
            localStorage.setItem('route', router.asPath);
            // sessionStorage.setItem('')

            const browserUsername = localStorage.getItem('username')
            browserUsername && setUsername(browserUsername);
            const browserToken = sessionStorage.getItem('authToken');    
            if (browserUsername || browserToken) {
                const storedUserData: {userLevel: UserLevel, score: string} = JSON.parse(JSON.stringify(localStorage));
                
              //   setScore(parseInt(storedUserData.score));
              //   setUserLevel(storedUserData.userLevel);        
                const readPermissions: boolean =  storedUserData.userLevel != UserLevel.Unauthenticated;
                const answerPermissions: boolean = storedUserData.userLevel == (UserLevel.Limited || UserLevel.Unlimited);
                const editPermissions: boolean = storedUserData.userLevel == UserLevel.Unlimited;
                setReadAccess(readPermissions)
                setViewAnswers(answerPermissions);
                setEditAccess(editPermissions);
            }
        }).catch(err => console.log(err));
    }, [router])
    const questionCount = quizData && quizData.questions.length;

    return (
        <>
        {!quizData && <header className={css.pageLoadingSpinner}></header>}
        {quizData && 
        <header>
            <button className={css.backButton} onClick={(): void => returnToPrevious(router)}>
            &larr; Return to Previous Page
            </button>
     
            <h1>Current Quiz: {quizData.name}</h1>
            <h2>Topic: {quizData.topic}</h2>
            <h3>Difficulty Level: {quizData.difficultyLevel}</h3>
            {editAccess && <button>Add questions</button>}
        </header>}
            
            
        {quizData && <main>
            <ol className={css.questionList}>
            {readAccess && quizData.questions.map((questionUnit, index) => 
                <div key={questionUnit._id} className={css.questionUnit}>
                    <li className={css.question}>{questionUnit.question} {editAccess && <button>Edit question</button>}</li>
                            {viewAnswers && <p className={css.options}>
                    {viewAnswers && <QuizOptionUnit answer={Object.values(questionUnit.answer)[0]} choiceSelectors={questionUnit.options[0]} editAccess={editAccess} viewAnswers={viewAnswers} 
                            tickSetter={setCorrectCount} tickCount={correctCount} setQuestionsAnswered={setQuestionsAnswered}/>}
                   
                    </p>}
                </div>
                
            )}
            </ol>
            {hasSubmit && <div>{apiResponse}</div>}
            {/* {console.log('questionsAnswered ', questionsAnswered, ';questionCount ', questionCount)} */}
            {questionsAnswered < questionCount && 'Please answer all questions'}
            {questionsAnswered >= questionCount && <ScoreSubmit username={username} score={correctCount} quizId={quiz_id.toString()} 
                                                        submitSetter={setHasSubmit} responseSetter={setApiResponse}/>}
            {console.log('hasSubmit ', hasSubmit)}
        </main>
        }
       
        </>
    )
}

interface ScoreSubmitProps {
    username: string;
    score: number; 
    quizId: string; 
    submitSetter: Dispatch<SetStateAction<boolean>>;
    responseSetter: Dispatch<SetStateAction<string>>;

}

const ScoreSubmit = ({username, score, quizId, submitSetter, responseSetter}: ScoreSubmitProps) => {
    const updateScore = (event: FormEvent) => {
        event.preventDefault();
        submitSetter(prevState => !prevState);
        QuizManagerClient.postScore(username, score, quizId).then(res => {
            localStorage.setItem('score', res.data.userScore);
            responseSetter(res.status == (200 || 201) && `You scored ${parseInt(res.data.quizScore)} %` )
        }).catch(err => {
            console.log(err)
            responseSetter(err.data);
        })
    }
    return (
        <form onSubmit={updateScore}>
            <input type='submit' value='submit score' />
        </form>
    )
}

function returnToPrevious(router: NextRouter): void {
    localStorage.removeItem('route');
    router.back();
  }
