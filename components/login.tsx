import axios from "axios";
import { Dispatch, SetStateAction, useState, FormEvent } from "react";
import { loginPath, registerPath } from "../utils/constants";
import css from "../styles/login.module.scss";

export enum UserLevel {
    Unauthenticated = "Not Authenticated",
    Restricted = "Restricted",
    Limited = "Limited",
    Unlimited = "Unlimited"
}

interface UserSessionDetails {
    email: string;
    score: string;
    userLevel: UserLevel;
    authToken: string;
}

export interface LoginBoxProps {
    username: string;
    setUserLevelFn: (level: UserLevel) => void;
    setUsername: (name: string) => void;
    setSignedIn: Dispatch<SetStateAction<boolean>>;
}

interface LoginMessageProps extends LoginBoxProps {
    messageSetter: Dispatch<SetStateAction<string | null>>;
}

export const LoginBox = ({username, setUsername, setUserLevelFn, setSignedIn, messageSetter}: LoginMessageProps): JSX.Element => {
    const [password, setPassword] = useState<string>("");
    const [emailAdd, setEmailAdd] = useState<string>("");

    const [isLogin, setIsLogin] = useState<boolean>(true);

    const submitDetails = (event: FormEvent): void => {
        event.preventDefault();
        const user = {
            username: username,
            password: password,
            emailAddress: emailAdd
        }

        const requestPath = isLogin ? loginPath : registerPath;

        axios.post(requestPath, user)
            .then(response => {
                !isLogin && response.status == 201 && setIsLogin(prevState => !prevState);

                const receivedData: UserSessionDetails = JSON.parse(JSON.stringify(response.data));
                sessionStorage.setItem('authToken', receivedData.authToken);
                localStorage.setItem('username', username);
                localStorage.setItem('score', receivedData.score);
                localStorage.setItem('userLevel', receivedData.userLevel);
                setUserLevelFn(receivedData.userLevel);
                setSignedIn(true);
                messageSetter('Signed in')
            }).catch(error => {
                console.log(error);
                error.response && error.response.status == 404 && setIsLogin((prevState) => !prevState);
                console.log(isLogin)
            })
    }
    return (
        <form onSubmit={submitDetails} id="login">
            <fieldset className={css.loginBox}>
                <span>Login here!</span>
                {loginField('Username', username, setUsername, ".{5,}", "At least 5 characters required")}
                {loginField('Password', password, setPassword, "(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{6,}", "At least 6 characters with 1 lowercase letter, 1 uppercase letter, and 1 digit required")}
                {!isLogin && loginField('Email Address', emailAdd, setEmailAdd, ".+@[a-z0-9]+\.[a-z]{2,}$", "name@example.com format required", true)}
                <input type="submit" value="submit" className={css.submitButton} />
            </fieldset>
        </form>
    )
}

export const Logout = ({setSignedIn, setUsername, setUserLevel, messageSetter}: {setSignedIn: Dispatch<SetStateAction<boolean>>,
                                                                    setUserLevel, setUsername, messageSetter: Dispatch<SetStateAction<string>>}) => {


    const logoutHandler = () => {
        try {
            localStorage.removeItem('username');
            localStorage.setItem('userLevel', 'Unauthenticated');
            localStorage.removeItem('score');
            sessionStorage.removeItem('authToken')
            setSignedIn(false) 
            setUsername(null);
            setUserLevel(UserLevel.Unauthenticated);
            messageSetter('Successfully logged out.')
        } catch (err) {
            console.log(err);
            messageSetter('Error while logging out. Please clear your browser data manually.')
        }
    }
    return <button onClick={logoutHandler}>logout</button>
}

const loginField = (inputLabel: string, value: string, setter: Dispatch<SetStateAction<string>>, pattern: string, patternTitle: string, email?: boolean): JSX.Element => 
    <section>
        <label htmlFor={value}>{`${inputLabel}: `}</label>
        <input type={email ? "email" : "text"} value={value} placeholder={`enter ${inputLabel.toLowerCase()}`} pattern={pattern} title={patternTitle}
            aria-labelledby="login" aria-required="true" required 
            onChange={(event): void => setter(event.target.value)} />
    </section>
