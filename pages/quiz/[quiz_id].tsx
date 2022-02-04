import React, { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DeleteButton, EditQuizMetadataButton, PostQuestionUnit, QuizModel } from "../../components/quiz_forms";
import QuizManagerClient from "../../utils/quiz_manager_client";
import { UserLevel } from "../../components/login";
import css from '../../styles/quiz.module.scss';
import { QuizUnitComponent } from "../../components/quiz_options";
import { returnToPrevious } from "../../utils/utilities";

export interface RawQuizzes {
    quizzes: QuizModel | undefined;
}
enum Permissions {
    None = 'no access',
    Read = 'read quiz',
    Answer = 'view answers',
    Edit = 'edit quiz or its questions'
}

export default function QuizPage(): JSX.Element {
    const router = useRouter();
    const { query: { quiz_id }, } = router;

    const [quizData, setQuizData] = useState<QuizModel>();
    
    const [username, setUsername] = useState<string>();
    const [readAccess, setReadAccess] = useState<boolean>(false);
    const [viewAnswers, setViewAnswers] = useState<boolean>(false);
    const [editAccess, setEditAccess] = useState<boolean>(false);

    const [postForm, setPostForm] = useState<boolean>(false);
    
    const [correctCount, setCorrectCount] = useState<number>(0);
    const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
    const [hasSubmit, setHasSubmit] = useState<boolean>(false);
    const [apiResponse, setApiResponse] = useState<string>('');
    const [userMessage, setUserMessage] = useState<string>('');

    const questionsHandler = () => {
        QuizManagerClient.getQuizById(quiz_id.toString()).then(res => {
            setQuizData(res.data[0]);
        }).catch(err => console.log(err));
    }

    useEffect(() => {
        if (quiz_id) {
            questionsHandler();
            localStorage.setItem('route', router.asPath);

            if (localStorage) {
                try {
                    const browserUsername = localStorage.getItem('username')
                    browserUsername && setUsername(browserUsername);
                    const browserToken = sessionStorage.getItem('authToken');    
                    if (browserUsername || browserToken) {
                        const storedUserData: {userLevel: UserLevel, score: string} = JSON.parse(JSON.stringify(localStorage));

                        
                        const readPermissions: boolean =  storedUserData.userLevel != UserLevel.Unauthenticated;
                        const answerPermissions: boolean = storedUserData.userLevel == UserLevel.Limited || storedUserData.userLevel == UserLevel.Unlimited;

                        const editPermissions: boolean = storedUserData.userLevel == UserLevel.Unlimited;
                        setReadAccess(readPermissions)
                        setViewAnswers(answerPermissions);
                        setEditAccess(editPermissions);
                        !readPermissions && setUserMessage('Please login or register to see questions')
                        readPermissions && !answerPermissions && setUserMessage(`Please request read access or enter security details on the home page to ${Permissions.Answer}`)
                        answerPermissions && !editPermissions && setUserMessage(`Please request edit access to ${Permissions.Edit}`)
                    }
                } catch (err) {
                    console.log(err);
                    setUserMessage('Oh no! An Error occurred while loading the page!')
                }
            }   

        }
    }, [router])
    const questionCount = quizData && quizData.questions.length;

    return (
        <div className={css.quizPage}>
        {!quizData && <header className={css.pageLoadingSpinner}></header>}
        {quizData && 
        <header>
            <button className={css.backButton} onClick={(): void => returnToPrevious(router)}>
            &larr; Return to Previous Page
            </button>
            {userMessage}

            <h1>Current Quiz: {quizData.name}</h1>
            <h2>Topic: {quizData.topic}</h2>
            <h3>Difficulty Level: {quizData.difficultyLevel}</h3>
            {editAccess && (
                <div className={css.quizCrudButtons}>
                    <EditQuizMetadataButton quizId={quizData._id} refreshQuestionsFn={questionsHandler}/>
                    <DeleteButton quizId={quizData._id} refreshQuestionsFn={questionsHandler}/>
                    <button onClick={() => setPostForm(prevState => !prevState)}>
                            {postForm ? 'Close question creation box' : 'Add question'}</button>
                    {postForm && <PostQuestionUnit quizId={quizData._id} refreshPageFn={questionsHandler}/>}

                </div>
                )}

        </header>}
            
            
        {quizData && <main className={css.mainQuizSpace}>
            <ol className={css.questionList}>
            {readAccess && quizData.questions.map((questionUnit, index) => 
                <div key={questionUnit._id} className={css.questionUnit}>
                    <QuizUnitComponent quizId={quizData._id} questionUnit={questionUnit} viewAnswers={viewAnswers} editAccess={editAccess} 
                                tickSetter={setCorrectCount} setQuestionsAnswered={setQuestionsAnswered} refreshQuestionsFn={questionsHandler}/>
                </div>
                
            )}
            </ol>
            {hasSubmit && <div>{apiResponse}</div>}
            {questionsAnswered < questionCount && 'Please answer all questions to submit your score'}
            <span>questions answered: {questionsAnswered},  total questions: {questionCount}</span>

            {questionsAnswered >= questionCount && <ScoreSubmit username={username} score={correctCount} quizId={quiz_id.toString()} 
                                                        submitSetter={setHasSubmit} responseSetter={setApiResponse}/>}
        </main>
        }
       
        </div>
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
            console.log(res)
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
