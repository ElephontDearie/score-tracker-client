import { useRouter } from "next/router";
import gridCss from "../styles/topic_grid.module.scss";
import { QuizModel } from "./quiz_forms";

// export interface TopicGridProps {
//     readonly topics: Topic[] | undefined;
// }


export interface QuizTopics {
    topics: string[] | undefined;
}

export const TopicGrid = ({topics}: QuizTopics): JSX.Element => {
    const router = useRouter();
    // const uniqueTopics = quizzes && [...new Set(quizzes.map(quiz => quiz.topic))];
    console.log(topics)
    return (
        <div className={gridCss.grid}>
            <p>What Areas to explore today?</p>
            {topics && topics.map(topic => {

                return (
                    <button key={topic} className={gridCss.card} onClick={(): Promise<boolean> => router.push({pathname: `/topic/${topic.replace(' ','_')}`})}>
                        <h3>&bull; {topic} &bull;</h3>
                        <p>{topic}</p>

                    </button>

                )
            })}
            </div>
    )
}
// &rarr;