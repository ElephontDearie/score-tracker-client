
import { Dispatch, FormEvent, MouseEvent, SetStateAction, useState } from 'react';
import css from './../styles/quiz_forms.module.scss';
import QuizManagerClient, { EditQuizEntity } from '../utils/quiz_manager_client';

export enum QuizTopic {
    Econ = "Economics",
    Comp = "Computer Engineering"
}

export enum QuizDifficulty {
    Easy = "easy",
    Medium = "intermediate",
    Hard = "advanced"
}
export interface QuestionRequiredFields {
    question: string;
    options: { a: string; b: string; c: string; }
    answer: Answer | {};
}

export interface QuizQuestion extends QuestionRequiredFields {
    _id: string;
    quizId: string;
    dateAdded: Date;
}

type QuestionOptionKeys = 'A' | 'B' | 'C';

export type Answer = {
    [key in QuestionOptionKeys]: string
}

export enum EditQuestionEntity {
    Answer = 'answer',
    Question = 'question'
}

export interface QuizModel {
    _id: string;
    topic: QuizTopic;
    name: string;
    difficultyLevel: QuizDifficulty;
    questions: QuizQuestion[];
}

interface QuizSelectButtonProps {
    clickHandler: ((event: MouseEvent) =>  JSX.Element) | (() => Promise<boolean>)
}

interface QuizQuestionScreenProps {
    quizQuestions: QuizQuestion[]
}

interface DeleteButtonProps {
    quizId: string;
    refreshQuestionsFn: () => void;
    questionId?: string;
}

interface PostQuestionProps {
    quizId?: string; 
    refreshPageFn?: () => void;
    questionSetter?: Dispatch<SetStateAction<QuestionRequiredFields[]>>;
}

interface EditEntityProps extends PostQuestionProps {
    questionId: string; 
    entityType: EditQuestionEntity;
}
interface EditQuizMetadataProps {
    quizId?: string;
    refreshQuestionsFn: () => void;
}

export const PostQuestionUnit = ({quizId, refreshPageFn, questionSetter}: PostQuestionProps) => {
    const [requestStatus, setRequestStatus] = useState<string>('');
    const [newQuestion, setNewQuestion] = useState<string>('');
    const [answer, setAnswer] = useState<string>('');
    const [option1, setOption1] = useState<string>('');
    const [option2, setOption2] = useState<string>('');


    const submitQuestionUnit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        console.log('q setter', questionSetter)

        const jumbledOptions = [answer, option1, option2].map(value => ({value, sort: Math.random()}))
                                .sort((a,b) => a.sort - b.sort)
                                .map(({value}) => value )

        const randomisedKeyValueOptions =  Object.assign.apply({}, ['A', 'B', 'C'].map((optionKey, index) => ({[optionKey]: jumbledOptions[index]})));
        const answerObject =  Object.fromEntries(Object.entries(randomisedKeyValueOptions).filter(([key, value]) => value == answer));
 
        QuizManagerClient.postQuestionUnit({
            quizId: quizId,
            question: newQuestion,
            options: randomisedKeyValueOptions,
            answer: answerObject
        }).then(res => {
            console.log(res)
            res.status == 201 && setRequestStatus("Success! New question added.") 
            refreshPageFn && refreshPageFn();
        }).catch(err => {
            console.log(err.response);
            setRequestStatus('Failed to create question.')
        })
    
       
    }
    const submitQuestionToQuizForm = (event: MouseEvent) => {
        event.preventDefault();
        console.log('q setter', questionSetter)

        const jumbledOptions = [answer, option1, option2].map(value => ({value, sort: Math.random()}))
                                .sort((a,b) => a.sort - b.sort)
                                .map(({value}) => value )

        const randomisedKeyValueOptions =  Object.assign.apply({}, ['A', 'B', 'C'].map((optionKey, index) => ({[optionKey]: jumbledOptions[index]})));
        const answerObject =  Object.fromEntries(Object.entries(randomisedKeyValueOptions).filter(([key, value]) => value == answer));
            const postObject = {
                question: newQuestion,
                options: randomisedKeyValueOptions,
                answer: answerObject
            }
            console.log(postObject)
            questionSetter(prevArray => [...prevArray, postObject])
    }

    return (
        questionSetter ? <>
        <fieldset className={css.postForm}>
            
                <label htmlFor="kerberosId">Type into the boxes below and click submit to create a new question</label>

                {textFormInput(newQuestion, setNewQuestion, "Question")}
                {textFormInput(answer, setAnswer,"Answer")}
                <div>Add 2 incorrect answer options
                    {textFormInput(option1, setOption1, "Incorrect Answer 1")}
                    {textFormInput(option2, setOption2, "Incorrect Answer 2")}
                </div>
                
            </fieldset>
            <button onClick={submitQuestionToQuizForm}>add question to quiz</button> 
                </>
            :
    <section>
        <form onSubmit={submitQuestionUnit} id="postQuestion">
            <fieldset className={css.postForm}>
                <label htmlFor="kerberosId">Type into the boxes below and click submit to create a new question</label>

                {textFormInput(newQuestion, setNewQuestion, "Question")}
                {textFormInput(answer, setAnswer,"Answer")}
                <div>Add 2 incorrect answer options
                    {textFormInput(option1, setOption1, "Incorrect Answer 1")}
                    {textFormInput(option2, setOption2, "Incorrect Answer 2")}
                </div>
                <input type="submit" value="submit" />
            </fieldset>
        </form>
        <span>{requestStatus}</span>
    </section>
    )
}

