import axios from 'axios';
import { prepareServerlessUrl } from 'next/dist/server/base-server';
import { useEffect, useState } from 'react';
import { UserLevel } from '../components/login';
import { QuizTopics, TopicGrid } from "../components/topic_grid";
import { UserBox } from '../components/user_box';
import { quizPath } from '../constants';
import standardCss from "../styles/standard.module.scss"
import mockData from "./dummy_data.json";
import QuizManagerClient from './quiz_manager_client';

export default function Home() {
  const [topics, setTopics] = useState<QuizTopics>();

  const [userLevel, setUserLevel] = useState<UserLevel>(UserLevel.Unauthenticated);
  const [username, setUsername] = useState<string>('Anonymous');
  const [score, setScore] = useState<number>(0);
  const [signedIn, setSignedIn] = useState<boolean>(false);

  useEffect(() => {
    const browserUsername = localStorage.getItem('username')
    const browserToken = sessionStorage.getItem('authToken');

    browserUsername && setUsername(browserUsername);
    if (browserToken) {
      const storedUserData: {userLevel: UserLevel, score: string} = JSON.parse(JSON.stringify(localStorage));
      setScore(parseInt(storedUserData.score));
      setUserLevel(storedUserData.userLevel);
      setSignedIn(true);
    }
    // axios.get(quizPath).then(res => setQuizData({quizzes: res.data}))
    QuizManagerClient.getQuizTopics().then(res => setTopics(res.data));
    // simulateDataLatency(3000).then(res => setQuizData(res));
  }, [])
  console.log(topics)
  

  return (
    <div className={standardCss.container}>
      <header>
        <h1 className={standardCss.title}>
          Welcome to your <a href="https://nextjs.org">Quiz Manager!</a>
        </h1>
        <h2>The Comprehensive Platform to Score Your Progress</h2>
        <link rel="icon" href="/favicon.ico" />
      </header>

      <main>
        <div>
          <UserBox username={username} setUsername={setUsername} access={userLevel} setUserLevelFn={setUserLevel} score={score} signedIn={signedIn} setSignedIn={setSignedIn}/>

          {!topics && <div className={standardCss.loadingSpinner}></div>}
          {/* {data &&  */}
          <TopicGrid topics={topics?.topics} />
        </div>
      </main>


      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel" className={standardCss.logo} />
        </a>
      </footer>

    </div>
  )
}

// const simulateDataLatency = (latencyDelayMilliseconnds: number): Promise<TopicGridProps> => {
//   return new Promise(resolve => 
//     setTimeout(() => { 
//       resolve(mockData)
//     }, latencyDelayMilliseconnds))
// }


