import { useRouter } from "next/router"
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { QuizModel } from "../../components/quiz_forms";
import QuizManagerClient from "../quiz_manager_client";
import css from '../../styles/topic.module.scss';
import { GiCrossroad } from 'react-icons/gi';

interface QuizNameResponse {
    name: string;
    _id: string;
}

export default function TopicPage(): JSX.Element {
    const [namesList, setNamesList] = useState<QuizNameResponse[]>()
    const [levels, setLevels] = useState<string[] | undefined>();
    const [quizName, setQuizName] = useState<string>();
    const router = useRouter();
    const { query: { topic }, } = router;
    const correctedTopic = topic.toString().replace('_', ' ');
    useEffect(() => {

        topic && QuizManagerClient.getQuizLevels(topic.toString()).then(res => {
            setLevels(res.data.levels)

        }).catch(err => console.log(err));
    }, [])

    const getQuizNames = (namesSetter: Dispatch<SetStateAction<QuizNameResponse[]>>, topic: string, quizLevel: string) => {
        return QuizManagerClient.getQuizNames(topic, quizLevel).then(res => namesSetter(res.data.quizNames)).catch(err => console.log(err));
    }

    return (
        <div className={css.topicPage}>
            <header><h1>Select your quiz options</h1></header>
            <main className={css.main}>  
                <div className={css.topicLevels}>
                    {topic && <h2>Available Quiz Levels for {correctedTopic}</h2>}
                    <ul>
                        {levels && levels.map(quizLevel => {
                        return <button onClick={() => getQuizNames(setNamesList, topic.toString(), quizLevel)} key={quizLevel}>
                            <li>{quizLevel}</li>
                            </button>
                        } )}
                    </ul>
                </div>
                {namesList && 
                <div className={css.topicNames}>
                    <h2>Available Quizzes for {correctedTopic} at chosen difficulty level</h2>
                    <ul>
                    {namesList.map((nameUnit: QuizNameResponse) => 
                        <button onClick={(): Promise<boolean> => router.push({pathname: `/quiz/${nameUnit._id.toString()}`})} key={nameUnit._id}>
                            <li>{nameUnit.name}</li>
                        </button>
                        )}
                    </ul>
                </div>}
            </main>
            <footer className={css.footer}>
                    <GiCrossroad size={100} color="aqua" />
            </footer>
        </div>
    )
}

