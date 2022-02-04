import axios from "axios";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { securityPath } from "../utils/constants";
import css from '../styles/user_forms.module.scss';
import { UserLevel } from "./login";

const securityQuestion = 'What was the name of the first street you lived on?';

interface SecurityQuestion {
    securityQuestion: string;
    username: string;
}

interface SecurityHandlerProps {
    username: string;
    setUserLevelFn: Dispatch<SetStateAction<UserLevel>>;
    showSecurityFn: Dispatch<SetStateAction<boolean>>;
}

export const SecurityQuestionHandler = ({username, setUserLevelFn, showSecurityFn}: SecurityHandlerProps) => {
    const [securityAnswer, setSecurityAnswer] = useState<string>('');

    const submitDetails = (event: FormEvent) => {
        event.preventDefault();
        const securityDetails: SecurityQuestion = {
            securityQuestion: securityAnswer,
            username
        }

        axios.post(`${securityPath}/${username}`, securityDetails, {params: { username: username }})
            .then(response => {
                console.log(response.data);
                // !isLogin && response.status == 201 && setIsLogin(prevState => !prevState);


                const receivedData: {userLevel: UserLevel} = JSON.parse(JSON.stringify(response.data));
                console.log(receivedData)
                localStorage.setItem('userLevel', response.data.userLevel)
                setUserLevelFn(receivedData.userLevel);
                showSecurityFn(false);
            }).catch(error => {
                console.log(error);
                // error.response && error.response.status == 404 && setIsLogin((prevState) => !prevState);
                // console.log(isLogin)
            })
    }
    return (
    <form onSubmit={submitDetails} id="securityQuestion">
        <fieldset className={css.securityQuestion}>
            <label htmlFor={securityAnswer}>{securityQuestion}</label>
            <input type="text" value={securityAnswer} placeholder={`enter answer`}
                aria-labelledby="securityQuestion" aria-required="true" required 
                onChange={(event): void => setSecurityAnswer(event.target.value)} />
            <input type="submit" value="submit" />
        </fieldset>
    </form>
    )
}