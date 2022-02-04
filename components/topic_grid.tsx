import { useRouter } from "next/router";
import gridCss from "../styles/topic_grid.module.scss";

export interface QuizTopics {
    topics: string[] | undefined;
}

export const TopicGrid = ({topics}: QuizTopics): JSX.Element => {
    const router = useRouter();
    return (
        <div className={gridCss.grid}>
            <h2>What Areas to explore today?</h2>
            {topics && topics.map(topic => {

                return (
                    <button key={topic} className={gridCss.topic} 
                        onClick={(): Promise<boolean> => router.push({pathname: `/topic/${topic.replace(' ','_')}`})}>
                        <h3>&bull; {topic} &bull;</h3>

                    </button>

                )
            })}
            </div>
    )
}