export const EditSingleEntity = ({quizId, questionId, refreshPageFn, entityType}: EditEntityProps) => {
    const [newValue, setNewValue] = useState<string>('');
    const [requestStatus, setRequestStatus] = useState<string>('');
    const [editClicked, setEditClicked] = useState<boolean>(false);

    const submitDetails = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        QuizManagerClient.editQuestionOrAnswerString(quizId, questionId, newValue, entityType)
            .then(res => {
                console.log(res)
                res.status == 204 && setRequestStatus(`Success! New ${entityType} edited.`) 
                refreshPageFn();
            }).catch(err => {
                console.log(err.response);
                setRequestStatus(`Failed to edit ${entityType}.`)
            })
    }
    return (
    <section>
        <button onClick={() => setEditClicked(prevState => !prevState)}>{editClicked ? 'Close enter box' : 'Edit '+ entityType}</button>
        {editClicked && <form onSubmit={submitDetails} id="editQuestionEntity">
            <fieldset className={css.questionBox}>
                {textFormInput(newValue, setNewValue, `new ${entityType}`)}
                <input type="submit" value="submit" />
            </fieldset>
        </form>}
        <span>{requestStatus}</span>
    </section>
    )
}

export const DeleteButton = ({quizId, refreshQuestionsFn, questionId}: DeleteButtonProps) => {
    const [requestStatus, setRequestStatus] = useState<string>();

    const clickDelete = () => {
        if (questionId) {
            QuizManagerClient.deleteQuestionUnit(quizId, questionId)
                .then(res => {
                    console.log(res)
                    res.status == 204 && setRequestStatus(`Success! Question deleted.`) 
                    refreshQuestionsFn();
                }).catch(err => {
                    console.log(err.response)
                    setRequestStatus(`Failed to delete question.`) 
                })
        } else {
            QuizManagerClient.deleteQuiz(quizId)
                .then(res => {
                    console.log(res)
                    res.status == 204 && setRequestStatus(`Success! Quiz deleted.`) 
                }).catch(err => {
                    console.log(err.response)
                    setRequestStatus(`Failed to delete quiz.`) 
                })
        }
    }
    return (
        <>
           <button onClick={clickDelete}>
           Delete {questionId ? 'Question' : 'Quiz'} 
           </button>
           {requestStatus}
        </>
    
    )
}


export const EditQuizMetadataButton = ({quizId, refreshQuestionsFn}: EditQuizMetadataProps) => {
    const [requestStatus, setRequestStatus] = useState<string>();

    const [editClicked, setEditClicked] = useState<boolean>(false);
    const [propertySubmit, setPropertySubmit] = useState<boolean>(false);
    const editableProperties: EditQuizEntity[] = Object.values(EditQuizEntity);

    const defaultValue = editableProperties[0];
    
    const [selected, setSelected] = useState<string>(defaultValue)
    const [newValue, setNewValue] = useState<string>('');

    const typeGuardedProperty = Object.values(EditQuizEntity).find(prop => prop == selected);

    const submitEditQuizRequest = (event: FormEvent) => {
        event.preventDefault();
        console.log(selected)
        console.log(newValue)
        

        QuizManagerClient.editQuiz(quizId, newValue, typeGuardedProperty).then(res => {
            res.status == 204 && setRequestStatus("Quiz attribute successfully edited.")
            refreshQuestionsFn();
        }).catch(err => {
            console.log(err);
            setRequestStatus("Oh no! The quiz could not be edited.")
        })
    }
    const propertyCheckHandler = (event: FormEvent) => {
        event.preventDefault();
        setPropertySubmit(prevState => !prevState)
    }

    return (
        <div>
            <button onClick={() => setEditClicked(prevState => !prevState)}>{editClicked ? 'Click to close edit box' : 'Edit Quiz'}</button>

            {editClicked && <form id="selectEditAttribute" onSubmit={propertyCheckHandler}>
            <label>Please select which Quiz property to edit:</label>
                <select id="editQuiz" name="editQuiz" defaultValue={selected} onChange={event => setSelected(event.target.value)}>
                    {editableProperties.map(property => 
                        <option key={property} value={property}>{property}</option>
                    )}
                </select>
                <input type="submit" value="select" />
            </form>}

            {editClicked && propertySubmit && <form id="inputNewValue" onSubmit={submitEditQuizRequest}>
                {selected == EditQuizEntity.Level ? 
                    <>
                        <select id="pickDifficulty" name="pickDifficulty" defaultValue={QuizDifficulty.Easy} onChange={event => setNewValue(event.target.value)}>
                            {Object.values(QuizDifficulty).map(level => <option key={level} value={level}>{level}</option>)}
                        </select>                    
                        <input type="submit" value="submit" />
                    </>

                    :
                    <>
                    {textFormInput(newValue, setNewValue, 'Replacement')}
                    <input type="submit" value="submit" />
                    </>}

            </form>}
            {requestStatus}
        </div>
    )
}


