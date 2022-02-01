import { LoginBox, LoginBoxProps, UserLevel } from "./login";
import css from '../styles/user_box.module.scss';
import React, { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import axios from "axios";
import { SecurityQuestionHandler } from "./user_forms";

interface UserBoxProps extends LoginBoxProps {
    username: string;
    access: UserLevel;
    score: number;
    signedIn: boolean;
}

export const UserBox = ({username, setUsername, access, setUserLevelFn, score, signedIn, setSignedIn}: UserBoxProps): JSX.Element => {
    const [showSecurity, setShowSecurity] = useState<boolean>(false);

    return (
        <section className={css.userSpace}>
            {!signedIn && <LoginBox username={username} setUsername={setUsername} setUserLevelFn={setUserLevelFn} setSignedIn={setSignedIn} />}
            <div className={css.box}>
                <span>{username || 'anonymous'}</span>
                <span className={applyAccessColour(access)}>Access: {access}</span>
                <span>Score: {score}</span>
                {!signedIn && <p>Please login to save your score</p>}

            </div>
            {signedIn && <div className={css.increaseAccess}>
                <p>Hover here to access more!</p>

                    <article className={css.accessButton}>
                        {addAccessOptions(access, setShowSecurity).map((property, index) => 
                            <div key={index}>

                                {property && <span key={index}> {property} </span>}
                                {showSecurity && React.isValidElement(property) && <SecurityQuestionHandler username={username} setUserLevelFn={setUserLevelFn} showSecurityFn={setShowSecurity} />}
                            </div>
                                
                            )
                        }
                    </article>

                    
            </div>}
        </section>
    )
}
const applyAccessColour = (access: UserLevel) => {
    switch(access) {
        case UserLevel.Restricted:
            return css.accessRestricted;
        case UserLevel.Limited:
            return css.accessLimited;
        case UserLevel.Unlimited:
            return css.accessUnlimited;
        default:
            return css.accessNotUser;
    }
}

interface AccessProps {
    username: string, 
    setUserLevel: Dispatch<SetStateAction<UserLevel>>
}

type AccessOptions = {
    [userLevel in UserLevel]: { cue: string; fn?: JSX.Element; };
};

const accessOptionsMap = (securitySetter: Dispatch<SetStateAction<boolean>>): AccessOptions  => ({
    [UserLevel.Unauthenticated]: { cue: 'Log in see quizzes' },
    [UserLevel.Restricted]: { 
        cue: 'Answer a security question to see quiz answers and begin adding to your score', 
        fn: <button onClick={() => securitySetter(prevState => !prevState)}> 
                    Answer Security Question
            </button>
    },
    [UserLevel.Limited]: {cue: 'Complete a quiz to add or edit quiz questions', fn: <button>Take my first quiz!</button>},
    [UserLevel.Unlimited]: {cue: 'Hooray! You can edit questions and answers! :)'}
})

const addAccessOptions = (access: UserLevel, securitySetter: Dispatch<SetStateAction<boolean>>): (string |JSX.Element)[] => {
    const accesses = accessOptionsMap(securitySetter)
    // const optionDisplayed = (userLevel: UserLevel) => Object.entries(accesses).find(([key, value]) => key == userLevel);
    const optionDisplayed = (userLevel: UserLevel) => Object.entries(accesses).find(([key, value]) => key == userLevel)[1];

    // console.log(optionDisplayed)
    
    let display: { cue: string; fn?: JSX.Element; };

    switch(access) {
        case UserLevel.Restricted:
            display = optionDisplayed(UserLevel.Restricted)
            return [display.cue, display.fn];
        case UserLevel.Limited:
            display = optionDisplayed(UserLevel.Limited)
            return [display.cue, display.fn];
        case UserLevel.Unlimited:
            return [optionDisplayed(UserLevel.Unlimited).cue]
        default:
            return [optionDisplayed(UserLevel.Unauthenticated).cue]
    }
}
