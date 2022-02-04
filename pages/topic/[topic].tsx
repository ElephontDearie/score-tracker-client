import { useRouter } from "next/router"
import { useEffect, useState, MouseEvent } from "react";
import { AddQuiz } from "../../components/quiz_forms";
import QuizManagerClient from "../../utils/quiz_manager_client";
import css from '../../styles/topic.module.scss';
import { GiCrossroad } from 'react-icons/gi';
import { returnToPrevious } from "../../utils/utilities";

export interface QuizNameResponse {
    name: string;
    _id: string;
}

export default function TopicPage(): JSX.Element {
    const [requestStatus, setRequestStatus] = useState<string>('');
    const [namesList, setNamesList] = useState<QuizNameResponse[]>([])
    const [levels, setLevels] = useState<string[] | undefined>(undefined);
    const [quizLevel, setQuizLevel] = useState<string>(null);
    const [parsedTopic, setParsedTopic] = useState<string>(null);

    const router = useRouter();
    const { query: { topic }, } = router;
    const correctedTopic = (topic) => topic.toString().replace('_', ' ');

    useEffect(() => {
        localStorage.setItem('route', JSON.stringify(router.asPath));
        if (topic) {
            setParsedTopic(correctedTopic(topic));
            QuizManagerClient.getQuizLevels(correctedTopic(topic)).then(res => {
                setLevels(res.data.levels)
            }).catch(err => console.log(err));

        }
  
    }, [router])

    const getQuizNames = () => { 
        QuizManagerClient.getQuizNames(topic.toString(), quizLevel).then(res => { 
            setNamesList(res.data.quizNames)
        }).catch(err => console.log(err)); 
    }

    const onLevelSelect = (event: MouseEvent, newLevel: string) => {
        setQuizLevel(newLevel);
        getQuizNames();
    }

    return (
        <div className={css.topicPage}>
            <header>
            <button className={css.backButton} onClick={(): void => returnToPrevious(router)}>&larr; Return to Previous Page
                </button>
            <h1>Select your quiz options</h1>
            </header>
            <main className={css.main}>  
                <div className={css.topicLevels}>
                    {topic && <h2>Available Quiz Levels for {parsedTopic}</h2>}
                    <ul>
                        {levels && levels.map(level => {
                        return <button onClick={event => onLevelSelect(event, level)} key={level}>
                            <li>{level}</li>
                            </button>
                        } )}
                    </ul>
                </div>
                {namesList && 
                <div className={css.topicNames}>
                    <h2>Available Quizzes for {parsedTopic} at chosen difficulty level</h2>
                    <ul>
                    {namesList.map((nameUnit: QuizNameResponse) => 
                        <button onClick={(): Promise<boolean> => router.push({pathname: `/quiz/${nameUnit._id.toString()}`})} key={nameUnit._id}>
                            <li>{nameUnit.name}</li>
                        </button>
                        )}
                    </ul>
                    <AddQuiz refreshPageData={getQuizNames} setRequestStatus={setRequestStatus}/>
                    {requestStatus}
                </div>}

            </main>
            <footer className={css.footer}>
                    <GiCrossroad size={100} color="aqua" />
            </footer>
        </div>
    )
}