export const AddQuiz = ({refreshPageData, newLevel, setRequestStatus}: {refreshPageData: (level: string) => void, newLevel: string, setRequestStatus: Dispatch<SetStateAction<string>>}) => {
    const [addClicked, setAddClicked] = useState<boolean>(false);
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

    const [name, setName] = useState<string>('');
    const [topic, setTopic] = useState<string>('');
    const [level, setLevel] = useState<QuizDifficulty>();
    const [questionNumber, setQuestionNumber] = useState<number>(0);
    const [questionNumberDecided, setQuestionNumberDecided] = useState<boolean>(false);

    const [questions, setQuestions] = useState<QuestionRequiredFields[]>([]);
    const submitPostRequest = (event: FormEvent) => {
        event.preventDefault();
        setFormSubmitted(prevState => !prevState);

        QuizManagerClient.postQuiz({
            name,
            topic,
            difficultyLevel: level,
            questions
        }).then(res => {
            res.status == 201 && setRequestStatus('New Quiz added!')
            refreshPageData(newLevel)
        }).catch(err => {
            console.log(err.response);
            setRequestStatus('The quiz could not be created.')
        });
    }
    return (
        <div>
            <button onClick={() => setAddClicked(prevState => !prevState)}>{addClicked ? 'Close quiz submission form' : 'Add Quiz'}</button>
            {addClicked && !questionNumberDecided && <div>How many questions would you like to create?
                <form onSubmit={(event) => {
                    event.preventDefault(); 
                    if (questionNumber > 0) { 
                    setQuestionNumberDecided(prevState => !prevState)
                    }}}>
                    <input type="number" name="questionNumber" value={questionNumber} onChange={event => setQuestionNumber(parseInt(event.target.value))}/>
                     <input type="submit" value="submit question number" />
                </form>
            </div>}

            {questionNumberDecided && !formSubmitted && <form onSubmit={submitPostRequest}>
                <label>Please enter the fields below to submit a new quiz.</label>
                {textFormInput(name, setName, "Quiz Name")}
                {textFormInput(topic, setTopic, "Quiz Topic")}
                <select id="pickDifficulty" name="pickDifficulty" defaultValue={level} onChange={event => setLevel(event.target.value as QuizDifficulty)}>
                            {Object.values(QuizDifficulty).map(singleLevel => <option key={singleLevel} value={singleLevel}>{singleLevel}</option>)}
                        </select>          

                {Array.from({length: questionNumber}, (v, i) => 
                    <PostQuestionUnit questionSetter={setQuestions} key={i}/>
                )}
                <input type="submit" value="submit" />
            </form>}

        </div>       
    )

}



const isLevel = (suppliedObject: QuizDifficulty | string): suppliedObject is QuizDifficulty => { 
    return !!Object.values(QuizDifficulty).find(level => level == suppliedObject)
}

const textFormInput = (setterValue: string, setter: Dispatch<SetStateAction<string>>, label: string) => {
    return <p>
        <label htmlFor={label}>Enter {label}: </label>
        <input type="text"
                    value={setterValue}
                    placeholder={"enter " + label} 
                    onChange={(event): void => setter(event.target.value)}
                    id={setterValue} 
                    name={setterValue}
                    aria-required="true"
                    pattern=".{3,}"
                    title="At least 3 characters required"
                    required
                    />
    </p>  
}