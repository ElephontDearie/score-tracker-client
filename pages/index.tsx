import { useEffect, useState } from 'react';
import { UserLevel } from '../components/login';
import { QuizTopics, TopicGrid } from "../components/topic_grid";
import { UserBox } from '../components/user_box';
import QuizManagerClient from '../utils/quiz_manager_client';
import css from "../styles/index.module.scss"


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
    QuizManagerClient.getQuizTopics().then(res => setTopics(res.data));
  }, [])
  

  return (
    <div className={css.homePage}>
      <header>
        <div className={css.homeHeaders}>
        <h1 className={css.welcome}>
          Welcome to your Quiz Manager!
        </h1>
        <h4>The Comprehensive Platform to Score Your Progress</h4>
        </div>
        <div className={css.userBox}>
            <UserBox username={username} setUsername={setUsername} access={userLevel} setUserLevelFn={setUserLevel} score={score} 
                signedIn={signedIn} setSignedIn={setSignedIn}/>
          </div>
      </header>

      <main className={css.mainHome}>
        <div>

          {!topics && <div className={css.loadingSpinner}></div>}
          <TopicGrid topics={topics?.topics} />
        </div>
      </main>

      <footer className={css.provider}>
          <span>Hosted by WebbiSkools Ltd</span>
      </footer>
    </div>
  )
}


